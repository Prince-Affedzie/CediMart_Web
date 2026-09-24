// src/app/sitemap.js
import { getAllProducts } from '@/apis/productApi';
import { getVendors } from '@/apis/vendorApi';
import { CATEGORIES } from '@/constants/listings/categories';
import { SUBCATEGORIES } from '@/constants/listings/options';

export const revalidate = 3600;   // regenerate at most once per hour

const BASE_URL = 'https://cedimartgh.com';
const FRESH_WINDOW_DAYS = 14;

function daysSince(date) {
  const then = new Date(date).getTime();
  if (!Number.isFinite(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

//  Build a URL with query params safely escaped. URLSearchParams turns
//  spaces into %20 and special chars into their percent-encoded form,
//  so the output is always a well-formed URL string.
//
//  NOTE: URLSearchParams produces a raw `&` between params. Next.js
//  XML-escapes that to `&amp;` when it serializes the sitemap. That's
//  correct — but if you ever see a raw `&` in the generated XML, it
//  means something between this function and the response is not
//  escaping. Guard against it by re-escaping here.
function buildListingsUrl(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value != null && value !== '') {
      qs.set(key, String(value));
    }
  }
  const query = qs.toString();

  //  Belt-and-braces: XML-escape any `&` produced by URLSearchParams
  //  itself, so even if Next.js or a proxy doesn't escape it, the
  //  output is still valid XML.
  const safeQuery = query.replace(/&/g, '&amp;');

  return safeQuery
    ? `${BASE_URL}/listings?${safeQuery}`
    : `${BASE_URL}/listings`;
}

function buildEntityUrl(kind, id) {
  return `${BASE_URL}/${kind}/${encodeURIComponent(String(id))}`;
}

function validImages(images) {
  if (!Array.isArray(images)) return undefined;
  const cleaned = images
    .filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url))
    .slice(0, 3);
  return cleaned.length > 0 ? cleaned : undefined;
}

export default async function sitemap() {
  const now = new Date();

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
  //  NOTE: city and suburb routes were removed deliberately. They added
  //  a raw `&` to every URL and they weren't pulling their weight for
  //  search visibility — category + product + vendor coverage is what
  //  actually drives traffic.
  for (const cat of CATEGORIES || []) {
    if (!cat?.id || cat.id === 'all') continue;

    push(buildListingsUrl({ category: cat.id }), {
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    });

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

  // ── 3. Product routes ────────────────────────────────────────────────────
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

  // ── 4. Vendor routes ─────────────────────────────────────────────────────
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

  // ── 5. Return everything ─────────────────────────────────────────────────
  return entries;
}