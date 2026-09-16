// src/utils/shareProduct.js

/**
 * Normalizes a product object into a consistent shape for sharing.
 * Handles the three shapes products arrive in across the app:
 *   - API product: { _id, name, price, description, images: [...] }
 *   - Cart item:   { product: {...}, quantity: n }
 *   - Favorite:    { _id, product: {...} } or { _id, name, ... }
 */
export function getProductShareData(product) {
  if (!product) return null;

  // Unwrap nested product references
  const p = product.product && typeof product.product === 'object'
    ? product.product
    : product;

  const id = p._id || p.id || product.productId || product.id;
  if (!id) return null;

  const name = p.name || product.name || 'CediMart Listing';
  const price = Number(p.price ?? product.price ?? 0);
  const description = (p.description || product.description || '').trim();

  // Pick the best available image
  const image =
    p.images?.[0] ||
    p.image ||
    product.image ||
    product.images?.[0] ||
    null;

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://cedimartgh.com';

  const url = `${baseUrl}/product/${id}`;

  return {
    id,
    name,
    price,
    priceFormatted: Number.isFinite(price)
      ? `GH₵ ${price.toFixed(2)}`
      : 'GH₵ 0.00',
    description,
    image,
    url,
  };
}

/**
 * Builds the message text used by every share channel.
 * Kept short so it fits in a WhatsApp preview without truncation.
 */
export function buildShareMessage(data, { includeUrl = true } = {}) {
  if (!data) return '';

  const lines = [];

  if (data.name) lines.push(data.name);
  if (data.priceFormatted) lines.push(data.priceFormatted);

  if (data.description) {
    // Truncate long descriptions — WhatsApp previews look messy past ~120 chars
    const snippet =
      data.description.length > 120
        ? `${data.description.slice(0, 117).trimEnd()}…`
        : data.description;
    lines.push('');
    lines.push(snippet);
  }

  if (includeUrl) {
    lines.push('');
    lines.push(`👉 ${data.url}`);
    lines.push('');
    lines.push('Found on CediMart 🛍️');
  }

  return lines.join('\n');
}

/**
 * Whether the browser supports the native share sheet.
 * Available on mobile Safari, Chrome Android, and desktop Safari/Edge.
 * Not available on desktop Chrome/Firefox — we fall back to clipboard copy.
 */
export function canNativeShare() {
  if (typeof navigator === 'undefined') return false;
  return typeof navigator.share === 'function';
}

/**
 * Whether the browser can fetch images as blobs (for attaching files).
 * Safari on iOS supports it; older browsers don't.
 */
export function canShareFiles() {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.canShare !== 'function') return false;

  try {
    // Probe with a dummy file — this is the documented safe check
    const probe = new File([new Blob(['x'])], 'x.png', { type: 'image/png' });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

/**
 * Fetches the product image and converts it to a File for sharing.
 * Returns null on any failure — callers should proceed without the file.
 */
async function fetchImageAsFile(imageUrl, filename) {
  if (!imageUrl) return null;
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();

    // Derive a safe extension from the MIME type
    const mime = blob.type || 'image/jpeg';
    const ext = mime.split('/')[1]?.split(';')[0] || 'jpg';
    const safeName = `${filename || 'product'}.${ext}`.replace(
      /[^a-z0-9._-]/gi,
      '_'
    );

    return new File([blob], safeName, { type: mime });
  } catch (err) {
    console.warn('Could not fetch image for sharing:', err);
    return null;
  }
}

/**
 * Main entry point. Attempts, in order:
 *   1. Native share WITH the image file (best experience)
 *   2. Native share WITHOUT the image file
 *   3. Clipboard copy of the message
 *
 * Returns:
 *   { method: 'native-file' | 'native-text' | 'clipboard', ok: boolean }
 */
export async function shareProduct(product, options = {}) {
  const {
    title,
    text,
    url,
    preferImage = true,
  } = options;

  const data = getProductShareData(product);
  if (!data) {
    return { method: null, ok: false, reason: 'invalid-product' };
  }

  const shareTitle = title || data.name;
  const shareText = text || buildShareMessage(data, { includeUrl: false });
  const shareUrl = url || data.url;

  // ── Path 1: Native share with image ─────────────────────────────────────
  if (canNativeShare() && preferImage && canShareFiles() && data.image) {
    try {
      const file = await fetchImageAsFile(data.image, data.name);
      if (file) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return { method: 'native-file', ok: true };
      }
    } catch (err) {
      // AbortError means the user dismissed the sheet — treat as success-neutral
      if (err?.name === 'AbortError') {
        return { method: 'native-file', ok: true };
      }
      console.warn('Native file share failed, falling back:', err);
    }
  }

  // ── Path 2: Native share, text + url only ───────────────────────────────
  if (canNativeShare()) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      return { method: 'native-text', ok: true };
    } catch (err) {
      if (err?.name === 'AbortError') {
        return { method: 'native-text', ok: true };
      }
      console.warn('Native text share failed, falling back:', err);
    }
  }

  // ── Path 3: Clipboard fallback ──────────────────────────────────────────
  try {
    const fullMessage = buildShareMessage(data);
    await navigator.clipboard.writeText(fullMessage);
    return { method: 'clipboard', ok: true };
  } catch (err) {
    console.error('Clipboard write failed:', err);
    return { method: null, ok: false, reason: 'clipboard-failed' };
  }
}

/**
 * Convenience: get just the URL, for anywhere you only need the link.
 */
export function getProductShareUrl(product) {
  return getProductShareData(product)?.url || '';
}