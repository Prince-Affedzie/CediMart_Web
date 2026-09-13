// src/lib/axios.js
import axios from 'axios';
import {
  getAuthToken,
  clearAuthStorage,
  getWithExpiry,
} from '@/lib/authStorage';

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://freshyfood-factory-57c5d00d92ac.herokuapp.com/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Constants ────────────────────────────────────────────────────────────────

// URLs that should NEVER trigger the "session expired" flow, because a 401
// from them is expected (bad credentials, unverified account, etc.) and does
// not mean the user's existing session is invalid.
const AUTH_ENDPOINT_PATTERN =
  /(\/auth\/(login|signup|register|forgot|reset|verify|refresh)|\/vendor\/login|\/google\/login|\/apple\/login)/i;

// Session-expired listeners. AuthContext registers one of these so it can
// clear its in-memory state in sync with the storage wipe.
const sessionExpiredHandlers = new Set();

export function registerSessionExpiredHandler(handler) {
  if (typeof handler === 'function') sessionExpiredHandlers.add(handler);
}

export function unregisterSessionExpiredHandler(handler) {
  sessionExpiredHandlers.delete(handler);
}

// Prevents multiple concurrent 401s from stacking redirects / wipes.
let isHandlingExpiry = false;

function handleSessionExpired() {
  if (isHandlingExpiry) return;
  isHandlingExpiry = true;

  try {
    clearAuthStorage();

    // Notify AuthContext (and anyone else listening) so React state resets.
    sessionExpiredHandlers.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Session-expired handler threw:', err);
      }
    });

    // Only redirect if we're in a browser, not already on an auth page.
    if (typeof window !== 'undefined') {
      const { pathname } = window.location;
      const isOnAuthPage =
        pathname.includes('/login') ||
        pathname.includes('/signup') ||
        pathname.includes('/vendor/login');

      if (!isOnAuthPage) {
        // Preserve the current URL so login can redirect back.
        const redirect = encodeURIComponent(pathname + window.location.search);
        window.location.href = `/login?redirect=${redirect}&expired=1`;
      }
    }
  } finally {
    // Reset after a tick so a legit subsequent 401 (e.g. after the user
    // logs in again) isn't swallowed.
    setTimeout(() => {
      isHandlingExpiry = false;
    }, 1000);
  }
}

// ─── Request interceptor ─────────────────────────────────────────────────────

API.interceptors.request.use(
  (config) => {
    const token = getAuthToken(); // reads + unwraps + honors expiry

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV !== 'production') {
      const method = config.method?.toUpperCase() ?? 'GET';
      console.log(`📤 ${method} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// ─── Response interceptor ────────────────────────────────────────────────────

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // ── Diagnostics ─────────────────────────────────────────────────────────
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be down');
    } else if (!error.response) {
      console.error('Network error - server may not be running');
    }

    // ── 401 handling ────────────────────────────────────────────────────────
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = AUTH_ENDPOINT_PATTERN.test(url);

    if (status === 401 && !isAuthEndpoint) {
      // This is a real session expiry, not a bad-credentials response.
      handleSessionExpired();
    }

    return Promise.reject(error);
  }
);

export default API;