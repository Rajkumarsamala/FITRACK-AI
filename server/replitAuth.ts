// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// ✅ OIDC is only enabled if REPL_ID exists (Replit). On Render it's undefined.
const OIDC_ENABLED = !!process.env.REPL_ID;

/* -------------------- Sessions (kept for both modes) -------------------- */
const getOidcConfig = memoize(
  async () => {
    // This function is only called when OIDC_ENABLED === true
    const issuer = new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc");
    return client.discovery(issuer, process.env.REPL_ID!);
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

/* -------------------- Main setup -------------------- */
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (!OIDC_ENABLED) {
    console.log("[auth] OIDC disabled (REPL_ID not set). Running without Replit OIDC.");
    // Lightweight routes so frontend doesn’t error if it calls them.
    app.get("/api/login", (_req, res) =>
      res.status(501).json({ message: "OIDC is disabled on this deployment." })
    );
    app.get("/api/callback", (_req, res) => res.redirect("/"));
    app.get("/api/logout", (req, res) => req.logout(() => res.redirect("/")));
    return; // ✅ Skip all OIDC wiring
  }

  // --- OIDC path (only on Replit / when REPL_ID exists) ---
  let config: Awaited<ReturnType<typeof getOidcConfig>>;
  try {
    console.log("[auth] Discovering OIDC config for REPL_ID:", process.env.REPL_ID);
    config = await getOidcConfig();
    console.log("[auth] OIDC config discovered successfully");
  } catch (error) {
    console.error("[auth] Failed to setup auth - OIDC discovery failed:", error);
    // Do NOT crash the server; just run without OIDC.
    return;
  }

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const callbackURL = `https://${domain}/api/callback`;
      console.log("[auth] Registering strategy for domain:", domain, "with callback:", callbackURL);
      const strategy = new Strategy(
        { name: strategyName, config, scope: "openid email profile offline_access", callbackURL },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

/* -------------------- Guarded auth middleware -------------------- */
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!OIDC_ENABLED) {
    // In non-OIDC deployments, let requests pass (or change to 401 if you prefer).
    return next();
  }

  const user = req.user as any;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) return next();

  const refreshToken = user.refresh_token;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
