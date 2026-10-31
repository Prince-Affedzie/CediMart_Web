// src/utils/conversation.js

const isPerson = (p) => !!p && typeof p === 'object' && !!(p.firstName || p.name);

// True when buyer/seller (and product, if there is one) carry real details, not just ids.
export const isHydrated = (c) =>
  !!c &&
  isPerson(c.buyer) &&
  isPerson(c.seller) &&
  (c.product == null || typeof c.product === 'object');

// Merge an update into what we already know. A bare id (or a missing field)
// never overwrites a populated object for the same record.
export const mergeConversation = (prev, next) => {
  if (!prev) return next;
  const merged = { ...prev, ...next };

  for (const key of ['buyer', 'seller', 'product']) {
    const p = prev[key];
    const n = next[key];
    const prevIsObj = !!p && typeof p === 'object';

    if (n == null) {
      merged[key] = p;                                   // update didn't include it, so keep ours
    } else if (typeof n !== 'object') {
      merged[key] = prevIsObj && String(p._id) === String(n) ? p : n;   // bare id, keep the loaded object
    } else if (prevIsObj && String(p._id) === String(n._id)) {
      merged[key] = { ...p, ...n };                      // partial object, fill gaps from ours
    }
  }
  return merged;
};