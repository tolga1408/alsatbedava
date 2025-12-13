import { useEffect } from 'react';
import { updateMetaTags, setCanonicalUrl, type SEOConfig } from '@/lib/seo';

/**
 * React hook for managing SEO meta tags
 * Usage: useSEO({ title: 'Page Title', description: '...' })
 */
export function useSEO(config: Partial<SEOConfig>) {
  useEffect(() => {
    updateMetaTags(config);
    
    if (config.url) {
      setCanonicalUrl(config.url);
    }
    
    // Cleanup: Reset to default on unmount
    return () => {
      updateMetaTags({
        title: 'Alsatbedava.com - Türkiye\'nin Adil Pazarı',
        description: 'Gerçek ilanlar, adil fiyatlar, sıfır komisyon.',
      });
    };
  }, [config]);
}
