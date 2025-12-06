// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";

// Razorpay routes
import { razorpayRoutes } from "./razorpayRoutes";
import { razorpayWebhook } from "./razorpayWebhook";

// Storage
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger
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
  let capturedJsonResponse: any;

  const originalJson = res.json;
  // @ts-ignore
  res.json = function (body, ...args) {
    capturedJsonResponse = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (pathName.startsWith("/api")) {
      const ms = Date.now() - start;
      let txt = `${req.method} ${pathName} ${res.statusCode} in ${ms}ms`;
      if (capturedJsonResponse) txt += " :: " + JSON.stringify(capturedJsonResponse);
      log(txt);
    }
  });

  next();
});

// ---------- Health ----------
app.get("/healthz", (_req, res) => res.send("ok"));

// Safe fallback for /api/auth/user
app.use("/api/auth/user", (req, res, next) => {
  const user = (req as any).user || null;
  if (!user) return res.json({ authenticated: false, user: null });
  next();
});

// ---------- PUBLIC POLICY PAGES (Fix 404) ----------
const POLICY_DIR = path.join(__dirname, "policies");  
// __dirname = /opt/render/project/src/server at runtime

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

// ---------- App Routes / Static / Vite ----------
(async () => {
  await registerRoutes(httpServer, app);

  // Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server Error" });
    console.error(err);
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000");
  httpServer.listen(
    { port, host: "0.0.0.0" },
    () => log(`serving on port ${port}`)
  );
})();
