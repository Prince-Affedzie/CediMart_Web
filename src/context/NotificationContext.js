// src/context/NotificationContext.js
'use client';

import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification as deleteNotificationApi,
  deleteBulkNotifications as deleteBulkNotificationsApi,
} from '@/apis/notificationApi';
import { useAuth } from './AuthContext';

// The socket connects to the server root, not the REST base (which may end in /api).
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');

// The API returns either a bare array or { data: [...] }. Normalise once.
const extractList = (res) => {
  const d = res?.data;
  const list = d?.data ?? d?.notifications ?? d;
  return Array.isArray(list) ? list : [];
};

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const userId = user?._id;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Derived, so it can never drift out of sync with the list
  // (the mobile version stored it separately and never updated it on new
  // socket notifications or after mark-all-read).
  const unreadIds = useMemo(
    () => notifications.filter((n) => !n.read).map((n) => n._id),
    [notifications]
  );
  const unreadCount = unreadIds.length;

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications();
      if (res.status === 200) setNotifications(extractList(res));
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addNotification = useCallback(async (data) => {
    try {
      await createNotification(data);
    } catch (err) {
      console.error('Failed to generate notification:', err);
    }
  }, []);

  const deleteSingleNotification = useCallback(async (id) => {
    try {
      const response = await deleteNotificationApi(id);
      if (response?.status === 200) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        return response;
      }
    } catch (err) {
      console.error('Delete notification error:', err);
      throw err; // the calling component decides how to show it (toast, etc.)
    }
  }, []);

  const deleteMultipleNotifications = useCallback(async (selectedIds) => {
    if (!selectedIds?.length) return null;
    try {
      const response = await deleteBulkNotificationsApi(selectedIds);
      if (response?.status === 200) {
        const gone = new Set(selectedIds);
        setNotifications((prev) => prev.filter((n) => !gone.has(n._id)));
        return response;
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      throw err;
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    if (unreadIds.length === 0) return null;
    try {
      const response = await markNotificationAsRead({ ids: unreadIds });
      if (response?.status === 200) {
        const done = new Set(unreadIds);
        setNotifications((prev) => prev.map((n) => (done.has(n._id) ? { ...n, read: true } : n)));
        return response;
      }
    } catch (err) {
      console.error('Mark all as read error:', err);
      throw err;
    }
  }, [unreadIds]);

  // Load on login, clear on logout
  useEffect(() => {
    if (userId) loadNotifications();
    else setNotifications([]);
  }, [userId, loadNotifications]);

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId || !SOCKET_URL) return;

    const s = io(SOCKET_URL, {
      auth: token ? { token } : undefined, // if web auth is cookie-based there may be no token
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    setSocket(s);

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err) => console.error('Socket connection error:', err.message));
    s.on('notification', (notification) => {
      setNotifications((prev) =>
        prev.some((n) => n._id === notification._id) ? prev : [notification, ...prev]
      );
    });

    return () => {
      s.off('notification');
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId, token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        unreadCount,   // number (on mobile this was an array of ids)
        unreadIds,     // the array of ids, if you still need it
        loadNotifications,
        addNotification,
        markAllNotificationsAsRead,
        deleteBulkNotifications: deleteMultipleNotifications,
        deleteNotification: deleteSingleNotification,
        socket,
        connected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
};