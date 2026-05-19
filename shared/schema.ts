import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  boolean,
  integer,
  text,
  real,
} from "drizzle-orm/pg-core";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  status: varchar("status", { length: 50 }).notNull().default("inactive"),
  plan: varchar("plan", { length: 50 }).notNull().default("free"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bodyScans = pgTable("body_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  scanDate: timestamp("scan_date").defaultNow(),
  postureScore: real("posture_score"),
  shoulderAlignment: real("shoulder_alignment"),
  hipAlignment: real("hip_alignment"),
  spineAlignment: real("spine_alignment"),
  headPosition: real("head_position"),
  bodySymmetry: real("body_symmetry"),
  overallAssessment: text("overall_assessment"),
  recommendations: jsonb("recommendations"),
  landmarks: jsonb("landmarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trialUsage = pgTable("trial_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  bodyScanUsed: boolean("body_scan_used").notNull().default(false),
  bodyScanDate: timestamp("body_scan_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  bodyScans: many(bodyScans),
  trialUsage: one(trialUsage, {
    fields: [users.id],
    references: [trialUsage.userId],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const bodyScansRelations = relations(bodyScans, ({ one }) => ({
  user: one(users, {
    fields: [bodyScans.userId],
    references: [users.id],
  }),
}));

export const trialUsageRelations = relations(trialUsage, ({ one }) => ({
  user: one(users, {
    fields: [trialUsage.userId],
    references: [users.id],
  }),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type BodyScan = typeof bodyScans.$inferSelect;
export type InsertBodyScan = typeof bodyScans.$inferInsert;
export type TrialUsage = typeof trialUsage.$inferSelect;
export type InsertTrialUsage = typeof trialUsage.$inferInsert;
