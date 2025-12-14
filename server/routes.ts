import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import type { InsertBodyScan } from "@shared/schema";
import { getUncachableStripeClient } from "./stripeClient";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function getPremiumPriceId(): Promise<string | null> {
  try {
    const result = await db.execute(
      sql`SELECT id FROM stripe.prices 
          WHERE active = true 
          AND product IN (
            SELECT id FROM stripe.products WHERE name = 'FitTrack AI Premium' AND active = true
          )
          ORDER BY created DESC 
          LIMIT 1`
    );
    return (result.rows[0] as any)?.id || null;
  } catch (error) {
    console.error('Error fetching premium price:', error);
    return null;
  }
}

function safeUser(req: any, res: any): string | null {
  if (!req.user || !req.user.claims || !req.user.claims.sub) {
    res.status(401).json({ error: "Unauthorized: Missing user claims" });
    return null;
  }
  return req.user.claims.sub;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    const userId = safeUser(req, res);
    if (!userId) return;

    try {
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    const userId = safeUser(req, res);
    if (!userId) return;

    try {
      const subscription = await storage.getSubscription(userId);
      res.json(subscription || { status: 'inactive', plan: 'free' });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get('/api/trial-usage', isAuthenticated, async (req: any, res) => {
    const userId = safeUser(req, res);
    if (!userId) return;

    try {
      const usage = await storage.getTrialUsage(userId);
      res.json(usage || { bodyScanUsed: false });
    } catch (error) {
      console.error("Error fetching trial usage:", error);
      res.status(500).json({ message: "Failed to fetch trial usage" });
    }
  });

  app.post('/api/trial-usage/use', isAuthenticated, async (req: any, res) => {
    const userId = safeUser(req, res);
    if (!userId) return;

    try {
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
    const userId = safeUser(req, res);
    if (!userId) return;

    try {
      const scans = await storage.getBodyScans(userId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching body scans:", error);
      res.status(500).json({ message: "Failed to fetch body scans" });
    }
  });

  app.post('/api/body-scans', isAuthenticated, async (req: any, res) => {
    const userId = safeUser(req, res);
    if (!userId) return;

    try {
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
    const userId = safeUser(req, res);
    if (!userId) return;

    try {
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

  return httpServer;
}
