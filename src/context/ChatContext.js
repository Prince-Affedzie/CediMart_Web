// src/context/ChatContext.js
'use client';

import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  openConversation as openConversationApi,
  getInbox as getInboxApi,
  getMessages as getMessagesApi,
  sendMessage as sendMessageApi,
  markRead as markReadApi,
  getTotalUnread as getTotalUnreadApi,
} from '@/apis/chatApi';
import { NotificationContext } from './NotificationContext';
import { useAuth } from './AuthContext';

const PAGE_SIZE = 30;
const SEND_TIMEOUT_MS = 15000;

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

// Merge two message lists: drop duplicate ids, keep chronological order.
const mergeMessages = (a, b) => {
  const seen = new Set();
  return [...a, ...b]
    .filter((m) => {
      if (seen.has(m._id)) return false;
      seen.add(m._id);
      return true;
    })
    .sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt));
};

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const notif = useContext(NotificationContext);
  const socket = notif?.socket ?? null;
  const { user } = useAuth();
  const userId = user?._id;

  const [inbox, setInbox] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});

  // Refs let socket listeners and async code always see the current value
  // without re-subscribing or going stale.
  const activeConvRef = useRef(null);
  const messagesRef = useRef([]);
  const joinedRoomRef = useRef(null);
  const pendingReadRef = useRef(false);
  const unreadTimerRef = useRef(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => () => clearTimeout(unreadTimerRef.current), []);

  const setActive = useCallback((conv) => {
    activeConvRef.current = conv;
    setActiveConversation(conv);
  }, []);

  // ── Inbox helpers ─────────────────────────────────────────────────────────
  const clearUnreadInInbox = useCallback((conversationId) => {
    setInbox((prev) =>
      prev.map((c) =>
        c._id === conversationId ? { ...c, myUnread: 0, buyerUnread: 0, sellerUnread: 0 } : c
      )
    );
  }, []);

  const upsertInboxConversation = useCallback((updated) => {
    setInbox((prev) => {
      const exists = prev.some((c) => c._id === updated._id);
      if (!exists) return [updated, ...prev];
      return prev
        .map((c) => (c._id === updated._id ? updated : c))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  }, []);

  const loadInbox = useCallback(async () => {
    if (!userId) return;
    setInboxLoading(true);
    try {
      const res = await getInboxApi({ status: 'active' });
      if (res.data?.success) setInbox(res.data.conversations);
    } catch (err) {
      console.error('loadInbox error:', err.message);
    } finally {
      setInboxLoading(false);
    }
  }, [userId]);

  const loadTotalUnread = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getTotalUnreadApi();
      if (res.data?.success) setTotalUnread(res.data.total);
    } catch (err) {
      console.error('loadTotalUnread error:', err.message);
    }
  }, [userId]);

  // Several events can fire together; collapse them into one request.
  const refreshUnreadSoon = useCallback(() => {
    clearTimeout(unreadTimerRef.current);
    unreadTimerRef.current = setTimeout(loadTotalUnread, 300);
  }, [loadTotalUnread]);

  // ── Open a conversation (create or fetch) ─────────────────────────────────
  const openConversation = useCallback(async ({ productId, recipientId } = {}) => {
    try {
      const payload = {};
      if (productId) payload.productId = productId;
      if (recipientId) payload.recipientId = recipientId;

      const res = await openConversationApi(payload);
      if (res.data?.success) {
        const conversation = res.data.conversation;
        setInbox((prev) =>
          prev.some((c) => c._id === conversation._id)
            ? prev
            : [{ ...conversation, myUnread: 0 }, ...prev]
        );
        return conversation;
      }
    } catch (err) {
      console.error('openConversation error:', err.message);
      throw err;
    }
  }, []);

  // ── Messages ──────────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (conversationId, { reset = false } = {}) => {
    setMessagesLoading(true);
    try {
      const before = reset ? undefined : messagesRef.current[0]?.createdAt;
      const res = await getMessagesApi(conversationId, { before, limit: PAGE_SIZE });

      // The user may have moved to another conversation while this was loading.
      if (activeConvRef.current?._id !== conversationId) return;

      if (res.data?.success) {
        const fetched = res.data.messages;
        setHasMoreMessages(fetched.length === PAGE_SIZE);
        setMessages((prev) => mergeMessages(fetched, prev));
      }
    } catch (err) {
      console.error('loadMessages error:', err.message);
    } finally {
      if (activeConvRef.current?._id === conversationId) setMessagesLoading(false);
    }
  }, []);

  // Mark the open conversation as read — but only while the tab is actually
  // visible. If it's in the background, remember and do it when it comes back.
  const markActiveRead = useCallback(() => {
    const conv = activeConvRef.current;
    if (!conv) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      pendingReadRef.current = true;
      return;
    }
    pendingReadRef.current = false;
    markReadApi(conv._id).catch(() => {});
    socket?.emit('markRead', { conversationId: conv._id, userId });
    clearUnreadInInbox(conv._id);
    refreshUnreadSoon();
  }, [socket, userId, clearUnreadInInbox, refreshUnreadSoon]);

  const enterConversation = useCallback(
    async (conversation) => {
      setActive(conversation);
      setMessages([]);
      setHasMoreMessages(true);
      setTypingUsers({});

      // Join the room BEFORE loading history, so nothing sent in between is missed.
      if (socket) {
        const prevRoom = joinedRoomRef.current;
        if (prevRoom && prevRoom !== conversation._id) {
          socket.emit('leaveConversation', { conversationId: prevRoom });
        }
        socket.emit('joinConversation', { conversationId: conversation._id });
        joinedRoomRef.current = conversation._id;
      }

      await loadMessages(conversation._id, { reset: true });

      if (activeConvRef.current?._id === conversation._id) markActiveRead();
    },
    [socket, setActive, loadMessages, markActiveRead]
  );

  const leaveConversation = useCallback(() => {
    const roomId = joinedRoomRef.current;
    if (socket && roomId) {
      socket.emit('leaveConversation', { conversationId: roomId });
      socket.emit('stopTyping', { conversationId: roomId, userId });
    }
    joinedRoomRef.current = null;
    pendingReadRef.current = false;
    setActive(null);
    setMessages([]);
    setTypingUsers({});
  }, [socket, userId, setActive]);


  const discardMessage = useCallback((id) => {
   setMessages((prev) => prev.filter((m) => m._id !== id));
  }, []);

  const sendMessage = useCallback(
    async (conversationId, text, replyTo = null) => {
      const trimmed = text.trim();
      if (!trimmed || !user) return;

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const repliedMsg = replyTo ? messagesRef.current.find((m) => m._id === replyTo) : null;

      const optimistic = {
        _id: tempId,
        conversation: conversationId,
        sender: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
        },
        text: trimmed,
        type: 'text',
        replyTo: replyTo
          ? repliedMsg || { _id: replyTo, text: '…', sender: { firstName: '…' } }
          : null,
        readAt: null,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      // Socket only if it's really connected; otherwise a message emitted into
      // a dead socket would sit as "sending" forever.
      if (socket?.connected) {
        socket.emit('sendMessage', {
          conversationId,
          senderId: user._id,
          text: trimmed,
          replyTo: replyTo || undefined,
        });
        // If the server never echoes it back, flag it instead of leaving it pending.
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId && m._optimistic ? { ...m, _failed: true } : m))
          );
        }, SEND_TIMEOUT_MS);
        return;
      }

      try {
        const res = await sendMessageApi(conversationId, {
          text: trimmed,
          replyTo: replyTo || undefined,
        });
        if (res.data?.success) {
          setMessages((prev) => prev.map((m) => (m._id === tempId ? res.data.message : m)));
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        console.error('sendMessage REST fallback error:', err.message);
        throw err;
      }
    },
    [socket, user]
  );

  // ── Typing indicators ─────────────────────────────────────────────────────
  const emitTyping = useCallback(
    (conversationId) => {
      if (socket?.connected) socket.emit('typing', { conversationId, userId });
    },
    [socket, userId]
  );

  const emitStopTyping = useCallback(
    (conversationId) => {
      if (socket?.connected) socket.emit('stopTyping', { conversationId, userId });
    },
    [socket, userId]
  );



  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !userId) return;

    let firstConnect = true;

    // Runs on the first connect AND on every reconnect (laptop sleep, wifi drop,
    // phone switching networks). On reconnect we rejoin the open room and
    // refetch anything we missed.
    const onConnect = () => {
      socket.emit('userOnline', userId);

      const conv = activeConvRef.current;
      if (conv) {
        socket.emit('joinConversation', { conversationId: conv._id });
        joinedRoomRef.current = conv._id;
        if (!firstConnect) loadMessages(conv._id, { reset: true });
      }
      if (!firstConnect) {
        loadInbox();
        loadTotalUnread();
      }
      firstConnect = false;
    };

    const onNewMessage = (message) => {
      const convId = idOf(message.conversation);
      if (convId !== activeConvRef.current?._id) return;

      const fromMe = idOf(message.sender) === userId;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        if (fromMe) {
          // Replace ONE matching optimistic message (not all of them).
          const idx = prev.findIndex((m) => m._optimistic && m.text === message.text);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = message;
            return next;
          }
        }
        return [...prev, message];
      });

      if (!fromMe) markActiveRead();
    };

    const onConversationUpdated = (conversation) => {
      const isActive = conversation._id === activeConvRef.current?._id;
      const isBuyer = idOf(conversation.buyer) === userId;
      const myUnread = isActive ? 0 : isBuyer ? conversation.buyerUnread : conversation.sellerUnread;
      upsertInboxConversation({ ...conversation, myUnread });
      refreshUnreadSoon();
    };

    const onMessagesRead = ({ conversationId }) => {
      if (conversationId === activeConvRef.current?._id) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, readAt: m.readAt ?? new Date().toISOString() }))
        );
      }
    };

    const onUserTyping = ({ userId: typingId, conversationId }) => {
      if (conversationId === activeConvRef.current?._id && typingId !== userId) {
        setTypingUsers((prev) => ({ ...prev, [typingId]: true }));
      }
    };

    const onUserStopTyping = ({ userId: typingId }) => {
      setTypingUsers((prev) => {
        if (!prev[typingId]) return prev;
        const next = { ...prev };
        delete next[typingId];
        return next;
      });
    };

    socket.on('connect', onConnect);
    socket.on('newMessage', onNewMessage);
    socket.on('conversationUpdated', onConversationUpdated);
    socket.on('messagesRead', onMessagesRead);
    socket.on('userTyping', onUserTyping);
    socket.on('userStopTyping', onUserStopTyping);

    // The socket may already be connected by the time this runs.
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('newMessage', onNewMessage);
      socket.off('conversationUpdated', onConversationUpdated);
      socket.off('messagesRead', onMessagesRead);
      socket.off('userTyping', onUserTyping);
      socket.off('userStopTyping', onUserStopTyping);
    };
  }, [
    socket, userId, loadMessages, loadInbox, loadTotalUnread,
    markActiveRead, upsertInboxConversation, refreshUnreadSoon,
  ]);

  // ── Load on login, reset on logout ────────────────────────────────────────
  useEffect(() => {
    if (userId) {
      loadInbox();
      loadTotalUnread();
    } else {
      setInbox([]);
      setTotalUnread(0);
      setMessages([]);
      setTypingUsers({});
      joinedRoomRef.current = null;
      setActive(null);
    }
  }, [userId, loadInbox, loadTotalUnread, setActive]);

  // ── Tab visibility (the web version of AppState) ──────────────────────────
  useEffect(() => {
    if (!userId) return;
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      loadTotalUnread();
      if (pendingReadRef.current) markActiveRead();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [userId, loadTotalUnread, markActiveRead]);

  return (
    <ChatContext.Provider
      value={{
        inbox,
        inboxLoading,
        totalUnread,
        loadInbox,

        openConversation,
        enterConversation,
        leaveConversation,
        activeConversation,

        messages,
        messagesLoading,
        hasMoreMessages,
        loadMessages,
        sendMessage,
        discardMessage,

        typingUsers,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
};