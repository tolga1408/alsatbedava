import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories table (hierarchical structure like Sahibinden)
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  parentId: int("parentId"), // null for top-level categories
  icon: varchar("icon", { length: 50 }), // icon name for UI
  order: int("order").default(0).notNull(), // display order
  isActive: int("isActive").default(1).notNull(), // 1 = true, 0 = false
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Listings table (core marketplace entity)
export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // seller
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(), // in TL (cents), e.g., 50000 = 500.00 TL
  currency: varchar("currency", { length: 3 }).default("TRY").notNull(),
  
  // Location
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  
  // Images (JSON array of S3 URLs)
  images: text("images"), // JSON: ["url1", "url2", ...]
  
  // Status
  status: mysqlEnum("status", ["active", "sold", "deleted"]).default("active").notNull(),
  isFeatured: int("isFeatured").default(0).notNull(), // 1 = true, 0 = false
  
  // Metrics
  viewCount: int("viewCount").default(0).notNull(),
  favoriteCount: int("favoriteCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;

// Favorites table (users can save listings)
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  listingId: int("listingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

// Messages table (buyer-seller communication)
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: int("isRead").default(0).notNull(), // 1 = true, 0 = false
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Reports table (moderation)
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  reporterId: int("reporterId").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(), // "spam", "fraud", "inappropriate", etc.
  description: text("description"),
  status: mysqlEnum("status", ["pending", "reviewed", "resolved"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;