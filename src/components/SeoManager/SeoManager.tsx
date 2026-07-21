import { useEffect } from 'react';
import { useLocale } from '../../store/LocaleContext';

interface SeoManagerProps {
  isAuthenticated: boolean;
}

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://financas.claranhan.com.br').replace(/\/$/, '');

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

export function SeoManager({ isAuthenticated }: SeoManagerProps) {
  const { locale, t } = useLocale();

  useEffect(() => {
    const pathname = window.location.pathname;
    const isPrivacyPage = pathname === '/privacidade';
    const isPublicHome = pathname === '/' && !isAuthenticated;
    const isIndexable = isPrivacyPage || isPublicHome;
    const canonicalPath = isPrivacyPage ? '/privacidade' : '/';
    const canonicalUrl = `${siteUrl}${canonicalPath}`;
    const title = isPrivacyPage ? t('seo.privacyTitle') : t('seo.title');
    const description = isPrivacyPage ? t('seo.privacyDescription') : t('seo.description');
    const imageUrl = `${siteUrl}/og-image.jpg`;

    document.title = title;
    document.documentElement.lang = locale;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', isIndexable ? 'index, follow' : 'noindex, nofollow');
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', locale.replace('-', '_'));
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [isAuthenticated, locale, t]);

  return null;
}
