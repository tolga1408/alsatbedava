import type { D1Database, D1PreparedStatement } from "./platform";

export type BetaUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

export type BetaListing = {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  city: string;
  district: string | null;
  neighborhood: string | null;
  latitude: string | null;
  longitude: string | null;
  images: string | null;
  status: "active" | "sold" | "deleted";
  isFeatured: number;
  viewCount: number;
  favoriteCount: number;
  propertyType: string | null;
  rooms: number | null;
  size: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type ListingRow = Omit<BetaListing, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type FavoriteRow = {
  id: number;
  userId: number;
  listingId: number;
  createdAt: string;
};

type MessageRow = {
  id: number;
  listingId: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: number;
  createdAt: string;
};

type SavedSearchRow = {
  id: number;
  userId: number;
  name: string;
  filters: string;
  isActive: number;
  emailNotifications: number;
  lastNotifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const LISTING_COLUMNS = `
  id,
  user_id AS userId,
  category_id AS categoryId,
  title,
  description,
  price,
  currency,
  city,
  district,
  neighborhood,
  latitude,
  longitude,
  images,
  status,
  is_featured AS isFeatured,
  view_count AS viewCount,
  favorite_count AS favoriteCount,
  property_type AS propertyType,
  rooms,
  size,
  created_at AS createdAt,
  updated_at AS updatedAt`;

const FAVORITE_COLUMNS = `
  id,
  user_id AS userId,
  listing_id AS listingId,
  created_at AS createdAt`;

const MESSAGE_COLUMNS = `
  id,
  listing_id AS listingId,
  sender_id AS senderId,
  receiver_id AS receiverId,
  content,
  is_read AS isRead,
  created_at AS createdAt`;

const SAVED_SEARCH_COLUMNS = `
  id,
  user_id AS userId,
  name,
  filters,
  is_active AS isActive,
  email_notifications AS emailNotifications,
  last_notified_at AS lastNotifiedAt,
  created_at AS createdAt,
  updated_at AS updatedAt`;

function hydrateListing(row: ListingRow): BetaListing {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function hydrateFavorite(row: FavoriteRow) {
  return { ...row, createdAt: new Date(row.createdAt) };
}

function hydrateMessage(row: MessageRow) {
  return { ...row, createdAt: new Date(row.createdAt) };
}

function hydrateSavedSearch(row: SavedSearchRow) {
  return {
    ...row,
    lastNotifiedAt: row.lastNotifiedAt ? new Date(row.lastNotifiedAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

async function all<T>(statement: D1PreparedStatement): Promise<T[]> {
  const result = await statement.all<T>();
  return result.results ?? [];
}

export async function searchListings(
  db: D1Database,
  params: {
    search?: string;
    categoryId?: number;
    city?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    limit?: number;
    offset?: number;
    bounds?: { north: number; south: number; east: number; west: number };
  }
) {
  const conditions: string[] = ["status = ?"];
  const values: unknown[] = [params.status ?? "active"];

  if (params.search?.trim()) {
    const search = `%${params.search.trim()}%`;
    conditions.push(
      "(title LIKE ? OR description LIKE ? OR city LIKE ? OR district LIKE ? OR property_type LIKE ?)"
    );
    values.push(search, search, search, search, search);
  }
  if (params.categoryId !== undefined) {
    conditions.push("category_id = ?");
    values.push(params.categoryId);
  }
  if (params.city) {
    conditions.push("city = ?");
    values.push(params.city);
  }
  if (params.district) {
    conditions.push("district = ?");
    values.push(params.district);
  }
  if (params.minPrice !== undefined) {
    conditions.push("price >= ?");
    values.push(params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    conditions.push("price <= ?");
    values.push(params.maxPrice);
  }
  if (params.bounds) {
    conditions.push(
      "CAST(latitude AS REAL) BETWEEN ? AND ? AND CAST(longitude AS REAL) BETWEEN ? AND ?"
    );
    values.push(
      params.bounds.south,
      params.bounds.north,
      params.bounds.west,
      params.bounds.east
    );
  }

  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const offset = Math.max(params.offset ?? 0, 0);
  values.push(limit, offset);

  const rows = await all<ListingRow>(
    db
      .prepare(
        `SELECT ${LISTING_COLUMNS}
        FROM listings
        WHERE ${conditions.join(" AND ")}
        ORDER BY is_featured DESC, created_at DESC
        LIMIT ? OFFSET ?`
      )
      .bind(...values)
  );

  return rows.map(hydrateListing);
}

export async function getListingById(db: D1Database, id: number) {
  const row = await db
    .prepare(
      `SELECT ${LISTING_COLUMNS} FROM listings WHERE id = ? AND status != 'deleted'`
    )
    .bind(id)
    .first<ListingRow>();

  return row ? hydrateListing(row) : null;
}

export async function getListingsByUserId(db: D1Database, userId: number) {
  const rows = await all<ListingRow>(
    db
      .prepare(
        `SELECT ${LISTING_COLUMNS}
        FROM listings
        WHERE user_id = ? AND status != 'deleted'
        ORDER BY created_at DESC`
      )
      .bind(userId)
  );
  return rows.map(hydrateListing);
}

export async function createListing(
  db: D1Database,
  userId: number,
  input: {
    title: string;
    description: string;
    price: number;
    categoryId: number;
    city: string;
    district?: string;
    images?: string[];
    propertyType?: string;
    rooms?: number;
    size?: number;
  }
) {
  const now = new Date().toISOString();
  const result = await db
    .prepare(
      `INSERT INTO listings (
        user_id, category_id, title, description, price, currency,
        city, district, images, property_type, rooms, size,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'TRY', ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .bind(
      userId,
      input.categoryId,
      input.title.trim(),
      input.description.trim(),
      Math.round(input.price),
      input.city,
      input.district?.trim() || null,
      input.images ? JSON.stringify(input.images) : null,
      input.propertyType ?? null,
      input.rooms ?? null,
      input.size ? Math.round(input.size) : null,
      now,
      now
    )
    .run();

  const id = result.meta?.last_row_id;
  if (!id) throw new Error("Listing could not be created");
  return id;
}

export async function updateListing(
  db: D1Database,
  userId: number,
  input: {
    id: number;
    title?: string;
    description?: string;
    price?: number;
    status?: "active" | "sold" | "deleted";
    images?: string[];
  }
) {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    values.push(input.title.trim());
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description.trim());
  }
  if (input.price !== undefined) {
    updates.push("price = ?");
    values.push(Math.round(input.price));
  }
  if (input.status !== undefined) {
    updates.push("status = ?");
    values.push(input.status);
  }
  if (input.images !== undefined) {
    updates.push("images = ?");
    values.push(JSON.stringify(input.images));
  }
  if (updates.length === 0) return;

  updates.push("updated_at = ?");
  values.push(new Date().toISOString(), input.id, userId);
  const result = await db
    .prepare(
      `UPDATE listings SET ${updates.join(", ")}
      WHERE id = ? AND user_id = ? AND status != 'deleted'`
    )
    .bind(...values)
    .run();

  if ((result.meta?.changes ?? 0) === 0) {
    throw new Error("Listing not found or not owned by this user");
  }
}

export async function deleteListing(
  db: D1Database,
  userId: number,
  id: number
) {
  const now = new Date().toISOString();
  const result = await db
    .prepare(
      `UPDATE listings
      SET status = 'deleted', updated_at = ?
      WHERE id = ? AND user_id = ? AND status != 'deleted'`
    )
    .bind(now, id, userId)
    .run();

  if ((result.meta?.changes ?? 0) === 0) {
    throw new Error("Listing not found or not owned by this user");
  }

  await db.prepare("DELETE FROM favorites WHERE listing_id = ?").bind(id).run();
}

export async function listCategories(db: D1Database) {
  const rows = await all<{
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    icon: string | null;
    order: number;
    isActive: number;
    createdAt: string;
  }>(
    db.prepare(
      `SELECT id, name, slug, parent_id AS parentId, icon,
        display_order AS "order", is_active AS isActive, created_at AS createdAt
      FROM categories WHERE is_active = 1 ORDER BY display_order ASC`
    )
  );
  return rows.map(row => ({ ...row, createdAt: new Date(row.createdAt) }));
}

export async function getCategoryById(db: D1Database, id: number) {
  const categories = await listCategories(db);
  return categories.find(category => category.id === id) ?? null;
}

export async function addFavorite(
  db: D1Database,
  userId: number,
  listingId: number
) {
  const listing = await getListingById(db, listingId);
  if (!listing) throw new Error("Listing not found");

  await db
    .prepare(
      `INSERT OR IGNORE INTO favorites (user_id, listing_id, created_at)
      VALUES (?, ?, ?)`
    )
    .bind(userId, listingId, new Date().toISOString())
    .run();
}

export async function removeFavorite(
  db: D1Database,
  userId: number,
  listingId: number
) {
  await db
    .prepare("DELETE FROM favorites WHERE user_id = ? AND listing_id = ?")
    .bind(userId, listingId)
    .run();
}

export async function listFavorites(db: D1Database, userId: number) {
  const rows = await all<FavoriteRow>(
    db
      .prepare(
        `SELECT ${FAVORITE_COLUMNS}
        FROM favorites WHERE user_id = ? ORDER BY created_at DESC`
      )
      .bind(userId)
  );
  return rows.map(hydrateFavorite);
}

export async function sendMessage(
  db: D1Database,
  senderId: number,
  input: { receiverId: number; listingId: number; content: string }
) {
  const listing = await getListingById(db, input.listingId);
  if (!listing) throw new Error("Listing not found");
  if (input.receiverId !== listing.userId && senderId !== listing.userId) {
    throw new Error("Messages must involve the listing owner");
  }
  if (senderId === input.receiverId) {
    throw new Error("You cannot message yourself");
  }

  const result = await db
    .prepare(
      `INSERT INTO messages (
        listing_id, sender_id, receiver_id, content, is_read, created_at
      ) VALUES (?, ?, ?, ?, 0, ?)`
    )
    .bind(
      input.listingId,
      senderId,
      input.receiverId,
      input.content.trim(),
      new Date().toISOString()
    )
    .run();

  const id = result.meta?.last_row_id;
  if (!id) throw new Error("Message could not be sent");
  return id;
}

export async function getConversations(db: D1Database, userId: number) {
  const rows = await all<MessageRow>(
    db
      .prepare(
        `SELECT ${MESSAGE_COLUMNS}
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        ORDER BY created_at DESC`
      )
      .bind(userId, userId)
  );
  const conversations = new Map<
    string,
    {
      partnerId: number;
      listingId: number;
      lastMessage: string;
      lastMessageAt: Date;
      unreadCount: number;
    }
  >();

  for (const row of rows) {
    const partnerId = row.senderId === userId ? row.receiverId : row.senderId;
    const key = `${partnerId}:${row.listingId}`;
    const existing = conversations.get(key);
    if (!existing) {
      conversations.set(key, {
        partnerId,
        listingId: row.listingId,
        lastMessage: row.content,
        lastMessageAt: new Date(row.createdAt),
        unreadCount: row.receiverId === userId && row.isRead === 0 ? 1 : 0,
      });
    } else if (row.receiverId === userId && row.isRead === 0) {
      existing.unreadCount += 1;
    }
  }

  return Array.from(conversations.values());
}

export async function getConversation(
  db: D1Database,
  userId: number,
  partnerId: number,
  listingId: number
) {
  const rows = await all<MessageRow>(
    db
      .prepare(
        `SELECT ${MESSAGE_COLUMNS}
        FROM messages
        WHERE listing_id = ? AND (
          (sender_id = ? AND receiver_id = ?) OR
          (sender_id = ? AND receiver_id = ?)
        )
        ORDER BY created_at ASC`
      )
      .bind(listingId, userId, partnerId, partnerId, userId)
  );

  await db
    .prepare(
      `UPDATE messages SET is_read = 1
      WHERE listing_id = ? AND sender_id = ? AND receiver_id = ?`
    )
    .bind(listingId, partnerId, userId)
    .run();

  return rows.map(hydrateMessage);
}

export async function createSavedSearch(
  db: D1Database,
  userId: number,
  input: { name: string; filters: object; emailNotifications?: boolean }
) {
  const now = new Date().toISOString();
  const result = await db
    .prepare(
      `INSERT INTO saved_searches (
        user_id, name, filters, is_active, email_notifications,
        created_at, updated_at
      ) VALUES (?, ?, ?, 1, ?, ?, ?)`
    )
    .bind(
      userId,
      input.name.trim(),
      JSON.stringify(input.filters),
      input.emailNotifications ? 1 : 0,
      now,
      now
    )
    .run();
  const id = result.meta?.last_row_id;
  if (!id) throw new Error("Saved search could not be created");
  return getSavedSearchById(db, userId, id);
}

async function getSavedSearchById(db: D1Database, userId: number, id: number) {
  const row = await db
    .prepare(
      `SELECT ${SAVED_SEARCH_COLUMNS}
      FROM saved_searches WHERE id = ? AND user_id = ?`
    )
    .bind(id, userId)
    .first<SavedSearchRow>();
  if (!row) throw new Error("Saved search not found");
  return hydrateSavedSearch(row);
}

export async function listSavedSearches(db: D1Database, userId: number) {
  const rows = await all<SavedSearchRow>(
    db
      .prepare(
        `SELECT ${SAVED_SEARCH_COLUMNS}
        FROM saved_searches WHERE user_id = ? ORDER BY created_at DESC`
      )
      .bind(userId)
  );
  return rows.map(row => ({
    ...hydrateSavedSearch(row),
    filters: JSON.parse(row.filters),
  }));
}

export async function deleteSavedSearch(
  db: D1Database,
  userId: number,
  id: number
) {
  await db
    .prepare("DELETE FROM saved_searches WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run();
}

export async function toggleSavedSearchNotifications(
  db: D1Database,
  userId: number,
  id: number,
  enabled: boolean
) {
  await db
    .prepare(
      `UPDATE saved_searches
      SET email_notifications = ?, updated_at = ?
      WHERE id = ? AND user_id = ?`
    )
    .bind(enabled ? 1 : 0, new Date().toISOString(), id, userId)
    .run();
}

export async function createReport(
  db: D1Database,
  reporterId: number,
  input: {
    listingId: number;
    reason: string;
    description?: string;
  }
) {
  const listing = await getListingById(db, input.listingId);
  if (!listing) throw new Error("Listing not found");
  if (listing.userId === reporterId) {
    throw new Error("You cannot report your own listing");
  }

  const result = await db
    .prepare(
      `INSERT INTO reports (
        listing_id, reporter_id, reason, description, status, created_at
      ) VALUES (?, ?, ?, ?, 'pending', ?)`
    )
    .bind(
      input.listingId,
      reporterId,
      input.reason,
      input.description?.trim() || null,
      new Date().toISOString()
    )
    .run();

  const id = result.meta?.last_row_id;
  if (!id) throw new Error("Report could not be created");
  return id;
}
