import { eq, and, or, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  listings, 
  InsertListing,
  categories,
  favorites,
  messages,
  reports 
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Listing queries
export async function createListing(listing: InsertListing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(listings).values(listing);
  return result.insertId;
}

export async function getListingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return listing;
}

export async function getListingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(listings).where(eq(listings.userId, userId)).orderBy(listings.createdAt);
}

export async function searchListings(params: {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (params.categoryId) {
    conditions.push(eq(listings.categoryId, params.categoryId));
  }
  if (params.status) {
    conditions.push(eq(listings.status, params.status as any));
  }
  if (params.city) {
    conditions.push(eq(listings.city, params.city));
  }
  
  let query = db.select().from(listings);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const results = await query.orderBy(listings.createdAt).limit(params.limit || 20).offset(params.offset || 0);
  
  return results;
}

export async function updateListing(id: number, updates: Partial<InsertListing>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(listings).set(updates).where(eq(listings.id, id));
}

export async function deleteListing(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(listings).where(eq(listings.id, id));
}

// Category queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return category;
}

// Favorites queries
export async function addFavorite(userId: number, listingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(favorites).values({ userId, listingId });
}

export async function removeFavorite(userId: number, listingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(favorites).where(
    and(
      eq(favorites.userId, userId),
      eq(favorites.listingId, listingId)
    )
  );
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(favorites).where(eq(favorites.userId, userId));
}

// Message functions
export async function sendMessage(data: {
  senderId: number;
  receiverId: number;
  listingId: number;
  content: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all messages where user is sender or receiver
  const allMessages = await db
    .select()
    .from(messages)
    .where(
      or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      )
    )
    .orderBy(desc(messages.createdAt));
  
  // Group by conversation partner
  const conversationsMap = new Map();
  
  for (const msg of allMessages) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    
    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, {
        partnerId,
        listingId: msg.listingId,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount: msg.receiverId === userId && !msg.isRead ? 1 : 0,
      });
    } else if (msg.receiverId === userId && !msg.isRead) {
      const conv = conversationsMap.get(partnerId);
      conv.unreadCount += 1;
    }
  }
  
  return Array.from(conversationsMap.values());
}

export async function getConversationMessages(userId: number, partnerId: number, listingId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const msgs = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.listingId, listingId),
        or(
          and(
            eq(messages.senderId, userId),
            eq(messages.receiverId, partnerId)
          ),
          and(
            eq(messages.senderId, partnerId),
            eq(messages.receiverId, userId)
          )
        )
      )
    )
    .orderBy(messages.createdAt);
  
  // Mark messages as read
  await db
    .update(messages)
    .set({ isRead: 1 })
    .where(
      and(
        eq(messages.receiverId, userId),
        eq(messages.senderId, partnerId),
        eq(messages.listingId, listingId)
      )
    );
  
  return msgs;
}
