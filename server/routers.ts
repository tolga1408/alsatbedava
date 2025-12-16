import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  listings: router({
    create: protectedProcedure
      .input(z.object({
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
      }))
      .mutation(async ({ ctx, input }) => {
        const { createListing } = await import('./db');
        const listingId = await createListing({
          ...input,
          userId: ctx.user.id,
          status: 'active',
          images: input.images ? JSON.stringify(input.images) : null,
        });
        return { id: listingId };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getListingById } = await import('./db');
        return await getListingById(input.id);
      }),

    search: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        status: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
        bounds: z.object({
          north: z.number(),
          south: z.number(),
          east: z.number(),
          west: z.number(),
        }).optional(),
      }))
      .query(async ({ input }) => {
        const { searchListings } = await import('./db');
        return await searchListings(input);
      }),

    myListings: protectedProcedure
      .query(async ({ ctx }) => {
        const { getListingsByUserId } = await import('./db');
        return await getListingsByUserId(ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        status: z.string().optional(),
        images: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateListing, getListingById } = await import('./db');
        const listing = await getListingById(input.id);
        if (!listing || listing.userId !== ctx.user.id) {
          throw new Error('Not authorized');
        }
        const { id, images, ...updates } = input;
        const finalUpdates: any = { ...updates };
        if (images) {
          finalUpdates.images = JSON.stringify(images);
        }
        await updateListing(id, finalUpdates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteListing, getListingById } = await import('./db');
        const listing = await getListingById(input.id);
        if (!listing || listing.userId !== ctx.user.id) {
          throw new Error('Not authorized');
        }
        await deleteListing(input.id);
        return { success: true };
      }),
  }),

  favorites: router({
    add: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { addFavorite } = await import('./db');
        await addFavorite(ctx.user.id, input.listingId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ listingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { removeFavorite } = await import('./db');
        await removeFavorite(ctx.user.id, input.listingId);
        return { success: true };
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserFavorites } = await import('./db');
        return await getUserFavorites(ctx.user.id);
      }),
  }),

  categories: router({
    list: publicProcedure
      .query(async () => {
        const { getAllCategories } = await import('./db');
        return await getAllCategories();
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getCategoryById } = await import('./db');
        return await getCategoryById(input.id);
      }),
  }),

  upload: router({
    image: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        // Convert base64 to buffer
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const ext = input.filename.split('.').pop();
        const key = `listings/${ctx.user.id}/${timestamp}-${randomStr}.${ext}`;
        
        // Upload to S3
        const result = await storagePut(key, buffer, input.mimeType);
        
        return { url: result.url, key };
      }),
  }),

  messages: router({
    send: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        listingId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { sendMessage } = await import('./db');
        const messageId = await sendMessage({
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          listingId: input.listingId,
          content: input.content,
        });
        return { id: messageId };
      }),

    conversations: protectedProcedure
      .query(async ({ ctx }) => {
        const { getConversations } = await import('./db');
        return await getConversations(ctx.user.id);
      }),

    getConversation: protectedProcedure
      .input(z.object({
        partnerId: z.number(),
        listingId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const { getConversationMessages } = await import('./db');
        return await getConversationMessages(ctx.user.id, input.partnerId, input.listingId);
      }),
  }),

  savedSearches: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        filters: z.object({
          categoryId: z.number().optional(),
          city: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
        }),
        emailNotifications: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createSavedSearch } = await import('./db');
        return await createSavedSearch({
          userId: ctx.user.id,
          name: input.name,
          filters: JSON.stringify(input.filters),
          emailNotifications: input.emailNotifications ? 1 : 0,
        });
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserSavedSearches } = await import('./db');
        const searches = await getUserSavedSearches(ctx.user.id);
        // Parse filters JSON for each search
        return searches.map(s => ({
          ...s,
          filters: JSON.parse(s.filters),
        }));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteSavedSearch } = await import('./db');
        return await deleteSavedSearch(input.id, ctx.user.id);
      }),

    toggleNotifications: protectedProcedure
      .input(z.object({ id: z.number(), enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const { toggleSavedSearchNotifications } = await import('./db');
        return await toggleSavedSearchNotifications(input.id, ctx.user.id, input.enabled);
      }),

    triggerNotifications: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Only allow admin users to trigger notifications
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }
        const { processSavedSearchNotifications } = await import('./jobs/savedSearchNotifications');
        const result = await processSavedSearchNotifications();
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
