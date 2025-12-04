import {
  users,
  subscriptions,
  bodyScans,
  trialUsage,
  type User,
  type UpsertUser,
  type Subscription,
  type InsertSubscription,
  type BodyScan,
  type InsertBodyScan,
  type TrialUsage,
  type InsertTrialUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  updateUserStripeCustomerId(userId: string, customerId: string): Promise<User>;
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  upsertSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getBodyScans(userId: string): Promise<BodyScan[]>;
  createBodyScan(scan: InsertBodyScan): Promise<BodyScan>;
  getTrialUsage(userId: string): Promise<TrialUsage | undefined>;
  useFreeTrial(userId: string): Promise<TrialUsage>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const result = await db.execute(
      sql`SELECT u.* FROM users u 
          JOIN subscriptions s ON s.user_id = u.id 
          WHERE s.stripe_customer_id = ${customerId} 
          LIMIT 1`
    );
    return result.rows[0] as User | undefined;
  }

  async updateUserStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const existingSub = await this.getSubscription(userId);
    if (existingSub) {
      await db
        .update(subscriptions)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId));
    } else {
      await db.insert(subscriptions).values({
        userId,
        stripeCustomerId: customerId,
        status: 'inactive',
        plan: 'free',
      });
    }
    return (await this.getUser(userId))!;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return subscription;
  }

  async upsertSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          ...subscriptionData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return subscription;
  }

  async getBodyScans(userId: string): Promise<BodyScan[]> {
    return db
      .select()
      .from(bodyScans)
      .where(eq(bodyScans.userId, userId))
      .orderBy(desc(bodyScans.scanDate));
  }

  async createBodyScan(scanData: InsertBodyScan): Promise<BodyScan> {
    const [scan] = await db.insert(bodyScans).values(scanData).returning();
    return scan;
  }

  async getTrialUsage(userId: string): Promise<TrialUsage | undefined> {
    const [usage] = await db
      .select()
      .from(trialUsage)
      .where(eq(trialUsage.userId, userId));
    return usage;
  }

  async useFreeTrial(userId: string): Promise<TrialUsage> {
    const [usage] = await db
      .insert(trialUsage)
      .values({
        userId,
        bodyScanUsed: true,
        bodyScanDate: new Date(),
      })
      .onConflictDoUpdate({
        target: trialUsage.userId,
        set: {
          bodyScanUsed: true,
          bodyScanDate: new Date(),
        },
      })
      .returning();
    return usage;
  }
}

export const storage = new DatabaseStorage();
