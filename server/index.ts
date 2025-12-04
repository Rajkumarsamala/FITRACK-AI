import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runMigrations } from 'stripe-replit-sync';
import { WebhookHandlers } from "./webhookHandlers";
import { getStripeSync, getUncachableStripeClient } from "./stripeClient";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

let webhookSecretGlobal: string | null = null;

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('DATABASE_URL not set, skipping Stripe initialization');
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    console.log('Setting up managed webhook...');
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const webhookUrl = `${webhookBaseUrl}/api/webhook/stripe`;
    try {
      const stripe = await getUncachableStripeClient();

      const existingWebhooks = await stripe.webhookEndpoints.list();
      const existingWebhook = existingWebhooks.data.find(w =>
        w.url === webhookUrl && w.metadata?.managed_by === 'stripe-sync'
      );

      if (existingWebhook) {
        await stripe.webhookEndpoints.del(existingWebhook.id);
        console.log('Deleted old webhook to create fresh one with secret');
      }

      const newWebhook = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: ['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted'],
        description: 'Managed webhook for FitTrack AI',
        metadata: { managed_by: 'stripe-sync' }
      });

      webhookSecretGlobal = newWebhook.secret || null;
      console.log('Webhook configured:', newWebhook.url);
      if (webhookSecretGlobal) {
        console.log('Webhook secret captured for verification');
      }
    } catch (webhookErr) {
      console.log('Managed webhook setup error:', webhookErr);
    }

    console.log('Syncing Stripe data in background...');
    stripeSync.syncBackfill()
      .then(() => {
        console.log('Stripe data synced');
      })
      .catch((err: any) => {
        console.error('Error syncing Stripe data:', err);
      });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

initStripe().catch(console.error);

// Stripe webhook (raw body first)
app.post(
  '/api/webhook/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) return res.status(400).json({ error: 'Missing stripe-signature' });

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer.');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      const stripe = await getUncachableStripeClient();
      if (!webhookSecretGlobal) {
        console.error('Webhook secret not available - cannot verify signature');
        return res.status(500).json({ error: 'Webhook not properly configured' });
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecretGlobal);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (userId && subscriptionId) {
          await storage.upsertSubscription({
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: 'active',
            plan: 'premium',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
          console.log(`Subscription activated for user ${userId}`);
        }
      } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;
        const existingSub = await storage.getSubscriptionByStripeId(subscription.id);

        if (existingSub) {
          const isActive = subscription.status === 'active';
          await storage.upsertSubscription({
            userId: existingSub.userId,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            status: isActive ? 'active' : 'inactive',
            plan: isActive ? 'premium' : 'free',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
          console.log(`Subscription ${isActive ? 'updated' : 'cancelled'} for user ${existingSub.userId}`);
        }
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

// JSON parser (after raw handler)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

/* -------------------- ⭐ ADDED: health + safe user endpoint -------------------- */

// Health check for Render
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// Guard /api/auth/user so it doesn't 500 when no OIDC/session
app.use('/api/auth/user', (req, res, next) => {
  const user: any = (req as any).user || null;
  if (!user) {
    return res.json({ authenticated: false, user: null });
  }
  // let the original route (in registerRoutes) handle when logged in
  next();
});
/* ----------------------------------------------------------------------------- */

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
