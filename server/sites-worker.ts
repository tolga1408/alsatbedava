import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import superjson from "superjson";
import { z } from "zod";

type User = {
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

type Listing = {
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

type Favorite = {
  id: number;
  userId: number;
  listingId: number;
  createdAt: Date;
};

type Message = {
  id: number;
  listingId: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: number;
  createdAt: Date;
};

type SavedSearch = {
  id: number;
  userId: number;
  name: string;
  filters: string;
  isActive: number;
  emailNotifications: number;
  lastNotifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Context = {
  req: Request;
  resHeaders: Headers;
  user: User | null;
};

type Fetcher = {
  fetch(request: Request): Promise<Response>;
};

type Env = {
  ASSETS: Fetcher;
};

type ExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const publicProcedure = t.procedure;

const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Please login (10001)",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);

const demoUser: User = {
  id: 1,
  openId: "demo-user",
  name: "Demo Kullanici",
  email: "demo@example.com",
  loginMethod: "demo",
  role: "user",
  createdAt: new Date("2026-09-01T09:00:00.000Z"),
  updatedAt: new Date("2026-09-01T09:00:00.000Z"),
  lastSignedIn: new Date("2026-09-01T09:00:00.000Z"),
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
    createdAt: new Date("2026-09-01T09:00:00.000Z"),
  },
];

const CITY_COORDINATES: Record<string, [number, number]> = {
  Istanbul: [41.0082, 28.9784],
  Ankara: [39.9334, 32.8597],
  Izmir: [38.4237, 27.1428],
  Bursa: [40.1826, 29.0665],
  Antalya: [36.8969, 30.7133],
};

let nextListingId = 30010;
let nextFavoriteId = 1;
let nextMessageId = 1;
let nextSavedSearchId = 1;

let listings: Listing[] = [
  {
    id: 30005,
    userId: 2,
    categoryId: 1,
    title: "Kadikoy Moda'da Deniz Manzarali 3+1 Daire",
    description:
      "Moda sahiline yurume mesafesinde, genis balkonlu, aydinlik ve bakimli daire.",
    price: 7250000,
    currency: "TRY",
    city: "Istanbul",
    district: "Kadikoy",
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
    createdAt: new Date("2026-09-01T10:00:00.000Z"),
    updatedAt: new Date("2026-09-01T10:00:00.000Z"),
  },
  {
    id: 30006,
    userId: 3,
    categoryId: 1,
    title: "Cankaya'da Site Icinde 2+1 Kiralik",
    description:
      "Guvenlikli site, acik otopark, merkezi konum ve temiz kullanim.",
    price: 28500,
    currency: "TRY",
    city: "Ankara",
    district: "Cankaya",
    neighborhood: "Ayranci",
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
    createdAt: new Date("2026-09-02T08:30:00.000Z"),
    updatedAt: new Date("2026-09-02T08:30:00.000Z"),
  },
  {
    id: 30007,
    userId: 4,
    categoryId: 1,
    title: "Izmir Urla'da Bahceli Mustakil Ev",
    description:
      "Sessiz sokakta, genis bahceli, aile yasamina uygun mustakil ev.",
    price: 9800000,
    currency: "TRY",
    city: "Izmir",
    district: "Urla",
    neighborhood: "Iskele",
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
    size: 220,
    createdAt: new Date("2026-09-02T11:15:00.000Z"),
    updatedAt: new Date("2026-09-02T11:15:00.000Z"),
  },
];

let favorites: Favorite[] = [];
let messages: Message[] = [];
let savedSearches: SavedSearch[] = [];

function getCookie(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const cookie of header.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(value.join("="));
    }
  }

  return null;
}

function getUser(request: Request) {
  return getCookie(request, COOKIE_NAME) === "demo-user" ? demoUser : null;
}

function getSessionCookie(request: Request, maxAge: number) {
  const secure = new URL(request.url).protocol === "https:";
  const sameSite = secure ? "None" : "Lax";
  const securePart = secure ? "; Secure" : "";

  return `${COOKIE_NAME}=demo-user; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}${securePart}`;
}

function getExpiredSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:";
  const sameSite = secure ? "None" : "Lax";
  const securePart = secure ? "; Secure" : "";

  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${securePart}`;
}

function getSafeRedirect(request: Request) {
  const redirect = new URL(request.url).searchParams.get("redirect") ?? "/";
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return "/";
  return redirect;
}

function paginate<T>(items: T[], limit = 20, offset = 0) {
  return items.slice(offset, offset + limit);
}

function searchListings(params: {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  district?: string;
  status?: string;
  limit?: number;
  offset?: number;
  bounds?: { north: number; south: number; east: number; west: number };
}) {
  let results = [...listings];

  if (params.categoryId) {
    results = results.filter((listing) => listing.categoryId === params.categoryId);
  }
  if (params.status) {
    results = results.filter((listing) => listing.status === params.status);
  }
  if (params.city) {
    results = results.filter((listing) => listing.city === params.city);
  }
  if (params.district) {
    results = results.filter((listing) => listing.district === params.district);
  }
  if (params.minPrice !== undefined) {
    results = results.filter((listing) => listing.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    results = results.filter((listing) => listing.price <= params.maxPrice!);
  }
  if (params.bounds) {
    results = results.filter((listing) => {
      const lat = Number(listing.latitude);
      const lng = Number(listing.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return (
          lat >= params.bounds!.south &&
          lat <= params.bounds!.north &&
          lng >= params.bounds!.west &&
          lng <= params.bounds!.east
        );
      }

      const cityCoordinates = CITY_COORDINATES[listing.city];
      if (!cityCoordinates) return true;

      const [cityLat, cityLng] = cityCoordinates;
      return (
        cityLat >= params.bounds!.south &&
        cityLat <= params.bounds!.north &&
        cityLng >= params.bounds!.west &&
        cityLng <= params.bounds!.east
      );
    });
  }

  return paginate(results, params.limit ?? 20, params.offset ?? 0);
}

const appRouter = t.router({
  system: t.router({
    health: publicProcedure
      .input(z.object({ timestamp: z.number().min(0) }))
      .query(() => ({ ok: true })),
  }),

  auth: t.router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.resHeaders.append("Set-Cookie", getExpiredSessionCookie(ctx.req));
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
        const now = new Date();
        const id = nextListingId++;
        const coordinates = CITY_COORDINATES[input.city] ?? null;

        listings = [
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
            latitude: coordinates ? String(coordinates[0]) : null,
            longitude: coordinates ? String(coordinates[1]) : null,
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
          ...listings,
        ];

        return { id };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => listings.find((listing) => listing.id === input.id)),

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
      .query(({ input }) => searchListings(input)),

    myListings: protectedProcedure.query(({ ctx }) =>
      listings.filter((listing) => listing.userId === ctx.user.id)
    ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          status: z.enum(["active", "sold", "deleted"]).optional(),
          images: z.array(z.string()).optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const { id, images, ...updates } = input;
        const listing = listings.find((item) => item.id === input.id);
        if (!listing || listing.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        listings = listings.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                images: images ? JSON.stringify(images) : item.images,
                updatedAt: new Date(),
              }
            : item
        );

        return { success: true } as const;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        const listing = listings.find((item) => item.id === input.id);
        if (!listing || listing.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        listings = listings.filter((item) => item.id !== input.id);
        favorites = favorites.filter((favorite) => favorite.listingId !== input.id);

        return { success: true } as const;
      }),
  }),

  favorites: t.router({
    add: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(({ ctx, input }) => {
        if (
          !favorites.some(
            (favorite) =>
              favorite.userId === ctx.user.id && favorite.listingId === input.listingId
          )
        ) {
          favorites = [
            ...favorites,
            {
              id: nextFavoriteId++,
              userId: ctx.user.id,
              listingId: input.listingId,
              createdAt: new Date(),
            },
          ];
        }

        return { success: true } as const;
      }),

    remove: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(({ ctx, input }) => {
        favorites = favorites.filter(
          (favorite) =>
            favorite.userId !== ctx.user.id || favorite.listingId !== input.listingId
        );

        return { success: true } as const;
      }),

    list: protectedProcedure.query(({ ctx }) =>
      favorites.filter((favorite) => favorite.userId === ctx.user.id)
    ),
  }),

  categories: t.router({
    list: publicProcedure.query(() => demoCategories),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) =>
        demoCategories.find((category) => category.id === input.id)
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
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
        const extension = input.filename.split(".").pop() || "jpg";
        const key = `demo/listings/${ctx.user.id}/${Date.now()}.${extension}`;

        return {
          url: `data:${input.mimeType};base64,${base64Data}`,
          key,
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
        const id = nextMessageId++;
        messages = [
          ...messages,
          {
            id,
            senderId: ctx.user.id,
            receiverId: input.receiverId,
            listingId: input.listingId,
            content: input.content,
            isRead: 0,
            createdAt: new Date(),
          },
        ];

        return { id };
      }),

    conversations: protectedProcedure.query(({ ctx }) => {
      const conversations = new Map<
        number,
        {
          partnerId: number;
          listingId: number;
          lastMessage: string;
          lastMessageAt: Date;
          unreadCount: number;
        }
      >();

      for (const message of [...messages].reverse()) {
        if (message.senderId !== ctx.user.id && message.receiverId !== ctx.user.id) {
          continue;
        }

        const partnerId =
          message.senderId === ctx.user.id ? message.receiverId : message.senderId;

        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            partnerId,
            listingId: message.listingId,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unreadCount:
              message.receiverId === ctx.user.id && !message.isRead ? 1 : 0,
          });
        } else if (message.receiverId === ctx.user.id && !message.isRead) {
          conversations.get(partnerId)!.unreadCount += 1;
        }
      }

      return Array.from(conversations.values());
    }),

    getConversation: protectedProcedure
      .input(z.object({ partnerId: z.number(), listingId: z.number() }))
      .query(({ ctx, input }) => {
        const conversation = messages.filter(
          (message) =>
            message.listingId === input.listingId &&
            ((message.senderId === ctx.user.id &&
              message.receiverId === input.partnerId) ||
              (message.senderId === input.partnerId &&
                message.receiverId === ctx.user.id))
        );

        messages = messages.map((message) =>
          message.receiverId === ctx.user.id &&
          message.senderId === input.partnerId &&
          message.listingId === input.listingId
            ? { ...message, isRead: 1 }
            : message
        );

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
        const now = new Date();
        const savedSearch: SavedSearch = {
          id: nextSavedSearchId++,
          userId: ctx.user.id,
          name: input.name,
          filters: JSON.stringify(input.filters),
          isActive: 1,
          emailNotifications: input.emailNotifications ? 1 : 0,
          lastNotifiedAt: null,
          createdAt: now,
          updatedAt: now,
        };

        savedSearches = [savedSearch, ...savedSearches];
        return savedSearch;
      }),

    list: protectedProcedure.query(({ ctx }) =>
      savedSearches
        .filter((search) => search.userId === ctx.user.id)
        .map((search) => ({
          ...search,
          filters: JSON.parse(search.filters),
        }))
    ),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        savedSearches = savedSearches.filter(
          (search) => search.id !== input.id || search.userId !== ctx.user.id
        );

        return { success: true } as const;
      }),

    toggleNotifications: protectedProcedure
      .input(z.object({ id: z.number(), enabled: z.boolean() }))
      .mutation(({ ctx, input }) => {
        savedSearches = savedSearches.map((search) =>
          search.id === input.id && search.userId === ctx.user.id
            ? {
                ...search,
                emailNotifications: input.enabled ? 1 : 0,
                updatedAt: new Date(),
              }
            : search
        );

        return { success: true } as const;
      }),

    triggerNotifications: protectedProcedure.mutation(({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have required permission (10002)",
        });
      }

      return {
        processed: 0,
        sent: 0,
        errors: 0,
      };
    }),
  }),
});

function handleDemoLogin(request: Request) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: getSafeRedirect(request),
      "Set-Cookie": getSessionCookie(
        request,
        Math.floor(ONE_YEAR_MS / 1000)
      ),
    },
  });
}

function handleSitemap(request: Request) {
  const origin = new URL(request.url).origin;
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc></url>
  <url><loc>${origin}/browse</loc></url>
  <url><loc>${origin}/create-listing</loc></url>
</urlset>`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8",
      },
    }
  );
}

async function serveAsset(request: Request, env: Env) {
  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.includes(".")) {
    return assetResponse;
  }

  return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
}

const worker = {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/api/demo-login") {
      return handleDemoLogin(request);
    }

    if (url.pathname === "/sitemap.xml") {
      return handleSitemap(request);
    }

    if (url.pathname.startsWith("/api/trpc")) {
      return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext: ({ req, resHeaders }) => ({
          req,
          resHeaders,
          user: getUser(req),
        }),
      });
    }

    return serveAsset(request, env);
  },
};

export default worker;
