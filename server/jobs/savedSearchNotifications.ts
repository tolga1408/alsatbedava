import { eq, and, gte } from "drizzle-orm";
import { getDb } from "../db";
import { savedSearches, listings, users } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

interface SavedSearchFilters {
  categoryId?: number;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface NotificationResult {
  totalSearches: number;
  notificationsSent: number;
  errors: number;
  details: Array<{
    searchId: number;
    searchName: string;
    userId: number;
    userEmail: string | null;
    matchingListings: number;
    status: 'success' | 'error';
    error?: string;
  }>;
}

/**
 * Send email notification to user about new listings matching their saved search
 * Currently in test mode - logs to console and notifies owner
 * 
 * TODO: Integrate real email service (SendGrid, AWS SES, or Resend)
 * 1. Install email service package: pnpm add @sendgrid/mail (or equivalent)
 * 2. Add API key to secrets via webdev_request_secrets
 * 3. Replace this placeholder with actual email sending code
 */
async function sendSavedSearchNotification(
  userEmail: string,
  userName: string | null,
  searchName: string,
  matchingListings: any[]
): Promise<void> {
  console.log('[SavedSearchNotifications] TEST MODE - Would send email:');
  console.log(`  To: ${userEmail}`);
  console.log(`  Subject: New listings matching "${searchName}"`);
  console.log(`  Listings count: ${matchingListings.length}`);
  console.log(`  Listings:`, matchingListings.map(l => ({
    id: l.id,
    title: l.title,
    price: l.price,
    city: l.city,
  })));
  
  // TODO: Replace with actual email sending
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: userEmail,
  //   from: 'notifications@alsatbedava.com',
  //   subject: `New listings matching "${searchName}"`,
  //   html: generateEmailHtml(userName, searchName, matchingListings),
  // });
}

/**
 * Find listings matching the saved search filters
 * Only returns listings created in the last 12 hours
 */
async function findMatchingListings(
  filters: SavedSearchFilters,
  lastNotifiedAt: Date | null
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  // Calculate 12 hours ago
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  // Use lastNotifiedAt if available, otherwise use 12 hours ago
  const cutoffTime = lastNotifiedAt && lastNotifiedAt > twelveHoursAgo 
    ? lastNotifiedAt 
    : twelveHoursAgo;

  const conditions = [
    gte(listings.createdAt, cutoffTime),
    eq(listings.status, 'active'),
  ];

  if (filters.categoryId) {
    conditions.push(eq(listings.categoryId, filters.categoryId));
  }
  if (filters.city) {
    conditions.push(eq(listings.city, filters.city));
  }
  if (filters.district) {
    conditions.push(eq(listings.district, filters.district));
  }

  let query = db.select().from(listings).where(and(...conditions));

  const results = await query;

  // Filter by price range in memory (since Drizzle doesn't support comparison operators easily)
  return results.filter(listing => {
    if (filters.minPrice && listing.price < filters.minPrice) return false;
    if (filters.maxPrice && listing.price > filters.maxPrice) return false;
    return true;
  });
}

/**
 * Process all saved searches with email notifications enabled
 * Finds new listings matching each search and sends notifications
 */
export async function processSavedSearchNotifications(): Promise<NotificationResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  console.log('[SavedSearchNotifications] Starting job...');

  const result: NotificationResult = {
    totalSearches: 0,
    notificationsSent: 0,
    errors: 0,
    details: [],
  };

  try {
    // Get all saved searches with email notifications enabled
    const searches = await db
      .select()
      .from(savedSearches)
      .where(
        and(
          eq(savedSearches.emailNotifications, 1),
          eq(savedSearches.isActive, 1)
        )
      );

    result.totalSearches = searches.length;
    console.log(`[SavedSearchNotifications] Found ${searches.length} active searches with notifications enabled`);

    for (const search of searches) {
      try {
        // Get user info
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, search.userId))
          .limit(1);

        if (!user || !user.email) {
          console.warn(`[SavedSearchNotifications] User ${search.userId} not found or has no email`);
          result.details.push({
            searchId: search.id,
            searchName: search.name,
            userId: search.userId,
            userEmail: null,
            matchingListings: 0,
            status: 'error',
            error: 'User not found or has no email',
          });
          result.errors++;
          continue;
        }

        // Parse filters
        const filters: SavedSearchFilters = JSON.parse(search.filters);

        // Find matching listings
        const matchingListings = await findMatchingListings(filters, search.lastNotifiedAt);

        console.log(`[SavedSearchNotifications] Search "${search.name}" (ID: ${search.id}): ${matchingListings.length} matching listings`);

        if (matchingListings.length > 0) {
          // Send notification
          await sendSavedSearchNotification(
            user.email,
            user.name,
            search.name,
            matchingListings
          );

          // Update lastNotifiedAt
          await db
            .update(savedSearches)
            .set({ lastNotifiedAt: new Date() })
            .where(eq(savedSearches.id, search.id));

          result.notificationsSent++;
          result.details.push({
            searchId: search.id,
            searchName: search.name,
            userId: search.userId,
            userEmail: user.email,
            matchingListings: matchingListings.length,
            status: 'success',
          });
        } else {
          result.details.push({
            searchId: search.id,
            searchName: search.name,
            userId: search.userId,
            userEmail: user.email,
            matchingListings: 0,
            status: 'success',
          });
        }
      } catch (error) {
        console.error(`[SavedSearchNotifications] Error processing search ${search.id}:`, error);
        result.errors++;
        result.details.push({
          searchId: search.id,
          searchName: search.name,
          userId: search.userId,
          userEmail: null,
          matchingListings: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Notify owner about job completion
    await notifyOwner({
      title: '📧 Saved Search Notifications Job Completed',
      message: `
Total searches processed: ${result.totalSearches}
Notifications sent: ${result.notificationsSent}
Errors: ${result.errors}

Details:
${result.details.map(d => 
  `- ${d.searchName} (${d.userEmail}): ${d.matchingListings} listings ${d.status === 'error' ? '❌ ' + d.error : '✅'}`
).join('\n')}
      `.trim(),
    });

    console.log('[SavedSearchNotifications] Job completed:', result);
    return result;
  } catch (error) {
    console.error('[SavedSearchNotifications] Job failed:', error);
    
    await notifyOwner({
      title: '❌ Saved Search Notifications Job Failed',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    
    throw error;
  }
}
