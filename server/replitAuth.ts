import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { authStorage } from "./auth-storage";

// For local development, don't require REPLIT_DOMAINS
if (!process.env.REPLIT_DOMAINS) {
  console.warn("Environment variable REPLIT_DOMAINS not provided, using default localhost");
  process.env.REPLIT_DOMAINS = "localhost";
}

// Cache OIDC configuration for 1 hour
const getOidcConfig = memoize(
  async () => {
    // In development mode with no REPL_ID, use a mock configuration
    if (!process.env.REPL_ID && process.env.NODE_ENV === 'development') {
      console.log("Running in local development mode with mock OIDC configuration");
      return {
        issuer: 'https://localhost/oidc',
        authorization_endpoint: 'https://localhost/auth',
        token_endpoint: 'https://localhost/token',
        jwks_uri: 'https://localhost/jwks',
        userinfo_endpoint: 'https://localhost/userinfo'
      };
    }
    
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID || 'local-dev'
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "sessions",
    ttl: sessionTtl,
  });
  return session({
    secret: process.env.SESSION_SECRET || "replit-auth-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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

async function upsertUser(
  claims: any,
) {
  // First check if user already exists to preserve admin status
  const existingUser = await authStorage.getUser(claims["sub"]);
  
  const user = await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    fullName: claims["first_name"] ? `${claims["first_name"]} ${claims["last_name"] || ""}`.trim() : null,
    profileImage: claims["profile_image_url"],
    // Preserve existing admin status if user exists
    isAdmin: existingUser ? existingUser.isAdmin : false
  });

  return user;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user: any = {};
      updateUserSession(user, tokens);
      
      // Store user in database
      const dbUser = await upsertUser(tokens.claims());
      
      // Add database user info to session user
      user.dbUser = dbUser;
      
      verified(null, user);
    } catch (error) {
      console.error("Authentication error:", error);
      verified(error as Error);
    }
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
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

  // Add user info route
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user.dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Check admin status
  app.get("/api/auth/check-admin", async (req: any, res) => {
    try {
      if (req.isAuthenticated() && req.user && req.user.dbUser && req.user.dbUser.isAdmin) {
        return res.status(200).json({ isAdmin: true });
      }
      return res.status(200).json({ isAdmin: false });
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(200).json({ isAdmin: false });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await config.refresh(refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    console.error("Token refresh failed:", error);
    return res.redirect("/api/login");
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  // Check session-based admin access first (for traditional login)
  if (req.session && req.session.isAdmin) {
    return next();
  }
  
  // Check authenticated user admin status (for OAuth login)
  if (req.isAuthenticated() && (req.user as any)?.dbUser?.isAdmin) {
    return next();
  }
  
  return res.status(403).json({ message: "Access denied" });
};