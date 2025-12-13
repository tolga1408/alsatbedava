/**
 * Sitemap Generation for Alsatbedava.com
 * Generates XML sitemap for search engines
 */

import { getDb } from './db';
import { listings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate XML sitemap
 */
export async function generateSitemap(): Promise<string> {
  const baseUrl = process.env.VITE_APP_URL || 'https://alsatbedava.com';
  const urls: SitemapUrl[] = [];

  // Static pages
  urls.push(
    { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
    { loc: `${baseUrl}/browse`, changefreq: 'hourly', priority: 0.9 },
    { loc: `${baseUrl}/saved-searches`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${baseUrl}/create-listing`, changefreq: 'monthly', priority: 0.7 },
  );

  // Dynamic listing pages
  try {
    const db = await getDb();
    if (db) {
      const activeListings = await db
        .select({
          id: listings.id,
          updatedAt: listings.updatedAt,
        })
        .from(listings)
        .where(eq(listings.status, 'active'))
        .limit(50000); // Sitemap limit

      for (const listing of activeListings) {
        urls.push({
          loc: `${baseUrl}/listing/${listing.id}`,
          lastmod: listing.updatedAt.toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching listings:', error);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
