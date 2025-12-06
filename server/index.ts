// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path"; // ⬅️ added

// ⬇️ Razorpay routes
import { razorpayRoutes } from "./razorpayRoutes";
import { razorpayWebhook } from "./razorpayWebhook";

// If you use anything from storage elsewhere, keep this import
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger for /api paths
function log(message: string, source = "express") {
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
  const pathName = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  // @ts-ignore
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    // @ts-ignore
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathName.startsWith("/api")) {
      let logLine = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });

  next();
});

// ---------- Health + safe user endpoint ----------
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Guard /api/auth/user so it doesn't 500 when no OIDC/session
app.use("/api/auth/user", (req, res, next) => {
  const user: any = (req as any).user || null;
  if (!user) return res.json({ authenticated: false, user: null });
  next();
});

// ---------- Public Policy Pages (for Razorpay) ----------
const POLICY_DIR = path.join(process.cwd(), "server", "policies");

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

// ---------- Razorpay ----------
app.use(razorpayRoutes);
app.use(razorpayWebhook);

// ---------- Your existing app routes / static / dev server ----------
(async () => {
  await registerRoutes(httpServer, app);

  // Centralized error handler
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
    { port, host: "0.0.0.0", reusePort: true },
    () => log(`serving on port ${port}`)
  );
})();
