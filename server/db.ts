import { eq, and, or, desc, sql, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  listings,
  InsertListing,
  categories,
  favorites,
  messages,
  reports,
  savedSearches,
  InsertSavedSearch,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { parseListingSearch } from "../shared/listingSearch";

let _db: ReturnType<typeof drizzle> | null = null;

const demoDate = () => new Date();

const demoCategories = [
  {
    id: 1,
    name: "Emlak",
    slug: "emlak",
    parentId: null,
    icon: "home",
    order: 1,
    isActive: 1,
    createdAt: demoDate(),
  },
];

const demoUsersByOpenId = new Map<string, any>([
  [
    "demo-user",
    {
      id: 1,
      openId: "demo-user",
      name: "Demo Kullanıcı",
      email: "demo@example.com",
      loginMethod: "demo",
      role: "user",
      createdAt: demoDate(),
      updatedAt: demoDate(),
      lastSignedIn: demoDate(),
    },
  ],
]);

let nextDemoListingId = 30010;
let nextDemoMessageId = 1;
let nextDemoSavedSearchId = 1;

let demoListings: any[] = [
  {
    id: 30005,
    userId: 2,
    categoryId: 1,
    title: "Kadıköy Moda'da Deniz Manzaralı 3+1 Daire",
    description:
      "Moda sahiline yürüme mesafesinde, geniş balkonlu, aydınlık ve bakımlı daire.",
    price: 7250000,
    currency: "TRY",
    city: "İstanbul",
    district: "Kadıköy",
    neighborhood: "Moda",
    latitude: "40.9869",
    longitude: "29.0252",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ]),
    status: "active",
    isFeatured: 1,
    viewCount: 248,
    favoriteCount: 17,
    createdAt: demoDate(),
    updatedAt: demoDate(),
  },
  {
    id: 30006,
    userId: 3,
    categoryId: 1,
    title: "Çankaya'da Site İçinde 2+1 Kiralık",
    description:
      "Güvenlikli site, açık otopark, merkezi konum ve temiz kullanım.",
    price: 28500,
    currency: "TRY",
    city: "Ankara",
    district: "Çankaya",
    neighborhood: "Ayrancı",
    latitude: "39.9075",
    longitude: "32.8602",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ]),
    status: "active",
    isFeatured: 0,
    viewCount: 94,
    favoriteCount: 8,
    createdAt: demoDate(),
    updatedAt: demoDate(),
  },
  {
    id: 30007,
    userId: 4,
    categoryId: 1,
    title: "İzmir Urla'da Bahçeli Müstakil Ev",
    description:
      "Sessiz sokakta, geniş bahçeli, aile yaşamına uygun müstakil ev.",
    price: 9800000,
    currency: "TRY",
    city: "İzmir",
    district: "Urla",
    neighborhood: "İskele",
    latitude: "38.3222",
    longitude: "26.7647",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ]),
    status: "active",
    isFeatured: 1,
    viewCount: 176,
    favoriteCount: 22,
    createdAt: demoDate(),
    updatedAt: demoDate(),
  },
];

let demoFavorites: any[] = [];
let demoMessages: any[] = [];
let demoSavedSearches: any[] = [];
let demoReports: any[] = [];

function useDemoStore() {
  return ENV.demoMode && !process.env.DATABASE_URL;
}

function paginate<T>(items: T[], limit = 20, offset = 0) {
  return items.slice(offset, offset + limit);
}

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

  if (useDemoStore()) {
    const existing = demoUsersByOpenId.get(user.openId);
    demoUsersByOpenId.set(user.openId, {
      id: existing?.id ?? demoUsersByOpenId.size + 1,
      openId: user.openId,
      name: user.name ?? existing?.name ?? null,
      email: user.email ?? existing?.email ?? null,
      loginMethod: user.loginMethod ?? existing?.loginMethod ?? "demo",
      role:
        user.role ??
        existing?.role ??
        (user.openId === ENV.ownerOpenId ? "admin" : "user"),
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn ?? new Date(),
    });
    return;
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
      values.role = "admin";
      updateSet.role = "admin";
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
  if (useDemoStore()) {
    return demoUsersByOpenId.get(openId);
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Listing queries
export async function createListing(listing: InsertListing) {
  if (useDemoStore()) {
    const now = new Date();
    const id = nextDemoListingId++;
    demoListings = [
      {
        id,
        currency: "TRY",
        district: null,
        neighborhood: null,
        latitude: null,
        longitude: null,
        images: null,
        isFeatured: 0,
        viewCount: 0,
        favoriteCount: 0,
        createdAt: now,
        updatedAt: now,
        ...listing,
        status: listing.status ?? "active",
      },
      ...demoListings,
    ];
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(listings).values(listing);
  return result.insertId;
}

export async function getListingById(id: number) {
  if (useDemoStore()) {
    return demoListings.find(listing => listing.id === id);
  }

  const db = await getDb();
  if (!db) return undefined;

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);
  return listing;
}

export async function getListingsByUserId(userId: number) {
  if (useDemoStore()) {
    return demoListings.filter(listing => listing.userId === userId);
  }

  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(listings)
    .where(eq(listings.userId, userId))
    .orderBy(listings.createdAt);
}

// City coordinates for bounds filtering
const CITY_COORDINATES: Record<string, [number, number]> = {
  İstanbul: [41.0082, 28.9784],
  Ankara: [39.9334, 32.8597],
  İzmir: [38.4237, 27.1428],
  Bursa: [40.1826, 29.0665],
  Antalya: [36.8969, 30.7133],
  Adana: [37.0, 35.3213],
  Konya: [37.8746, 32.4932],
  Gaziantep: [37.0662, 37.3833],
  Şanlıurfa: [37.1591, 38.7969],
  Mersin: [36.8121, 34.6415],
  Kayseri: [38.7205, 35.4826],
  Eskişehir: [39.7767, 30.5206],
  Diyarbakır: [37.9144, 40.2306],
  Samsun: [41.2867, 36.33],
  Denizli: [37.7765, 29.0864],
};

export async function searchListings(params: {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  minRooms?: number;
  maxRooms?: number;
  minSize?: number;
  maxSize?: number;
  city?: string;
  district?: string;
  status?: string;
  limit?: number;
  offset?: number;
  bounds?: { north: number; south: number; east: number; west: number };
}) {
  const searchIntent = params.categoryId
    ? { textSearch: params.search?.trim() || undefined }
    : parseListingSearch(params.search);
  const effectiveCategoryId = params.categoryId ?? searchIntent.categoryId;

  if (useDemoStore()) {
    let results = [...demoListings];

    if (searchIntent.textSearch) {
      const query = searchIntent.textSearch.toLocaleLowerCase("tr-TR");
      results = results.filter(listing =>
        [
          listing.title,
          listing.description,
          listing.city,
          listing.district,
          listing.neighborhood,
          listing.propertyType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(query)
      );
    }
    if (effectiveCategoryId) {
      results = results.filter(
        listing => listing.categoryId === effectiveCategoryId
      );
    }
    if (params.status) {
      results = results.filter(listing => listing.status === params.status);
    }
    if (params.city) {
      results = results.filter(listing => listing.city === params.city);
    }
    if (params.district) {
      results = results.filter(listing => listing.district === params.district);
    }
    if (params.minPrice !== undefined) {
      results = results.filter(listing => listing.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      results = results.filter(listing => listing.price <= params.maxPrice!);
    }
    if (params.propertyType) {
      results = results.filter(
        listing => listing.propertyType === params.propertyType
      );
    }
    if (params.minRooms !== undefined) {
      results = results.filter(listing => listing.rooms >= params.minRooms!);
    }
    if (params.maxRooms !== undefined) {
      results = results.filter(listing => listing.rooms <= params.maxRooms!);
    }
    if (params.minSize !== undefined) {
      results = results.filter(listing => listing.size >= params.minSize!);
    }
    if (params.maxSize !== undefined) {
      results = results.filter(listing => listing.size <= params.maxSize!);
    }
    if (params.bounds) {
      results = results.filter(listing => {
        const lat = Number(listing.latitude);
        const lng = Number(listing.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;
        return (
          lat >= params.bounds!.south &&
          lat <= params.bounds!.north &&
          lng >= params.bounds!.west &&
          lng <= params.bounds!.east
        );
      });
    }

    return paginate(results, params.limit || 20, params.offset || 0);
  }

  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (effectiveCategoryId) {
    conditions.push(eq(listings.categoryId, effectiveCategoryId));
  }
  if (searchIntent.textSearch) {
    const query = `%${searchIntent.textSearch}%`;
    conditions.push(
      or(
        like(listings.title, query),
        like(listings.description, query),
        like(listings.city, query),
        like(listings.district, query)
      ) as any
    );
  }
  if (params.status) {
    conditions.push(eq(listings.status, params.status as any));
  }
  if (params.city) {
    conditions.push(eq(listings.city, params.city));
  }
  if (params.district) {
    conditions.push(eq(listings.district, params.district));
  }
  if (params.propertyType) {
    conditions.push(eq(listings.propertyType, params.propertyType));
  }
  if (params.minRooms !== undefined) {
    conditions.push(gte(listings.rooms, params.minRooms));
  }
  if (params.maxRooms !== undefined) {
    conditions.push(lte(listings.rooms, params.maxRooms));
  }
  if (params.minSize !== undefined) {
    conditions.push(gte(listings.size, params.minSize));
  }
  if (params.maxSize !== undefined) {
    conditions.push(lte(listings.size, params.maxSize));
  }

  // Filter by bounds if provided (using city coordinates)
  if (params.bounds) {
    const citiesInBounds = Object.entries(CITY_COORDINATES)
      .filter(([_, coords]) => {
        const [lat, lng] = coords;
        return (
          lat >= params.bounds!.south &&
          lat <= params.bounds!.north &&
          lng >= params.bounds!.west &&
          lng <= params.bounds!.east
        );
      })
      .map(([city]) => city);

    if (citiesInBounds.length > 0) {
      // Only filter by cities in bounds if we found any
      const cityConditions = citiesInBounds.map(city =>
        eq(listings.city, city)
      );
      conditions.push(or(...cityConditions) as any);
    } else {
      // No cities in bounds, return empty result
      return [];
    }
  }

  let query = db.select().from(listings);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = await query
    .orderBy(listings.createdAt)
    .limit(params.limit || 20)
    .offset(params.offset || 0);

  return results;
}

export async function updateListing(
  id: number,
  updates: Partial<InsertListing>
) {
  if (useDemoStore()) {
    demoListings = demoListings.map(listing =>
      listing.id === id
        ? { ...listing, ...updates, updatedAt: new Date() }
        : listing
    );
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(listings).set(updates).where(eq(listings.id, id));
}

export async function deleteListing(id: number) {
  if (useDemoStore()) {
    demoListings = demoListings.filter(listing => listing.id !== id);
    demoFavorites = demoFavorites.filter(favorite => favorite.listingId !== id);
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(listings).where(eq(listings.id, id));
}

// Category queries
export async function getAllCategories() {
  if (useDemoStore()) {
    return demoCategories;
  }

  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  if (useDemoStore()) {
    return demoCategories.find(category => category.id === id);
  }

  const db = await getDb();
  if (!db) return undefined;

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return category;
}

// Favorites queries
export async function addFavorite(userId: number, listingId: number) {
  if (useDemoStore()) {
    if (
      !demoFavorites.some(
        favorite =>
          favorite.userId === userId && favorite.listingId === listingId
      )
    ) {
      demoFavorites.push({
        id: demoFavorites.length + 1,
        userId,
        listingId,
        createdAt: new Date(),
      });
    }
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(favorites).values({ userId, listingId });
}

export async function removeFavorite(userId: number, listingId: number) {
  if (useDemoStore()) {
    demoFavorites = demoFavorites.filter(
      favorite => favorite.userId !== userId || favorite.listingId !== listingId
    );
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.listingId, listingId))
    );
}

export async function getUserFavorites(userId: number) {
  if (useDemoStore()) {
    return demoFavorites.filter(favorite => favorite.userId === userId);
  }

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
  if (useDemoStore()) {
    const id = nextDemoMessageId++;
    demoMessages.push({
      id,
      ...data,
      isRead: 0,
      createdAt: new Date(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getConversations(userId: number) {
  if (useDemoStore()) {
    const conversationsMap = new Map();

    for (const msg of [...demoMessages].reverse()) {
      if (msg.senderId !== userId && msg.receiverId !== userId) continue;
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
        conversationsMap.get(partnerId).unreadCount += 1;
      }
    }

    return Array.from(conversationsMap.values());
  }

  const db = await getDb();
  if (!db) return [];

  // Get all messages where user is sender or receiver
  const allMessages = await db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
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

export async function getConversationMessages(
  userId: number,
  partnerId: number,
  listingId: number
) {
  if (useDemoStore()) {
    const msgs = demoMessages.filter(
      msg =>
        msg.listingId === listingId &&
        ((msg.senderId === userId && msg.receiverId === partnerId) ||
          (msg.senderId === partnerId && msg.receiverId === userId))
    );

    demoMessages = demoMessages.map(msg =>
      msg.receiverId === userId &&
      msg.senderId === partnerId &&
      msg.listingId === listingId
        ? { ...msg, isRead: 1 }
        : msg
    );

    return msgs;
  }

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
          and(eq(messages.senderId, partnerId), eq(messages.receiverId, userId))
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

// ===== Saved Searches Functions =====

export async function createSavedSearch(data: {
  userId: number;
  name: string;
  filters: string; // JSON string
  emailNotifications?: number;
}) {
  if (useDemoStore()) {
    const now = new Date();
    const savedSearch = {
      id: nextDemoSavedSearchId++,
      userId: data.userId,
      name: data.name,
      filters: data.filters,
      emailNotifications: data.emailNotifications ?? 1,
      isActive: 1,
      lastNotifiedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    demoSavedSearches = [savedSearch, ...demoSavedSearches];
    return savedSearch;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(savedSearches).values({
    userId: data.userId,
    name: data.name,
    filters: data.filters,
    emailNotifications: data.emailNotifications ?? 1,
    isActive: 1,
  });

  return result;
}

export async function getUserSavedSearches(userId: number) {
  if (useDemoStore()) {
    return demoSavedSearches.filter(search => search.userId === userId);
  }

  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId))
    .orderBy(desc(savedSearches.createdAt));
}

export async function deleteSavedSearch(id: number, userId: number) {
  if (useDemoStore()) {
    demoSavedSearches = demoSavedSearches.filter(
      search => search.id !== id || search.userId !== userId
    );
    return { success: true };
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(savedSearches)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));

  return { success: true };
}

export async function toggleSavedSearchNotifications(
  id: number,
  userId: number,
  enabled: boolean
) {
  if (useDemoStore()) {
    demoSavedSearches = demoSavedSearches.map(search =>
      search.id === id && search.userId === userId
        ? {
            ...search,
            emailNotifications: enabled ? 1 : 0,
            updatedAt: new Date(),
          }
        : search
    );
    return { success: true };
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(savedSearches)
    .set({ emailNotifications: enabled ? 1 : 0 })
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));

  return { success: true };
}

export async function createReport(data: {
  listingId: number;
  reporterId: number;
  reason: string;
  description?: string;
}) {
  if (useDemoStore()) {
    const id = demoReports.length + 1;
    demoReports.push({
      id,
      ...data,
      description: data.description ?? null,
      status: "pending",
      createdAt: new Date(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(reports).values({
    listingId: data.listingId,
    reporterId: data.reporterId,
    reason: data.reason,
    description: data.description ?? null,
  });
  return result.insertId;
}
