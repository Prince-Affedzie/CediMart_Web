// src/app/sitemap.js
import { getAllProducts } from '@/apis/productApi';
import { getVendors } from '@/apis/vendorApi';
import { CATEGORIES } from '@/constants/listings/categories';
import { SUBCATEGORIES } from '@/constants/listings/subcategories';
import {
  CITY_OPTIONS,
  GHANA_LOCATIONS,          // ← this was missing — the actual root cause
} from '@/constants/listings/options';

export const revalidate = 3600;   // regenerate at most once per hour

const BASE_URL = 'https://cedimartgh.com';

//  Only include products updated in the last N days at full priority.
const FRESH_WINDOW_DAYS = 14;

//  Only include products updated in the last N days at full priority.
function daysSince(date) {
  const then = new Date(date).getTime();
  if (!Number.isFinite(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

//  Build a listings URL with all query params correctly encoded.
//  Using URLSearchParams guarantees that any `&`, `=`, `#`, or space
//  inside a value gets properly escaped, so the resulting URL is always
//  a valid string. Next.js then XML-escapes the `&` separators when it
//  serializes the sitemap, which is the correct behavior.
function buildListingsUrl(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      qs.set(key, String(value));
    }
  }
  const query = qs.toString();
  return query ? `${BASE_URL}/listings?${query}` : `${BASE_URL}/listings`;
}

//  Same idea for product / vendor detail URLs — encode the id so any
//  unexpected characters can't break the URL.
function buildEntityUrl(kind, id) {
  return `${BASE_URL}/${kind}/${encodeURIComponent(String(id))}`;
}

//  Skip any image URL that isn't a fully-qualified http(s) URL. Google
//  rejects image entries pointing at relative paths or non-http schemes.
function validImages(images) {
  if (!Array.isArray(images)) return undefined;
  const cleaned = images
    .filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url))
    .slice(0, 3);
  return cleaned.length > 0 ? cleaned : undefined;
}

export default async function sitemap() {
  const now = new Date();

  //  Every push goes through this — ensures the URL is unique and
  //  well-formed, and that lastModified is a valid ISO string.
  const seen = new Set();
  const entries = [];

  const push = (url, opts = {}) => {
    if (!url || seen.has(url)) return;
    seen.add(url);

    const rawDate = opts.lastModified ? new Date(opts.lastModified) : now;
    const safeDate = Number.isFinite(rawDate.getTime()) ? rawDate : now;

    entries.push({
      url,
      lastModified: safeDate.toISOString(),
      changeFrequency: opts.changeFrequency || 'weekly',
      priority: typeof opts.priority === 'number' ? opts.priority : 0.5,
      ...(opts.images ? { images: opts.images } : {}),
    });
  };

  // ── 1. Static routes ─────────────────────────────────────────────────────
  [
    { path: '',              cf: 'daily',   priority: 1.0 },
    { path: '/listings',     cf: 'daily',   priority: 0.9 },
    { path: '/about',        cf: 'monthly', priority: 0.4 },
    { path: '/contact',      cf: 'monthly', priority: 0.4 },
    { path: '/sell',         cf: 'weekly',  priority: 0.7 },
    { path: '/ai-assistant', cf: 'weekly',  priority: 0.6 },
  ].forEach(({ path, cf, priority }) => {
    push(`${BASE_URL}${path}`, {
      lastModified: now,
      changeFrequency: cf,
      priority,
    });
  });

  // ── 2. Category + subcategory routes ─────────────────────────────────────
  for (const cat of CATEGORIES || []) {
    if (!cat?.id || cat.id === 'all') continue;

    push(buildListingsUrl({ category: cat.id }), {
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    });

    //  Category subcategories live in SUBCATEGORIES_MAP on the web side,
    //  keyed by category id, each entry being { key, label } or
    //  { value, label }. We handle both shapes.
    const subs = SUBCATEGORIES?.[cat.id] || [];
    for (const sub of subs) {
      const subKey = sub?.value || sub?.key || sub?.id;
      if (!subKey) continue;
      push(buildListingsUrl({ category: cat.id, sub: subKey }), {
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  // ── 3. City + suburb routes ──────────────────────────────────────────────
  for (const city of CITY_OPTIONS || []) {
    if (!city?.id) continue;

    push(buildListingsUrl({ city: city.id }), {
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    });

    const suburbs = GHANA_LOCATIONS?.[city.id]?.suburbs || [];
    for (const sub of suburbs) {
      if (!sub || typeof sub !== 'string') continue;
      push(buildListingsUrl({ city: city.id, suburb: sub }), {
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  // ── 4. Product routes ────────────────────────────────────────────────────
  try {
    const res = await getAllProducts({ limit: 1000, sort: 'newest' });
    const d = res?.data;
    const products = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];

    for (const p of Array.isArray(products) ? products : []) {
      const id = p?._id || p?.id;
      if (!id) continue;

      const updated = p.updatedAt || p.createdAt || now;
      const isFresh = daysSince(updated) <= FRESH_WINDOW_DAYS;

      push(buildEntityUrl('product', id), {
        lastModified: updated,
        changeFrequency: isFresh ? 'daily' : 'weekly',
        priority: isFresh ? 0.9 : 0.6,
        images: validImages(p.images),
      });
    }
  } catch (err) {
    console.error('[sitemap] Failed to fetch products:', err?.message || err);
  }

  // ── 5. Vendor routes ─────────────────────────────────────────────────────
  try {
    const res = await getVendors({ limit: 1000, sortBy: 'rating', order: 'desc' });
    const d = res?.data;
    const vendors = d?.data?.vendors || d?.data?.data || d?.vendors || d?.data || d || [];

    for (const v of Array.isArray(vendors) ? vendors : []) {
      const id = v?._id || v?.id;
      if (!id) continue;

      const updated = v.updatedAt || v.createdAt || now;

      push(buildEntityUrl('vendors', id), {
        lastModified: updated,
        changeFrequency: 'weekly',
        priority: 0.7,
        images:
          v.profileImage && /^https?:\/\//i.test(v.profileImage)
            ? [v.profileImage]
            : undefined,
      });
    }
  } catch (err) {
    console.error('[sitemap] Failed to fetch vendors:', err?.message || err);
  }

  // ── 6. Return everything ─────────────────────────────────────────────────
  return entries;
}