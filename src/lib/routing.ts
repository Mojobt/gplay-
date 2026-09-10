// Utility to parse and format proper application URLs
// Supports direct paths (/motoride, /app/motoride), query params (?app=motoride), and hashes (#/app/motoride)

export interface ResolvedRoute {
  view: 'home' | 'categories' | 'search' | 'app-details' | 'admin' | 'downloads';
  slug?: string;
}

export function parseAppUrl(): ResolvedRoute {
  if (typeof window === 'undefined') return { view: 'home' };

  // 1. Query parameters check: e.g. ?app=motoride or ?slug=motoride
  try {
    const params = new URLSearchParams(window.location.search);
    const appQuery = params.get('app') || params.get('slug');
    if (appQuery) {
      return { view: 'app-details', slug: appQuery.trim() };
    }
    const viewQuery = params.get('view');
    if (viewQuery === 'admin') return { view: 'admin' };
    if (viewQuery === 'search') return { view: 'search' };
    if (viewQuery === 'categories') return { view: 'categories' };
    if (viewQuery === 'downloads') return { view: 'downloads' };
  } catch {}

  // 2. Hash check: e.g. #/app/motoride, #/motoride, #motoride
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash) {
    if (hash.startsWith('app/')) {
      const slug = hash.replace(/^app\//, '').trim();
      return { view: 'app-details', slug };
    }
    if (hash === 'admin' || hash.startsWith('admin/')) return { view: 'admin' };
    if (hash === 'search') return { view: 'search' };
    if (hash === 'categories') return { view: 'categories' };
    if (hash === 'downloads') return { view: 'downloads' };
    if (hash === 'motoride' || hash.toLowerCase().includes('motoride')) {
      return { view: 'app-details', slug: 'motoride' };
    }
    if (!['home', ''].includes(hash)) {
      return { view: 'app-details', slug: hash };
    }
  }

  // 3. HTML5 Pathname check: e.g. /motoride, /app/motoride
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
  if (pathname) {
    if (pathname.startsWith('app/')) {
      const slug = pathname.replace(/^app\//, '').trim();
      return { view: 'app-details', slug };
    }
    if (pathname === 'admin' || pathname.startsWith('admin/')) return { view: 'admin' };
    if (pathname === 'search') return { view: 'search' };
    if (pathname === 'categories') return { view: 'categories' };
    if (pathname === 'downloads') return { view: 'downloads' };
    if (pathname === 'motoride' || pathname.toLowerCase().includes('motoride')) {
      return { view: 'app-details', slug: 'motoride' };
    }
    if (!['index.html', 'home', ''].includes(pathname)) {
      return { view: 'app-details', slug: pathname };
    }
  }

  return { view: 'home' };
}

/**
 * Returns formatted shareable URL links for an app.
 * Generates both clean path link (e.g. https://gplay-sooty.vercel.app/motoride)
 * and deep link (/app/motoride) as well as fallback hash link.
 */
export function getAppUrls(slug: string): {
  cleanUrl: string;
  directPathUrl: string;
  hashUrl: string;
  primaryShareUrl: string;
} {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gplay-sooty.vercel.app';
  const cleanUrl = `${origin}/${slug}`;
  const directPathUrl = `${origin}/app/${slug}`;
  const hashUrl = `${origin}/#/app/${slug}`;

  return {
    cleanUrl,
    directPathUrl,
    hashUrl,
    primaryShareUrl: cleanUrl
  };
}
