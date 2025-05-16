import { users, type User, type UpsertUser } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq } from "drizzle-orm";
import { db, pool } from "./db/index";

// Database storage for authentication
export class AuthStorage {
  public sessionStore: session.Store;

  constructor() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    this.sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  }

  // User methods for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Transform OpenID claims to match our database schema
    const userInsert = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName || (userData as any).firstName, // Support both formats
      profileImage: userData.profileImage || (userData as any).profileImageUrl,
      isAdmin: userData.isAdmin || false,
      // Keep existing username/password if this is an update
      username: userData.username || userData.email, // Use email as username if not provided
      // Don't set password for OAuth users
    };
    
    const [user] = await db
      .insert(users)
      .values(userInsert)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userInsert,
          // Don't override existing password during update
        },
      })
      .returning();
    return user;
  }
}

// Export a single instance of the auth storage
export const authStorage = new AuthStorage();