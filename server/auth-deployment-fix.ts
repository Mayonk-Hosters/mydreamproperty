// Production deployment authentication solution
import { Request, Response, NextFunction } from 'express';

// Enhanced authentication middleware for production deployment
export const createAdminMiddleware = () => {
  return (req: any, res: Response, next: NextFunction) => {
    // Development mode - always allow access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - granting admin access');
      return next();
    }

    // Production authentication checks
    const authChecks = [
      // Check session-based admin access
      () => req.session && req.session.isAdmin,
      
      // Check authenticated user with admin privileges
      () => req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin,
      
      // Check user object with admin property
      () => req.user && req.user.isAdmin,
      
      // Check session user with admin username
      () => req.session && req.session.user && req.session.user.username === 'ahmednagarproperty',
      
      // Check passport session
      () => req.session && req.session.passport && req.session.passport.user,
      
      // Check if user ID matches admin user ID (4)
      () => req.session && req.session.passport && req.session.passport.user === 4,
      
      // Check Authorization header for API key
      () => {
        const auth = req.headers.authorization;
        return auth && auth === 'Bearer admin-api-key-' + process.env.ADMIN_SECRET;
      }
    ];

    // Log detailed authentication state
    console.log('Production authentication check:', {
      hasSession: !!req.session,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      isAdmin: req.session?.isAdmin,
      hasUser: !!req.user,
      passportUser: req.session?.passport?.user,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // Test each authentication method
    for (let i = 0; i < authChecks.length; i++) {
      if (authChecks[i]()) {
        console.log(`Admin access granted via method ${i + 1}`);
        return next();
      }
    }

    // If no authentication method succeeds, deny access
    console.log('Admin access denied - no valid authentication found');
    return res.status(403).json({ 
      message: "Admin access required", 
      error: "ADMIN_ACCESS_DENIED",
      hint: "Please log in with admin credentials first"
    });
  };
};

// Create the middleware instance
export const requireAdminAuth = createAdminMiddleware();