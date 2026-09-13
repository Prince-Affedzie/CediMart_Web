// src/lib/authStorage.js
// Shared localStorage helpers used by both AuthContext and the axios client.
// Keeps the `{ value, expiry }` envelope in one place so readers and writers
// can never drift out of sync.

const isBrowser = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const TOKEN_EXPIRY_HOURS = 120;
export const USER_EXPIRY_HOURS = 120;
export const ROLE_EXPIRY_HOURS = 120;

export const AUTH_KEYS = {
  token: '@cedimart_token',
  user: '@cedimart_user',
  role: '@cedimart_role',
};

/**
 * Store a value wrapped in an `{ value, expiry }` envelope.
 */
export const setWithExpiry = (key, value, expiresInHours = 120) => {
  if (!isBrowser()) return;
  try {
    const item = {
      value,
      expiry: Date.now() + expiresInHours * 60 * 60 * 1000,
    };
    window.localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

/**
 * Read a value and honor its expiry. Returns the unwrapped `.value` or null.
 */
export const getWithExpiry = (key) => {
  if (!isBrowser()) return null;
  try {
    const itemStr = window.localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = Date.now();

    // Defensive: if someone wrote a raw value (no envelope), fall back gracefully.
    if (!item || typeof item !== 'object' || !('expiry' in item)) {
      return itemStr;
    }

    if (now > item.expiry) {
      window.localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
};

/**
 * Remove multiple keys at once. Safe to call during SSR.
 */
export const removeMultiple = (keys) => {
  if (!isBrowser()) return;
  try {
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch (error) {
    console.error('Error removing keys:', error);
  }
};

/**
 * Convenience: clear all auth-related keys.
 */
export const clearAuthStorage = () => {
  removeMultiple([AUTH_KEYS.token, AUTH_KEYS.user, AUTH_KEYS.role]);
};

/**
 * Convenience: read just the raw token string (unwrapped).
 * This is what the axios interceptor should use.
 */
export const getAuthToken = () => getWithExpiry(AUTH_KEYS.token);