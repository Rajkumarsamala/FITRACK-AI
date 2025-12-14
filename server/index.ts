// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";

import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { razorpayRoutes } from "./razorpayRoutes";
import { razorpayWebhook } from "./razorpayWebhook";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

// ------------------------------------------------------
// 1. SECURITY MIDDLEWARE (VERY IMPORTANT)
// ------------------------------------------------------

// Adds all important headers:
// - Strict-Transport-Security
// - X-Frame-Options
// - X-Content-Type-Options
// - Referrer-Policy
// - Permissions-Policy
// - X-XSS-Protection (legacy browser protection)
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP added manually below
  })
);

// Strong Content Security Policy (protects from XSS)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    },
  })
);

// Extra hardening (recommended)
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(
  helmet.permissionsPolicy({
    features: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  })
);

// Rate limiting (protect API abuse / bots)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // allow 50 req/min per IP
});
app.use(limiter);

// ------------------------------------------------------
// BASIC MIDDLEWARE
// ------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------
app.get("/healthz", (_req, res) => res.send("ok"));

// ------------------------------------------------------
// PUBLIC POLICY PAGES
// ------------------------------------------------------
const POLICY_DIR = path.join(__dirname, "policies");

app.get("/privacy", (_req, res) =>
  res.sendFile(path.join(POLICY_DIR, "privacy.html"))
);
app.get("/terms", (_req, res) =>
  res.sendFile(path.join(POLICY_DIR, "terms.html"))
);
app.get("/refund", (_req, res) =>
  res.sendFile(path.join(POLICY_DIR, "refund.html"))
);
app.get("/shipping", (_req, res) =>
  res.sendFile(path.join(POLICY_DIR, "shipping.html"))
);
app.get("/contact", (_req, res) =>
  res.sendFile(path.join(POLICY_DIR, "contact.html"))
);

// ------------------------------------------------------
// RAZORPAY ROUTES
// ------------------------------------------------------
app.use(razorpayRoutes);
app.use(razorpayWebhook);

// ------------------------------------------------------
// APP API ROUTES / DASHBOARD / AUTH
// ------------------------------------------------------
(async () => {
  await registerRoutes(httpServer, app);

  // ------------------------------------------------------
  // SAFE ERROR HANDLER (prevent internal info leak)
  // ------------------------------------------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err);
    res.status(err.status || 500).json({
      message: "Server error",
    });
  });

  // ------------------------------------------------------
  // STATIC FILES (frontend build)
  // ------------------------------------------------------
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000");
  httpServer.listen({ port, host: "0.0.0.0" }, () =>
    console.log("Serving on port", port)
  );
})();
