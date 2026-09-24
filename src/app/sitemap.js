// src/app/sitemap.js
import { getAllProducts } from '@/apis/productApi';
import { getVendors } from '@/apis/vendorApi';
import { CATEGORIES } from '@/constants/listings/categories';
import { CITY_OPTIONS, GHANA_LOCATIONS } from '@/constants/listings/options';

export const revalidate = 3600;   // regenerate at most once per hour

const BASE_URL = 'https://cedimartgh.com';

//  Only include products updated in the last N days at full priority.
//  Older products stay in the sitemap but rank lower — this encourages
//  Google to focus crawl budget on fresh listings.
const FRESH_WINDOW_DAYS = 14;

function daysSince(date) {
  const then = new Date(date).getTime();
  if (!Number.isFinite(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

export default async function sitemap() {
  const now = new Date();

  // ── 1. Static routes ─────────────────────────────────────────────────────
  const staticRoutes = [
    { path: '',              cf: 'daily',   priority: 1.0 },
    { path: '/listings',     cf: 'daily',   priority: 0.9 },
    { path: '/about',        cf: 'monthly', priority: 0.4 },
    { path: '/contact',      cf: 'monthly', priority: 0.4 },
    { path: '/sell',         cf: 'weekly',  priority: 0.7 },
    { path: '/ai-assistant', cf: 'weekly',  priority: 0.6 },
  ].map(({ path, cf, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: cf,
    priority,
  }));

  // ── 2. Category routes ───────────────────────────────────────────────────
  //  Each category and subcategory gets its own URL for the /listings page.
  //  This is the long-tail SEO play — "buy fashion in Ghana", "shop phones
  //  and tablets Ghana", etc.
  const categoryRoutes = [];
  for (const cat of CATEGORIES || []) {
    if (!cat?.id || cat.id === 'all') continue;
    categoryRoutes.push({
      url: `${BASE_URL}/listings?category=${encodeURIComponent(cat.id)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    });

    const subs = SUBCATEGORIES?.[cat.id] || [];
    for (const sub of subs) {
      const subKey = sub?.value || sub?.key || sub?.id;
      if (!subKey) continue;
      categoryRoutes.push({
        url: `${BASE_URL}/listings?category=${encodeURIComponent(cat.id)}&sub=${encodeURIComponent(subKey)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  // ── 3. City + suburb routes ──────────────────────────────────────────────
  //  Same play as categories, but for location-based queries. The city
  //  coverage is what makes "buy laptop Madina" surface your site.
  const cityRoutes = [];
  for (const city of CITY_OPTIONS || []) {
    if (!city?.id) continue;
    cityRoutes.push({
      url: `${BASE_URL}/listings?city=${encodeURIComponent(city.id)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    });

    const suburbs = GHANA_LOCATIONS?.[city.id]?.suburbs || [];
    for (const sub of suburbs) {
      cityRoutes.push({
        url: `${BASE_URL}/listings?city=${encodeURIComponent(city.id)}&suburb=${encodeURIComponent(sub)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  // ── 4. Product routes (dynamic) ──────────────────────────────────────────
  let productRoutes = [];
  try {
    //  Fetch as many products as your API allows in one call.
    //  If you have >10k products, page through the API here.
    const res = await getAllProducts({ limit: 1000, sort: 'newest' });
    const d = res?.data;
    const products = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];

    productRoutes = (Array.isArray(products) ? products : [])
      .filter((p) => p?._id || p?.id)
      .map((p) => {
        const id = p._id || p.id;
        const updated = p.updatedAt || p.createdAt || now;
        const isFresh = daysSince(updated) <= FRESH_WINDOW_DAYS;

        return {
          url: `${BASE_URL}/product/${id}`,
          lastModified: new Date(updated),
          changeFrequency: isFresh ? 'daily' : 'weekly',
          priority: isFresh ? 0.9 : 0.6,

          //  Google Images is huge for marketplaces. This tells Google
          //  where the product photo lives so it can be indexed in the
          //  image search results too.
          images: p.images?.slice(0, 3).map((url) => `${url}`) || undefined,
        };
      });
  } catch (err) {
    console.error('[sitemap] Failed to fetch products:', err?.message || err);
    //  Fail soft — don't break the whole sitemap because one API call
    //  failed. Google will just see fewer URLs this time.
  }

  // ── 5. Vendor routes (dynamic) ───────────────────────────────────────────
  let vendorRoutes = [];
  try {
    const res = await getVendors({ limit: 1000, sortBy: 'rating', order: 'desc' });
    const d = res?.data;
    const vendors = d?.data?.vendors || d?.data?.data || d?.vendors || d?.data || d || [];

    vendorRoutes = (Array.isArray(vendors) ? vendors : [])
      .filter((v) => v?._id || v?.id)
      .map((v) => {
        const id = v._id || v.id;
        const updated = v.updatedAt || v.createdAt || now;
        return {
          url: `${BASE_URL}/vendors/${id}`,
          lastModified: new Date(updated),
          changeFrequency: 'weekly',
          priority: 0.7,
          images: v.profileImage && /^https?:/i.test(v.profileImage)
            ? [v.profileImage]
            : undefined,
        };
      });
  } catch (err) {
    console.error('[sitemap] Failed to fetch vendors:', err?.message || err);
  }

  // ── 6. Return everything ─────────────────────────────────────────────────
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...cityRoutes,
    ...productRoutes,
    ...vendorRoutes,
  ];
}