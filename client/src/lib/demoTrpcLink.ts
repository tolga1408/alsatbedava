import { unstable_localLink, type TRPCLink } from "@trpc/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import type { AppRouter } from "../../../server/routers";
import superjson from "superjson";
import { z } from "zod";

const SESSION_KEY = "alsatbedava.demo.session";
const STORE_KEY = "alsatbedava.demo.store.v1";
const DEMO_SESSION_VALUE = "demo-user";

type DemoUser = {
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

type DemoListing = {
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
  propertyType?: string | null;
  rooms?: number | null;
  size?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type DemoFavorite = {
  id: number;
  userId: number;
  listingId: number;
  createdAt: Date;
};

type DemoMessage = {
  id: number;
  listingId: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: number;
  createdAt: Date;
};

type DemoSavedSearch = {
  id: number;
  userId: number;
  name: string;
  filters: {
    categoryId?: number;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  isActive: number;
  emailNotifications: number;
  lastNotifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type DemoStore = {
  listings: DemoListing[];
  favorites: DemoFavorite[];
  messages: DemoMessage[];
  savedSearches: DemoSavedSearch[];
  nextListingId: number;
  nextFavoriteId: number;
  nextMessageId: number;
  nextSavedSearchId: number;
};

type DemoContext = {
  user: DemoUser | null;
};

const demoDate = (value = "2026-09-01T09:00:00.000Z") => new Date(value);

const demoUser: DemoUser = {
  id: 1,
  openId: DEMO_SESSION_VALUE,
  name: "Demo Kullanıcı",
  email: "demo@example.com",
  loginMethod: "demo",
  role: "user",
  createdAt: demoDate(),
  updatedAt: demoDate(),
  lastSignedIn: demoDate(),
};

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

const CITY_COORDINATES: Record<string, [number, number]> = {
  İstanbul: [41.0082, 28.9784],
  Istanbul: [41.0082, 28.9784],
  Ankara: [39.9334, 32.8597],
  İzmir: [38.4237, 27.1428],
  Izmir: [38.4237, 27.1428],
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

const initialListings: DemoListing[] = [
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
    propertyType: "Daire",
    rooms: 3,
    size: 145,
    createdAt: demoDate("2026-09-01T10:00:00.000Z"),
    updatedAt: demoDate("2026-09-01T10:00:00.000Z"),
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
    propertyType: "Daire",
    rooms: 2,
    size: 95,
    createdAt: demoDate("2026-09-02T08:30:00.000Z"),
    updatedAt: demoDate("2026-09-02T08:30:00.000Z"),
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
    propertyType: "Villa",
    rooms: 4,
    size: 210,
    createdAt: demoDate("2026-09-02T13:15:00.000Z"),
    updatedAt: demoDate("2026-09-02T13:15:00.000Z"),
  },
];

const seedStore = (): DemoStore => ({
  listings: initialListings,
  favorites: [],
  messages: [
    {
      id: 1,
      listingId: 30005,
      senderId: 2,
      receiverId: demoUser.id,
      content: "Merhaba, ilan hala aktif mi?",
      isRead: 0,
      createdAt: demoDate("2026-09-02T18:30:00.000Z"),
    },
  ],
  savedSearches: [],
  nextListingId: 30010,
  nextFavoriteId: 1,
  nextMessageId: 2,
  nextSavedSearchId: 1,
});

const dateFields = new Set([
  "createdAt",
  "updatedAt",
  "lastSignedIn",
  "lastNotifiedAt",
]);

const reviveDates = (_key: string, value: unknown) => {
  if (
    typeof value === "string" &&
    dateFields.has(_key) &&
    /^\d{4}-\d{2}-\d{2}T/.test(value)
  ) {
    return new Date(value);
  }

  return value;
};

const storageAvailable = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStore = (): DemoStore => {
  if (!storageAvailable()) {
    return seedStore();
  }

  const stored = window.localStorage.getItem(STORE_KEY);
  if (!stored) {
    const seeded = seedStore();
    writeStore(seeded);
    return seeded;
  }

  try {
    return JSON.parse(stored, reviveDates) as DemoStore;
  } catch {
    const seeded = seedStore();
    writeStore(seeded);
    return seeded;
  }
};

const writeStore = (store: DemoStore) => {
  if (!storageAvailable()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
};

const getCurrentUser = () => {
  if (!storageAvailable()) return null;
  return window.localStorage.getItem(SESSION_KEY) === DEMO_SESSION_VALUE
    ? demoUser
    : null;
};

const cityCoordinatesFor = (city: string, id: number) => {
  const [lat, lng] = CITY_COORDINATES[city] ?? [39.0, 35.0];
  const offset = ((id % 7) - 3) * 0.012;
  return {
    latitude: (lat + offset).toFixed(4),
    longitude: (lng - offset).toFixed(4),
  };
};

const assertOwnedListing = (store: DemoStore, id: number, userId: number) => {
  const listing = store.listings.find(item => item.id === id);
  if (!listing || listing.userId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not authorized",
    });
  }

  return listing;
};

export const startStaticDemoSession = () => {
  if (!storageAvailable()) return;
  window.localStorage.setItem(SESSION_KEY, DEMO_SESSION_VALUE);
  readStore();
};

export const endStaticDemoSession = () => {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(SESSION_KEY);
};

const t = initTRPC.context<DemoContext>().create({
  transformer: superjson,
  allowOutsideOfServer: true,
});

const publicProcedure = t.procedure;

const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: UNAUTHED_ERR_MSG,
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const demoRouter = t.router({
  system: t.router({
    health: publicProcedure
      .input(z.object({ timestamp: z.number().min(0) }))
      .query(() => ({ ok: true })),
  }),

  auth: t.router({
    me: publicProcedure.query(() => getCurrentUser()),
    logout: publicProcedure.mutation(() => {
      endStaticDemoSession();
      return { success: true } as const;
    }),
  }),

  listings: t.router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string(),
          price: z.number().positive(),
          categoryId: z.number(),
          city: z.string(),
          district: z.string().optional(),
          images: z.array(z.string()).optional(),
          propertyType: z.string().optional(),
          rooms: z.number().optional(),
          size: z.number().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const store = readStore();
        const now = new Date();
        const id = store.nextListingId++;
        const coordinates = cityCoordinatesFor(input.city, id);

        store.listings = [
          {
            id,
            userId: ctx.user.id,
            categoryId: input.categoryId,
            title: input.title,
            description: input.description,
            price: input.price,
            currency: "TRY",
            city: input.city,
            district: input.district ?? null,
            neighborhood: null,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            images: input.images ? JSON.stringify(input.images) : null,
            status: "active",
            isFeatured: 0,
            viewCount: 0,
            favoriteCount: 0,
            propertyType: input.propertyType ?? null,
            rooms: input.rooms ?? null,
            size: input.size ?? null,
            createdAt: now,
            updatedAt: now,
          },
          ...store.listings,
        ];
        writeStore(store);

        return { id };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        const store = readStore();
        return store.listings.find(listing => listing.id === input.id) ?? null;
      }),

    search: publicProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
          city: z.string().optional(),
          district: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          status: z.string().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
          bounds: z
            .object({
              north: z.number(),
              south: z.number(),
              east: z.number(),
              west: z.number(),
            })
            .optional(),
        })
      )
      .query(({ input }) => {
        const store = readStore();
        let results = [...store.listings];

        if (input.categoryId) {
          results = results.filter(
            listing => listing.categoryId === input.categoryId
          );
        }
        if (input.status) {
          results = results.filter(listing => listing.status === input.status);
        } else {
          results = results.filter(listing => listing.status === "active");
        }
        if (input.city) {
          results = results.filter(listing => listing.city === input.city);
        }
        if (input.district) {
          results = results.filter(
            listing => listing.district === input.district
          );
        }
        if (input.minPrice !== undefined) {
          results = results.filter(listing => listing.price >= input.minPrice!);
        }
        if (input.maxPrice !== undefined) {
          results = results.filter(listing => listing.price <= input.maxPrice!);
        }
        if (input.bounds) {
          results = results.filter(listing => {
            const lat = Number(listing.latitude);
            const lng = Number(listing.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;

            return (
              lat >= input.bounds!.south &&
              lat <= input.bounds!.north &&
              lng >= input.bounds!.west &&
              lng <= input.bounds!.east
            );
          });
        }

        return results
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(input.offset ?? 0, (input.offset ?? 0) + (input.limit ?? 20));
      }),

    myListings: protectedProcedure.query(({ ctx }) => {
      const store = readStore();
      return store.listings.filter(listing => listing.userId === ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          status: z.string().optional(),
          images: z.array(z.string()).optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const store = readStore();
        assertOwnedListing(store, input.id, ctx.user.id);

        store.listings = store.listings.map(listing => {
          if (listing.id !== input.id) return listing;
          return {
            ...listing,
            title: input.title ?? listing.title,
            description: input.description ?? listing.description,
            price: input.price ?? listing.price,
            status:
              (input.status as DemoListing["status"] | undefined) ??
              listing.status,
            images: input.images
              ? JSON.stringify(input.images)
              : listing.images,
            updatedAt: new Date(),
          };
        });
        writeStore(store);

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        const store = readStore();
        assertOwnedListing(store, input.id, ctx.user.id);

        store.listings = store.listings.filter(
          listing => listing.id !== input.id
        );
        store.favorites = store.favorites.filter(
          favorite => favorite.listingId !== input.id
        );
        writeStore(store);

        return { success: true };
      }),
  }),

  favorites: t.router({
    add: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(({ ctx, input }) => {
        const store = readStore();
        const alreadyFavorited = store.favorites.some(
          favorite =>
            favorite.userId === ctx.user.id &&
            favorite.listingId === input.listingId
        );

        if (!alreadyFavorited) {
          store.favorites.push({
            id: store.nextFavoriteId++,
            userId: ctx.user.id,
            listingId: input.listingId,
            createdAt: new Date(),
          });
          store.listings = store.listings.map(listing =>
            listing.id === input.listingId
              ? { ...listing, favoriteCount: listing.favoriteCount + 1 }
              : listing
          );
          writeStore(store);
        }

        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(({ ctx, input }) => {
        const store = readStore();
        const before = store.favorites.length;

        store.favorites = store.favorites.filter(
          favorite =>
            favorite.userId !== ctx.user.id ||
            favorite.listingId !== input.listingId
        );

        if (store.favorites.length !== before) {
          store.listings = store.listings.map(listing =>
            listing.id === input.listingId
              ? {
                  ...listing,
                  favoriteCount: Math.max(0, listing.favoriteCount - 1),
                }
              : listing
          );
          writeStore(store);
        }

        return { success: true };
      }),

    list: protectedProcedure.query(({ ctx }) => {
      const store = readStore();
      return store.favorites.filter(
        favorite => favorite.userId === ctx.user.id
      );
    }),
  }),

  categories: t.router({
    list: publicProcedure.query(() => demoCategories),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) =>
        demoCategories.find(category => category.id === input.id)
      ),
  }),

  upload: t.router({
    image: protectedProcedure
      .input(
        z.object({
          base64: z.string(),
          filename: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(({ input, ctx }) => {
        return {
          url: input.base64,
          key: `demo/${ctx.user.id}/${Date.now()}-${input.filename}`,
        };
      }),
  }),

  messages: t.router({
    send: protectedProcedure
      .input(
        z.object({
          receiverId: z.number(),
          listingId: z.number(),
          content: z.string().min(1),
        })
      )
      .mutation(({ ctx, input }) => {
        const store = readStore();
        const id = store.nextMessageId++;

        store.messages.push({
          id,
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          listingId: input.listingId,
          content: input.content,
          isRead: 0,
          createdAt: new Date(),
        });
        writeStore(store);

        return { id };
      }),

    conversations: protectedProcedure.query(({ ctx }) => {
      const store = readStore();
      const conversationsMap = new Map<
        string,
        {
          partnerId: number;
          listingId: number;
          lastMessage: string;
          lastMessageAt: Date;
          unreadCount: number;
        }
      >();

      for (const message of [...store.messages].reverse()) {
        if (
          message.senderId !== ctx.user.id &&
          message.receiverId !== ctx.user.id
        ) {
          continue;
        }

        const partnerId =
          message.senderId === ctx.user.id
            ? message.receiverId
            : message.senderId;
        const key = `${partnerId}-${message.listingId}`;
        const existing = conversationsMap.get(key);

        if (!existing) {
          conversationsMap.set(key, {
            partnerId,
            listingId: message.listingId,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unreadCount:
              message.receiverId === ctx.user.id && !message.isRead ? 1 : 0,
          });
        } else if (message.receiverId === ctx.user.id && !message.isRead) {
          existing.unreadCount += 1;
        }
      }

      return Array.from(conversationsMap.values());
    }),

    getConversation: protectedProcedure
      .input(
        z.object({
          partnerId: z.number(),
          listingId: z.number(),
        })
      )
      .query(({ ctx, input }) => {
        const store = readStore();
        const conversation = store.messages.filter(
          message =>
            message.listingId === input.listingId &&
            ((message.senderId === ctx.user.id &&
              message.receiverId === input.partnerId) ||
              (message.senderId === input.partnerId &&
                message.receiverId === ctx.user.id))
        );

        store.messages = store.messages.map(message =>
          message.receiverId === ctx.user.id &&
          message.senderId === input.partnerId &&
          message.listingId === input.listingId
            ? { ...message, isRead: 1 }
            : message
        );
        writeStore(store);

        return conversation;
      }),
  }),

  savedSearches: t.router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          filters: z.object({
            categoryId: z.number().optional(),
            city: z.string().optional(),
            minPrice: z.number().optional(),
            maxPrice: z.number().optional(),
          }),
          emailNotifications: z.boolean().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const store = readStore();
        const now = new Date();
        const savedSearch = {
          id: store.nextSavedSearchId++,
          userId: ctx.user.id,
          name: input.name,
          filters: input.filters,
          emailNotifications: input.emailNotifications ? 1 : 0,
          isActive: 1,
          lastNotifiedAt: null,
          createdAt: now,
          updatedAt: now,
        };

        store.savedSearches = [savedSearch, ...store.savedSearches];
        writeStore(store);

        return savedSearch;
      }),

    list: protectedProcedure.query(({ ctx }) => {
      const store = readStore();
      return store.savedSearches.filter(
        search => search.userId === ctx.user.id
      );
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        const store = readStore();
        store.savedSearches = store.savedSearches.filter(
          search => search.id !== input.id || search.userId !== ctx.user.id
        );
        writeStore(store);

        return { success: true };
      }),

    toggleNotifications: protectedProcedure
      .input(z.object({ id: z.number(), enabled: z.boolean() }))
      .mutation(({ ctx, input }) => {
        const store = readStore();
        store.savedSearches = store.savedSearches.map(search =>
          search.id === input.id && search.userId === ctx.user.id
            ? {
                ...search,
                emailNotifications: input.enabled ? 1 : 0,
                updatedAt: new Date(),
              }
            : search
        );
        writeStore(store);

        return { success: true };
      }),

    triggerNotifications: protectedProcedure.mutation(({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized: Admin access required",
        });
      }

      return {
        totalSearches: 0,
        notificationsSent: 0,
        errors: 0,
        details: [],
      };
    }),
  }),
});

export const createDemoTrpcLink = (): TRPCLink<AppRouter> =>
  unstable_localLink({
    router: demoRouter,
    transformer: superjson,
    createContext: async () => ({ user: getCurrentUser() }),
  }) as unknown as TRPCLink<AppRouter>;
