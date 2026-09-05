import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    openId: text("open_id").notNull(),
    name: text("name"),
    email: text("email"),
    loginMethod: text("login_method").notNull().default("chatgpt"),
    role: text("role", { enum: ["user", "admin"] })
      .notNull()
      .default("user"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    lastSignedIn: text("last_signed_in").notNull(),
  },
  table => [uniqueIndex("idx_users_open_id").on(table.openId)]
);

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    parentId: integer("parent_id"),
    icon: text("icon"),
    order: integer("display_order").notNull().default(0),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at").notNull(),
  },
  table => [uniqueIndex("idx_categories_slug").on(table.slug)]
);

export const listings = sqliteTable(
  "listings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    categoryId: integer("category_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    currency: text("currency").notNull().default("TRY"),
    city: text("city").notNull(),
    district: text("district"),
    neighborhood: text("neighborhood"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    images: text("images"),
    propertyType: text("property_type"),
    rooms: integer("rooms"),
    size: integer("size"),
    status: text("status", { enum: ["active", "sold", "deleted"] })
      .notNull()
      .default("active"),
    isFeatured: integer("is_featured").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    favoriteCount: integer("favorite_count").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  table => [
    index("idx_listings_status_created").on(table.status, table.createdAt),
    index("idx_listings_category_status").on(table.categoryId, table.status),
    index("idx_listings_city_status").on(table.city, table.status),
    index("idx_listings_user_status").on(table.userId, table.status),
  ]
);

export const favorites = sqliteTable(
  "favorites",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    listingId: integer("listing_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  table => [
    uniqueIndex("idx_favorites_user_listing").on(table.userId, table.listingId),
  ]
);

export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    listingId: integer("listing_id").notNull(),
    senderId: integer("sender_id").notNull(),
    receiverId: integer("receiver_id").notNull(),
    content: text("content").notNull(),
    isRead: integer("is_read").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  table => [
    index("idx_messages_sender_created").on(table.senderId, table.createdAt),
    index("idx_messages_receiver_created").on(
      table.receiverId,
      table.createdAt
    ),
    index("idx_messages_listing").on(table.listingId),
  ]
);

export const reports = sqliteTable(
  "reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    listingId: integer("listing_id").notNull(),
    reporterId: integer("reporter_id").notNull(),
    reason: text("reason").notNull(),
    description: text("description"),
    status: text("status", { enum: ["pending", "reviewed", "resolved"] })
      .notNull()
      .default("pending"),
    createdAt: text("created_at").notNull(),
  },
  table => [
    index("idx_reports_status_created").on(table.status, table.createdAt),
  ]
);

export const savedSearches = sqliteTable(
  "saved_searches",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    name: text("name").notNull(),
    filters: text("filters").notNull(),
    isActive: integer("is_active").notNull().default(1),
    emailNotifications: integer("email_notifications").notNull().default(0),
    lastNotifiedAt: text("last_notified_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  table => [
    index("idx_saved_searches_user_created").on(table.userId, table.createdAt),
  ]
);
