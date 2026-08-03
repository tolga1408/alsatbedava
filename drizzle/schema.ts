import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  parentId: int("parentId"),
  icon: varchar("icon", { length: 50 }),
  order: int("order").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(),
  currency: varchar("currency", { length: 3 }).default("TRY").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  images: text("images"),
  status: mysqlEnum("status", ["active", "sold", "deleted"]).default("active").notNull(),
  isFeatured: int("isFeatured").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  favoriteCount: int("favoriteCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  listingId: int("listingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  reporterId: int("reporterId").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "reviewed", "resolved"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export const savedSearches = mysqlTable("savedSearches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  filters: text("filters").notNull(),
  emailNotifications: int("emailNotifications").default(0).notNull(),
  lastNotifiedAt: timestamp("lastNotifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;
