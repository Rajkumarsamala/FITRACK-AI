import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import type { InsertBodyScan } from "@shared/schema";
import { getUncachableStripeClient } from "./stripeClient";

const PREMIUM_PRICE_AMOUNT = 999;
const PREMIUM_PRODUCT_NAME = "FitTrack AI Premium";
const PREMIUM_PRODUCT_DESC = "Unlimited AI body scans, personalized recommendations, and progress tracking";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getSubscription(userId);
      res.json(subscription || { status: 'inactive', plan: 'free' });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get('/api/trial-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getTrialUsage(userId);
      res.json(usage || { bodyScanUsed: false });
    } catch (error) {
      console.error("Error fetching trial usage:", error);
      res.status(500).json({ message: "Failed to fetch trial usage" });
    }
  });

  app.post('/api/trial-usage/use', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingUsage = await storage.getTrialUsage(userId);
      
      if (existingUsage?.bodyScanUsed) {
        return res.status(400).json({ message: "Free trial already used" });
      }
      
      const usage = await storage.useFreeTrial(userId);
      res.json(usage);
    } catch (error) {
      console.error("Error using free trial:", error);
      res.status(500).json({ message: "Failed to use free trial" });
    }
  });

  app.get('/api/body-scans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scans = await storage.getBodyScans(userId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching body scans:", error);
      res.status(500).json({ message: "Failed to fetch body scans" });
    }
  });

  app.post('/api/body-scans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const subscription = await storage.getSubscription(userId);
      const trialUsage = await storage.getTrialUsage(userId);
      
      const isPremium = subscription?.status === 'active' && subscription?.plan === 'premium';
      const canUseFreeTrial = !trialUsage?.bodyScanUsed;
      
      if (!isPremium && !canUseFreeTrial) {
        return res.status(403).json({ 
          message: "Premium subscription required",
          requiresUpgrade: true 
        });
      }

      const scanData: InsertBodyScan = {
        userId,
        postureScore: req.body.postureScore,
        shoulderAlignment: req.body.shoulderAlignment,
        hipAlignment: req.body.hipAlignment,
        spineAlignment: req.body.spineAlignment,
        headPosition: req.body.headPosition,
        bodySymmetry: req.body.bodySymmetry,
        overallAssessment: req.body.overallAssessment,
        recommendations: req.body.recommendations,
        landmarks: req.body.landmarks,
      };

      const scan = await storage.createBodyScan(scanData);
      
      if (!isPremium && canUseFreeTrial) {
        await storage.useFreeTrial(userId);
      }
      
      res.json(scan);
    } catch (error) {
      console.error("Error creating body scan:", error);
      res.status(500).json({ message: "Failed to create body scan" });
    }
  });

  app.get('/api/can-scan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getSubscription(userId);
      const trialUsage = await storage.getTrialUsage(userId);
      
      const isPremium = subscription?.status === 'active' && subscription?.plan === 'premium';
      const canUseFreeTrial = !trialUsage?.bodyScanUsed;
      
      res.json({
        canScan: isPremium || canUseFreeTrial,
        isPremium,
        trialAvailable: canUseFreeTrial,
        trialUsed: trialUsage?.bodyScanUsed || false,
      });
    } catch (error) {
      console.error("Error checking scan permission:", error);
      res.status(500).json({ message: "Failed to check scan permission" });
    }
  });

  app.get('/api/create-checkout-session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

      let customerId: string;
      const existingSub = await storage.getSubscription(userId);
      
      if (existingSub?.stripeCustomerId) {
        customerId = existingSub.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserStripeCustomerId(userId, customerId);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: PREMIUM_PRODUCT_NAME,
                description: PREMIUM_PRODUCT_DESC,
              },
              unit_amount: PREMIUM_PRICE_AMOUNT,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${baseUrl}/premium?success=true`,
        cancel_url: `${baseUrl}/premium?canceled=true`,
        metadata: {
          userId,
        },
      });

      res.redirect(session.url!);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.get('/api/customer-portal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getSubscription(userId);
      
      if (!subscription?.stripeCustomerId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${baseUrl}/premium`,
      });

      res.redirect(session.url);
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  return httpServer;
}
