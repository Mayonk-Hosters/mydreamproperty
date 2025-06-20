import 'express-session';

declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
    userType?: string;
    user?: any;
    passport?: any;
  }
}