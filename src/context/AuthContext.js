// src/context/AuthContext.js
'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import AuthService from '@/services/authService';
import API from '@/apis/axios';
import {
  updateProfile,
  deleteProfile,
  logout,
  loginByGoogle,
  signUpByGoogle,
  apple_signUp,
  vendorLogin,
} from '@/apis/userApi';
//import { useFollowStore } from '@/stores/useFollowStore';

const AuthContext = createContext(null); // ← CHANGED: null is more explicit than undefined

// ─── Storage Helpers with Expiration ─────────────────────────────────────────
// NOTE: These are duplicated in src/lib/authStorage.js. Consider importing
// from there instead to keep a single source of truth. Kept local here for
// now to avoid a breaking change, but flagged for consolidation.

const isBrowser = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const setWithExpiry = (key, value, expiresInHours = 120) => {
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

const getWithExpiry = (key) => {
  if (!isBrowser()) return null;
  try {
    const itemStr = window.localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = Date.now();

    // Defensive: handle legacy / raw values that aren't enveloped.
    if (!item || typeof item !== 'object' || !('expiry' in item)) {
      return itemStr; // ← CHANGED: legacy fallback
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

const removeMultiple = (keys) => {
  if (!isBrowser()) return;
  try {
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch (error) {
    console.error('Error removing keys:', error);
  }
};

// ─── Constants ───────────────────────────────────────────────────────────────
const TOKEN_EXPIRY_HOURS = 120;
const USER_EXPIRY_HOURS = 120;
const ROLE_EXPIRY_HOURS = 120;

const AUTH_KEYS = ['@cedimart_token', '@cedimart_user', '@cedimart_role']; // ← NEW

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ← NEW: guard against double-invocation in React 18 Strict Mode and
  // against remounts that would re-trigger checkAuthStatus.
  const didInitRef = useRef(false);

  // ← NEW: centralize the "wipe everything" logic so it can't drift.
  const clearAuthState = useCallback(() => {
    removeMultiple(AUTH_KEYS);
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  // ── Check stored auth on app start ─────────────────────────────────────────
  const checkAuthStatus = useCallback(async () => {
    try {
      const storedToken = getWithExpiry('@cedimart_token');
      const storedUser = getWithExpiry('@cedimart_user');
      const storedRole = getWithExpiry('@cedimart_role');

      if (storedToken && storedUser) {
        const parsedUser =
          typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
        setToken(storedToken);
        setUser(parsedUser);
        setRole(storedRole || null);
        setIsAuthenticated(true);
      } else {
        removeMultiple(AUTH_KEYS);
        setToken(null);
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setToken(null);
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // ← critical: always runs, always resolves loading
    }
  }, []);

  // ← CHANGED: single mount effect, guarded, with cleanup that clears the guard
  // so a real remount still re-runs.
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let active = true;
    (async () => {
      if (!active) return;
      await checkAuthStatus();
    })();

    return () => {
      active = false;
      didInitRef.current = false; // allow re-init on remount
    };
  }, [checkAuthStatus]);

  // Register session-expired handler once on mount.
  useEffect(() => {
    if (typeof API.registerSessionExpiredHandler !== 'function') return;

    const handleExpired = () => {
      clearAuthState();
    };

    API.registerSessionExpiredHandler(handleExpired);

    // ← NEW: unregister on unmount if the API supports it, prevents leaks.
    return () => {
      if (typeof API.unregisterSessionExpiredHandler === 'function') {
        API.unregisterSessionExpiredHandler(handleExpired);
      }
    };
  }, [clearAuthState]);

  // ── Store auth data after successful login/signup ─────────────────────────
  const storeAuthData = useCallback(
    async (tokenData, userData, roleData) => {
      setWithExpiry('@cedimart_token', tokenData, TOKEN_EXPIRY_HOURS);
      setWithExpiry(
        '@cedimart_user',
        typeof userData === 'string' ? userData : JSON.stringify(userData),
        USER_EXPIRY_HOURS
      );
      setWithExpiry('@cedimart_role', roleData || null, ROLE_EXPIRY_HOURS);

      setToken(tokenData);
      setUser(userData);
      setRole(roleData || null);
      setIsAuthenticated(true);
    },
    []
  );

  // ── Apple Sign-In ────────────────────────────────────────────────────────
  const signUpByApple = useCallback(
    async (data) => {
      try {
        const response = await apple_signUp(data);
        if (response.status === 200 || response.success) {
          await storeAuthData(
            response.data.token,
            response.data.user,
            response.data.role
          );
          return { success: true, data: response.data };
        }
        return { success: false, error: response.error };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          'An error occurred. Please try again later.';
        return { success: false, error: errorMessage };
      }
    },
    [storeAuthData]
  );

  // ── Google Login ─────────────────────────────────────────────────────────
  const google_login = useCallback(
    async (data) => {
      try {
        const response = await loginByGoogle(data);
        if (response.status === 200) {
          await storeAuthData(
            response.data.token,
            response.data.user,
            response.data.role
          );
          return { success: true, data: response.data };
        }
        return { success: false, error: response.error };
      } catch (err) {
        console.error('Google login error:', err);
        return {
          success: false,
          status: err.response?.status || (err.request ? 0 : 500),
          message:
            err.response?.data?.message ||
            (err.response?.status === 404
              ? 'User not found. Please check your email or sign up.'
              : err.response?.status === 401
              ? 'Invalid credentials. Please try again.'
              : err.request
              ? 'Network error. Please check your internet connection.'
              : 'An unexpected error occurred. Please try again.'),
        };
      }
    },
    [storeAuthData]
  );

  // ── Google Sign-Up ───────────────────────────────────────────────────────
  const google_signUp = useCallback(
    async (data) => {
      try {
        const response = await signUpByGoogle(data);
        if (response.status === 200) {
          await storeAuthData(
            response.data.token,
            response.data.user,
            response.data.role
          );
          return { success: true, data: response.data };
        }
        return { success: false, error: response.error };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          'An account with this email already exists. Please login instead.';
        return { success: false, error: errorMessage };
      }
    },
    [storeAuthData]
  );

  // ── Regular Login ────────────────────────────────────────────────────────
  const login = useCallback(
    async (credentials) => {
      try {
        const response = await AuthService.login(credentials);
        if (response.success) {
          await storeAuthData(
            response.data.token,
            response.data.user,
            response.data.role
          );
          return { success: true, data: response.data };
        }
        return { success: false, error: response.error };
      } catch (err) {
        console.error('Login error:', err);
        return {
          success: false,
          status: err.response?.status || (err.request ? 0 : 500),
          message:
            err.response?.data?.message ||
            (err.response?.status === 404
              ? 'User not found. Please check your email or sign up.'
              : err.response?.status === 401
              ? 'Invalid email or password. Please try again.'
              : err.request
              ? 'Network error. Please check your internet connection.'
              : 'An unexpected error occurred. Please try again.'),
        };
      }
    },
    [storeAuthData]
  );

  // ── Vendor Login ─────────────────────────────────────────────────────────
  const vendor_login = useCallback(
    async (credentials) => {
      try {
        const response = await vendorLogin(credentials);
        if (response.status === 200) {
          await storeAuthData(
            response.data.token,
            response.data.user,
            response.data.role
          );
          return { success: true, data: response.data };
        }
        return { success: false, error: response.error };
      } catch (err) {
        console.error('Vendor login error:', err);
        return {
          success: false,
          status: err.response?.status || (err.request ? 0 : 500),
          message:
            err.response?.data?.message ||
            (err.response?.status === 404
              ? 'Vendor account not found. Please sign up as a vendor first.'
              : err.response?.status === 401
              ? 'Invalid credentials. Please try again.'
              : err.request
              ? 'Network error. Please check your internet connection.'
              : 'An unexpected error occurred. Please try again.'),
        };
      }
    },
    [storeAuthData]
  );

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (userData) => {
      try {
        const response = await AuthService.signUp(userData);
        if (response.success) {
          await storeAuthData(
            response.token,
            response.user,
            response.data?.role
          );
          return { success: true, data: response.data };
        }
        return { success: false, error: response.error };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          'An account with this email already exists. Please login instead.';
        return { success: false, error: errorMessage };
      }
    },
    [storeAuthData]
  );

  // ── Logout ───────────────────────────────────────────────────────────────
  const logoutUser = useCallback(async () => {
    try {
      const response = await logout();
      if (response?.status === 200) {
        clearAuthState();
      }
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server call fails, we must clear local state so the
      // user isn't trapped in a half-authenticated state.
      clearAuthState();
    }
  }, [clearAuthState]);

  // ── Update User ──────────────────────────────────────────────────────────
  const updateUser = useCallback(async (updatedUser) => {
    try {
      // Optimistic local update so UI feels instant.
      setWithExpiry(
        '@cedimart_user',
        JSON.stringify(updatedUser),
        USER_EXPIRY_HOURS
      );
      setUser(updatedUser);

      const res = await updateProfile(updatedUser);
      return res;
    } catch (error) {
      console.error('Update user error:', error);
      // Optionally re-fetch the canonical user here on failure.
      throw error; // ← CHANGED: propagate so callers can show an error toast
    }
  }, []);

  // ── Delete Account ───────────────────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    try {
      const res = await deleteProfile();
      if (res?.status === 200) {
        clearAuthState();
      }
      return res;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }, [clearAuthState]);

  // ← NEW: memoize the context value so consumers only re-render when a
  // piece of auth state they actually use changes.
  const value = useMemo(
    () => ({
      user,
      role,
      token,
      loading,
      isAuthenticated,
      login,
      vendor_login,
      signUp,
      google_signUp,
      google_login,
      signUpByApple,
      logoutUser,
      updateUser,
      deleteAccount,
      // ← NEW: expose a manual re-check for OAuth redirects / tab focus.
      refreshAuth: checkAuthStatus,
    }),
    [
      user,
      role,
      token,
      loading,
      isAuthenticated,
      login,
      vendor_login,
      signUp,
      google_signUp,
      google_login,
      signUpByApple,
      logoutUser,
      updateUser,
      deleteAccount,
      checkAuthStatus,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};