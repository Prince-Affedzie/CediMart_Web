// src/utils/shareUtils.js

/**
 * Web share utilities.
 * Uses the native Web Share API on supported browsers (mobile Safari, Chrome
 * Android, Edge, desktop Chrome/Safari on macOS Sonoma+). Falls back to a
 * modal-style prompt / clipboard copy on browsers that don't support it.
 */

// ─── Config ────────────────────────────────────────────────────────────────
const APP_NAME = 'CediMart';
const BASE_URL =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://cedimartgh.com';

const DEFAULT_HASHTAGS = ['CediMart', 'CampusMarketplace', 'Ghana'];

// ─── Helpers ───────────────────────────────────────────────────────────────
const isBrowser = () => typeof window !== 'undefined' && typeof navigator !== 'undefined';

const supportsWebShare = () => isBrowser() && typeof navigator.share === 'function';

const canShareFiles = () => isBrowser() && typeof navigator.canShare === 'function';

/** Sanitize text into something shareable across platforms. */
const clean = (s) => (typeof s === 'string' ? s.trim() : '');

/** Build the canonical vendor URL. */
const buildVendorUrl = (vendor) => {
  const id = vendor?._id || vendor?.id;
  if (!id) return BASE_URL;
  return `${BASE_URL}/vendors/${id}`;
};

/** Build the canonical product URL. */
const buildProductUrl = (product) => {
  const id = product?._id || product?.id;
  if (!id) return BASE_URL;
  return `${BASE_URL}/products/${id}`;
};

/** Copy text to clipboard with a fallback for older browsers. */
async function copyToClipboard(text) {
  if (!isBrowser()) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the manual approach
  }

  // Fallback: temporarily inject a textarea and use the legacy execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

// ─── Core share function ───────────────────────────────────────────────────
/**
 * Attempt to open the native Web Share sheet.
 * Returns { success, method, cancelled, error }.
 */
async function tryWebShare({ title, text, url, files }) {
  if (!supportsWebShare()) {
    return { success: false, method: null, reason: 'unsupported' };
  }

  try {
    const payload = { title, text, url };

    // Attach files only when supported — many browsers silently fail otherwise
    if (files?.length && canShareFiles() && navigator.canShare({ files })) {
      payload.files = files;
    }

    await navigator.share(payload);
    return { success: true, method: 'webshare' };
  } catch (err) {
    // User dismissed the sheet — not an error
    if (err?.name === 'AbortError') {
      return { success: false, method: 'webshare', cancelled: true };
    }
    return { success: false, method: 'webshare', error: err?.message || 'Share failed' };
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Share a vendor profile.
 * @returns {Promise<{success:boolean, cancelled?:boolean, method?:string, error?:string}>}
 */
export async function shareVendorProfile(vendor) {
  if (!vendor) return { success: false, error: 'No vendor provided' };

  const displayName = clean(vendor.storeName || vendor.name) || 'this vendor';
  const url = buildVendorUrl(vendor);
  const text = `Check out ${displayName} on ${APP_NAME}!`;
  const title = `${displayName} · ${APP_NAME}`;

  // 1) Try native Web Share first
  const ws = await tryWebShare({ title, text, url });
  if (ws.success || ws.cancelled) return ws;

  // 2) Fallback — copy to clipboard and let the caller show a toast
  const copied = await copyToClipboard(`${text}\n${url}`);
  if (copied) {
    return { success: true, method: 'clipboard' };
  }

  // 3) Last resort — open a prefilled WhatsApp message
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  if (isBrowser()) window.open(wa, '_blank', 'noopener,noreferrer');
  return { success: true, method: 'whatsapp-fallback' };
}

/**
 * Share a product.
 */
export async function shareProduct(product) {
  if (!product) return { success: false, error: 'No product provided' };

  const name = clean(product.name) || 'this product';
  const url = buildProductUrl(product);
  const price = product.price ? `GH₵ ${Number(product.price).toFixed(2)}` : '';
  const text = `Check out "${name}"${price ? ` (${price})` : ''} on ${APP_NAME}!`;
  const title = `${name} · ${APP_NAME}`;

  const ws = await tryWebShare({ title, text, url });
  if (ws.success || ws.cancelled) return ws;

  const copied = await copyToClipboard(`${text}\n${url}`);
  if (copied) return { success: true, method: 'clipboard' };

  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  if (isBrowser()) window.open(wa, '_blank', 'noopener,noreferrer');
  return { success: true, method: 'whatsapp-fallback' };
}

/**
 * Generic share for arbitrary content.
 */
export async function shareContent({ title, text, url, files }) {
  const ws = await tryWebShare({ title, text, url, files });
  if (ws.success || ws.cancelled) return ws;

  const copied = await copyToClipboard([text, url].filter(Boolean).join('\n'));
  return copied
    ? { success: true, method: 'clipboard' }
    : { success: false, error: 'Sharing not supported' };
}

/**
 * Copy a link to clipboard.
 */
export async function copyLink(url) {
  const ok = await copyToClipboard(url);
  return { success: ok };
}

// ─── Social share URLs (for custom share buttons/menus) ────────────────────
export const shareLinks = {
  whatsapp: (text, url) =>
    `https://wa.me/?text=${encodeURIComponent([text, url].filter(Boolean).join('\n'))}`,

  twitter: (text, url, hashtags = DEFAULT_HASHTAGS) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || '')}&url=${encodeURIComponent(url || '')}${
      hashtags?.length ? `&hashtags=${hashtags.join(',')}` : ''
    }`,

  facebook: (url) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || '')}`,

  telegram: (text, url) =>
    `https://t.me/share/url?url=${encodeURIComponent(url || '')}&text=${encodeURIComponent(text || '')}`,

  linkedin: (url) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || '')}`,

  email: (subject, body) =>
    `mailto:?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`,

  sms: (text) => `sms:?&body=${encodeURIComponent(text || '')}`,
};

// ─── Convenience: open one of the above in a new tab ──────────────────────
export function openShareLink(url) {
  if (!isBrowser() || !url) return false;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  return true;
}

// ─── Exports ───────────────────────────────────────────────────────────────
export const shareUtils = {
  shareVendorProfile,
  shareProduct,
  shareContent,
  copyLink,
  openShareLink,
  shareLinks,
  supportsWebShare,
};

export default shareUtils;