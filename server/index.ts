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
// 1. SECURITY MIDDLEWARE
// ------------------------------------------------------

// Basic helmet protections
app.use(
  helmet({
    contentSecurityPolicy: false, // using custom CSP
  })
);

// Custom, safe CSP (DO NOT TOUCH unless needed)
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
      baseUri: ["'self'"],
      formAction: ["'self'"], 
    },
  })
);

// Referrer policy
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));

// Permissions policy
app.use(
  helmet.permissionsPolicy({
    features: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  })
);

// Rate limit: prevents backend abuse
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 50,
  })
);

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
// STATIC POLICY PAGES
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
// PAYMENT ROUTES
// ------------------------------------------------------
app.use(razorpayRoutes);
app.use(razorpayWebhook);

// ------------------------------------------------------
// MAIN APP API
// ------------------------------------------------------
(async () => {
  await registerRoutes(httpServer, app);

  // ------------------------------------------------------
  // SAFE ERROR HANDLER
  // ------------------------------------------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err);
    res.status(err.status || 500).json({
      message: "Server error",
    });
  });

  // ------------------------------------------------------
  // SERVE FRONTEND
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
