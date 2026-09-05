import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { getOrCreateSitesUser } from "./sites/auth";
import {
  addFavorite,
  createListing,
  createReport,
  createSavedSearch,
  deleteListing,
  deleteSavedSearch,
  getCategoryById,
  getConversation,
  getConversations,
  getListingById,
  getListingsByUserId,
  listCategories,
  listFavorites,
  listSavedSearches,
  removeFavorite,
  searchListings,
  sendMessage,
  toggleSavedSearchNotifications,
  updateListing,
  type BetaUser,
} from "./sites/database";
import type { ExecutionContext, SitesEnv } from "./sites/platform";

type Context = {
  req: Request;
  resHeaders: Headers;
  env: SitesEnv;
  user: BetaUser | null;
};

const t = initTRPC.context<Context>().create({ transformer: superjson });
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Please login (10001)",
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);

const titleSchema = z.string().trim().min(5).max(200);
const descriptionSchema = z.string().trim().min(10).max(5000);
const citySchema = z.string().trim().min(2).max(100);
const optionalShortText = z.string().trim().max(100).optional();
const imageUrlSchema = z.string().max(2048);
const listingStatusSchema = z.enum(["active", "sold", "deleted"]);

const listingCreateSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  price: z.number().positive().max(2_000_000_000),
  categoryId: z.number().int().min(1).max(5),
  city: citySchema,
  district: optionalShortText,
  images: z.array(imageUrlSchema).max(10).optional(),
  propertyType: optionalShortText,
  rooms: z.number().int().min(0).max(100).optional(),
  size: z.number().positive().max(10_000_000).optional(),
});

const searchSchema = z.object({
  search: z.string().trim().max(200).optional(),
  categoryId: z.number().int().min(1).max(5).optional(),
  city: citySchema.optional(),
  district: optionalShortText,
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  status: listingStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  bounds: z
    .object({
      north: z.number().min(-90).max(90),
      south: z.number().min(-90).max(90),
      east: z.number().min(-180).max(180),
      west: z.number().min(-180).max(180),
    })
    .optional(),
});

const appRouter = t.router({
  system: t.router({
    health: publicProcedure
      .input(z.object({ timestamp: z.number().min(0) }))
      .query(() => ({ ok: true })),
  }),

  auth: t.router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(() => ({ success: true }) as const),
  }),

  listings: t.router({
    create: protectedProcedure
      .input(listingCreateSchema)
      .mutation(async ({ ctx, input }) => ({
        id: await createListing(ctx.env.DB, ctx.user.id, input),
      })),

    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(({ ctx, input }) => getListingById(ctx.env.DB, input.id)),

    search: publicProcedure
      .input(searchSchema)
      .query(({ ctx, input }) => searchListings(ctx.env.DB, input)),

    myListings: protectedProcedure.query(({ ctx }) =>
      getListingsByUserId(ctx.env.DB, ctx.user.id)
    ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          title: titleSchema.optional(),
          description: descriptionSchema.optional(),
          price: z.number().positive().max(2_000_000_000).optional(),
          status: listingStatusSchema.optional(),
          images: z.array(imageUrlSchema).max(10).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await updateListing(ctx.env.DB, ctx.user.id, input);
        } catch (error) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              error instanceof Error ? error.message : "Listing update failed",
          });
        }
        return { success: true } as const;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await deleteListing(ctx.env.DB, ctx.user.id, input.id);
        } catch (error) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              error instanceof Error ? error.message : "Listing delete failed",
          });
        }
        return { success: true } as const;
      }),
  }),

  favorites: t.router({
    add: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await addFavorite(ctx.env.DB, ctx.user.id, input.listingId);
        return { success: true } as const;
      }),

    remove: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await removeFavorite(ctx.env.DB, ctx.user.id, input.listingId);
        return { success: true } as const;
      }),

    list: protectedProcedure.query(({ ctx }) =>
      listFavorites(ctx.env.DB, ctx.user.id)
    ),
  }),

  categories: t.router({
    list: publicProcedure.query(({ ctx }) => listCategories(ctx.env.DB)),
    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(({ ctx, input }) => getCategoryById(ctx.env.DB, input.id)),
  }),

  upload: t.router({
    image: protectedProcedure
      .input(
        z.object({
          base64: z.string().max(7_500_000),
          filename: z.string().trim().min(1).max(255),
          mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const bytes = decodeBase64Image(input.base64);
        if (bytes.byteLength > 5 * 1024 * 1024) {
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: "Images must be 5 MB or smaller",
          });
        }

        const extension = imageExtension(input.mimeType);
        const key = `listings/${ctx.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
        await ctx.env.UPLOADS.put(key, bytes, {
          httpMetadata: { contentType: input.mimeType },
        });

        return {
          key,
          url: `${new URL(ctx.req.url).origin}/api/uploads/${key}`,
        };
      }),
  }),

  messages: t.router({
    send: protectedProcedure
      .input(
        z.object({
          receiverId: z.number().int().positive(),
          listingId: z.number().int().positive(),
          content: z.string().trim().min(1).max(2000),
        })
      )
      .mutation(async ({ ctx, input }) => ({
        id: await sendMessage(ctx.env.DB, ctx.user.id, input),
      })),

    conversations: protectedProcedure.query(({ ctx }) =>
      getConversations(ctx.env.DB, ctx.user.id)
    ),

    getConversation: protectedProcedure
      .input(
        z.object({
          partnerId: z.number().int().positive(),
          listingId: z.number().int().positive(),
        })
      )
      .query(({ ctx, input }) =>
        getConversation(
          ctx.env.DB,
          ctx.user.id,
          input.partnerId,
          input.listingId
        )
      ),
  }),

  savedSearches: t.router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().trim().min(1).max(100),
          filters: z.object({
            search: z.string().trim().max(200).optional(),
            categoryId: z.number().int().min(1).max(5).optional(),
            city: citySchema.optional(),
            minPrice: z.number().nonnegative().optional(),
            maxPrice: z.number().positive().optional(),
          }),
          emailNotifications: z.boolean().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createSavedSearch(ctx.env.DB, ctx.user.id, input)
      ),

    list: protectedProcedure.query(({ ctx }) =>
      listSavedSearches(ctx.env.DB, ctx.user.id)
    ),

    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await deleteSavedSearch(ctx.env.DB, ctx.user.id, input.id);
        return { success: true } as const;
      }),

    toggleNotifications: protectedProcedure
      .input(
        z.object({ id: z.number().int().positive(), enabled: z.boolean() })
      )
      .mutation(async ({ ctx, input }) => {
        await toggleSavedSearchNotifications(
          ctx.env.DB,
          ctx.user.id,
          input.id,
          input.enabled
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
      return { processed: 0, sent: 0, errors: 0 };
    }),
  }),

  reports: t.router({
    create: protectedProcedure
      .input(
        z.object({
          listingId: z.number().int().positive(),
          reason: z.enum(["spam", "fraud", "inappropriate", "sold", "other"]),
          description: z.string().trim().max(1000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => ({
        id: await createReport(ctx.env.DB, ctx.user.id, input),
      })),
  }),
});

function decodeBase64Image(value: string): Uint8Array {
  const payload = value.includes(",")
    ? value.slice(value.indexOf(",") + 1)
    : value;
  let binary: string;
  try {
    binary = atob(payload);
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image data" });
  }

  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function imageExtension(mimeType: "image/jpeg" | "image/png" | "image/webp") {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function handleSitemap(request: Request) {
  const origin = new URL(request.url).origin;
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc></url>
  <url><loc>${origin}/browse</loc></url>
</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8" } }
  );
}

async function serveUpload(request: Request, env: SitesEnv) {
  const pathname = new URL(request.url).pathname;
  const key = decodeURIComponent(pathname.slice("/api/uploads/".length));
  if (!key || key.includes("..") || !key.startsWith("listings/")) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.UPLOADS.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}

async function serveAsset(request: Request, env: SitesEnv) {
  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) return assetResponse;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.includes(".")) {
    return assetResponse;
  }

  return env.ASSETS.fetch(
    new Request(new URL("/index.html", request.url), request)
  );
}

const worker = {
  async fetch(request: Request, env: SitesEnv, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap.xml") return handleSitemap(request);
    if (url.pathname.startsWith("/api/uploads/")) {
      return serveUpload(request, env);
    }
    if (url.pathname.startsWith("/api/trpc")) {
      return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext: async ({ req, resHeaders }) => ({
          req,
          resHeaders,
          env,
          user: await getOrCreateSitesUser(req, env.DB),
        }),
      });
    }

    return serveAsset(request, env);
  },
};

export default worker;
