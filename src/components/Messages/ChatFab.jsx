// src/components/Messages/ChatFab.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, Loader2, X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import './chat-fab.css';

/**
 * Floating "chat with seller" button.
 *
 *   <ChatFab product={product} />              // chat about a product
 *   <ChatFab recipientId={vendorUserId} />     // direct message
 *
 * It floats just above `anchorSelector` (the page's sticky cart bar) so the two
 * never overlap, and falls back to sitting above the phone tab bar.
 */
export default function ChatFab({
  product,
  recipientId,
  anchorSelector = '.pd-sticky-bar',
  className = '',
  onConversationOpened,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { openConversation } = useChat();

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'login' } | { type: 'error', message }
  const [bottom, setBottom] = useState(null);

  const rootRef = useRef(null);
  const busyRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // ── Sit above the sticky cart bar / phone tab bar ───────────────────────
  useEffect(() => {
    const anchor = anchorSelector ? document.querySelector(anchorSelector) : null;

    const place = () => {
      let offset = 0;
      if (anchor) {
        const r = anchor.getBoundingClientRect();
        if (r.height > 0) offset = Math.max(0, window.innerHeight - r.top);
      }
      if (!offset) {
        const tabBar = document.querySelector('.mtb-wrap');
        if (tabBar && getComputedStyle(tabBar).display !== 'none') offset = tabBar.offsetHeight;
      }
      setBottom(offset + 20);
    };

    place();
    window.addEventListener('resize', place);
    const ro = anchor && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null;
    ro?.observe(anchor);
    return () => {
      window.removeEventListener('resize', place);
      ro?.disconnect();
    };
  }, [anchorSelector]);

  // ── Close the popover on outside click / Escape ─────────────────────────
  useEffect(() => {
    if (!notice) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setNotice(null);
    };
    const onKey = (e) => { if (e.key === 'Escape') setNotice(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [notice]);

  const flashError = (message) => {
    clearTimeout(timerRef.current);
    setNotice({ type: 'error', message });
    timerRef.current = setTimeout(() => setNotice(null), 4500);
  };

  const handleClick = async () => {
    if (busyRef.current) return;

    // Logged out: show a small sign-in prompt instead of an alert dialog
    if (!isAuthenticated) {
      setNotice((n) => (n?.type === 'login' ? null : { type: 'login' }));
      return;
    }

    const productId = product?._id || product?.id || null;

    if (!productId && !recipientId) {
      flashError('Cannot start chat: missing product or recipient information.');
      return;
    }

    if (recipientId && user?._id && String(recipientId) === String(user._id)) {
      flashError('You can’t start a chat with yourself.');
      return;
    }

    busyRef.current = true;
    setLoading(true);
    setNotice(null);

    try {
      const payload = {};
      if (productId) payload.productId = productId;
      if (recipientId) payload.recipientId = recipientId;

      // The context also adds the conversation to the inbox, so /messages finds it instantly
      const conversation = await openConversation(payload);
      if (!conversation?._id) throw new Error('Could not start conversation');

      onConversationOpened?.(conversation);
      router.push(`/messages?c=${conversation._id}`);
      // No reset here: the spinner stays until the page changes.
    } catch (err) {
      busyRef.current = false;
      setLoading(false);
      flashError(err?.response?.data?.error ?? err?.message ?? 'Please try again.');
    }
  };

  const label = loading ? 'Opening chat…' : product ? 'Chat with Seller' : 'Send Message';
  const redirect = encodeURIComponent(pathname || '/');

  return (
    <div
      ref={rootRef}
      className={`cf-wrap ${className}`}
      style={bottom != null ? { '--cf-bottom': `${bottom}px` } : undefined}
    >
      {notice && (
        <div
          className="cf-pop"
          role={notice.type === 'error' ? 'alert' : 'dialog'}
          aria-label={notice.type === 'login' ? 'Sign in to chat' : 'Could not open chat'}
        >
          <button type="button" className="cf-pop-x" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X size={14} />
          </button>

          {notice.type === 'login' ? (
            <>
              <strong>Sign in to chat</strong>
              <p>Create a free account or log in to start chatting.</p>
              <div className="cf-pop-actions">
                <Link href={`/login?redirect=${redirect}`} className="cf-pop-btn is-primary">Log in</Link>
                <Link href={`/register?redirect=${redirect}`} className="cf-pop-btn">Sign up</Link>
              </div>
            </>
          ) : (
            <>
              <strong>Could not open chat</strong>
              <p>{notice.message}</p>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        className={`cf-pill${loading ? ' is-loading' : ''}`}
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        aria-label={label}
      >
        {loading ? <Loader2 size={19} className="cf-spin" /> : <MessageCircle size={19} fill="currentColor" strokeWidth={0} />}
        <span className="cf-label">{label}</span>
      </button>
    </div>
  );
}