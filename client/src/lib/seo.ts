/**
 * SEO Utilities for Alsatbedava.com
 * Handles dynamic meta tags, Open Graph, Twitter Cards, and structured data
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock';
}

const DEFAULT_SEO: SEOConfig = {
  title: 'Alsatbedava.com - Türkiye\'nin Adil Pazarı | Al, Sat, Komisyon Ödeme',
  description: 'Gerçek ilanlar, adil fiyatlar, sıfır komisyon. Sahibinden\'e alternatif. Her ilanı görebilir, komisyon ödemeden alıp satabilirsiniz.',
  keywords: 'emlak, araç, ikinci el, ilan sitesi, sahibinden alternatif, ücretsiz ilan, gayrimenkul, satılık daire, kiralık ev',
  image: 'https://alsatbedava.com/og-image.jpg',
  url: 'https://alsatbedava.com',
  type: 'website',
};

/**
 * Update document meta tags dynamically
 */
export function updateMetaTags(config: Partial<SEOConfig>) {
  const seo = { ...DEFAULT_SEO, ...config };

  // Update title
  document.title = seo.title;

  // Helper to set or update meta tag
  const setMetaTag = (name: string, content: string, isProperty = false) => {
    const attribute = isProperty ? 'property' : 'name';
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  // Standard meta tags
  setMetaTag('description', seo.description);
  if (seo.keywords) {
    setMetaTag('keywords', seo.keywords);
  }
  if (seo.author) {
    setMetaTag('author', seo.author);
  }

  // Open Graph tags
  setMetaTag('og:title', seo.title, true);
  setMetaTag('og:description', seo.description, true);
  setMetaTag('og:type', seo.type || 'website', true);
  if (seo.url) {
    setMetaTag('og:url', seo.url, true);
  }
  if (seo.image) {
    setMetaTag('og:image', seo.image, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
  }
  setMetaTag('og:site_name', 'Alsatbedava.com', true);
  setMetaTag('og:locale', 'tr_TR', true);

  // Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', seo.title);
  setMetaTag('twitter:description', seo.description);
  if (seo.image) {
    setMetaTag('twitter:image', seo.image);
  }

  // Article-specific tags
  if (seo.type === 'article') {
    if (seo.publishedTime) {
      setMetaTag('article:published_time', seo.publishedTime, true);
    }
    if (seo.modifiedTime) {
      setMetaTag('article:modified_time', seo.modifiedTime, true);
    }
    if (seo.author) {
      setMetaTag('article:author', seo.author, true);
    }
  }

  // Product-specific tags (for listings)
  if (seo.type === 'product' && seo.price) {
    setMetaTag('product:price:amount', seo.price.toString(), true);
    setMetaTag('product:price:currency', seo.currency || 'TRY', true);
    if (seo.availability) {
      setMetaTag('product:availability', seo.availability, true);
    }
  }
}

/**
 * Generate structured data (Schema.org JSON-LD) for listings
 */
export function generateListingStructuredData(listing: {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  city: string;
  district?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
  };
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'TRY',
      availability: 'https://schema.org/InStock',
      url: `https://alsatbedava.com/listing/${listing.id}`,
      seller: {
        '@type': 'Person',
        name: listing.user?.name || 'Alsatbedava Kullanıcısı',
      },
    },
    category: listing.category,
    location: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.district || listing.city,
        addressRegion: listing.city,
        addressCountry: 'TR',
      },
    },
    datePublished: listing.createdAt.toISOString(),
    dateModified: listing.updatedAt.toISOString(),
  };

  return structuredData;
}

/**
 * Inject structured data into page
 */
export function injectStructuredData(data: object) {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Create new script tag
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * SEO-friendly URL slug generator
 */
export function generateSlug(text: string): string {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get canonical URL for current page
 */
export function getCanonicalUrl(): string {
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    return canonical.getAttribute('href') || window.location.href;
  }
  return window.location.href;
}

/**
 * Set canonical URL
 */
export function setCanonicalUrl(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]');
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  
  canonical.setAttribute('href', url);
}
