// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";

import { razorpayRoutes } from "./razorpayRoutes";
import { razorpayWebhook } from "./razorpayWebhook";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

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
// PUBLIC POLICY PAGES (must be BEFORE ANY OTHER ROUTES)
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

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
    console.error(err);
  });

  // ------------------------------------------------------
  // STATIC FILES (frontend build) — MUST BE LAST
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
