// src/components/Messages/messageUtils.js
import { useEffect } from 'react';

// ── People ────────────────────────────────────────────────────────────────
export const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

export const getOtherParty = (conv, userId) => {
  if (!conv) return null;
  return String(idOf(conv.buyer)) === String(userId) ? conv.seller : conv.buyer;
};

export const getDisplayName = (party) => {
  if (!party) return 'Unknown User';
  if (typeof party !== 'object') return 'Loading…';
  if (party.firstName) return party.lastName ? `${party.firstName} ${party.lastName}` : party.firstName;
  return party.name || 'Unknown User';
};

export const getFirstName = (party) =>
  party?.firstName || party?.name?.split(' ')[0] || 'Chat';

export const getInitial = (party) =>
  typeof party === 'string' ? '' : (party?.firstName || party?.name || '?').charAt(0).toUpperCase();
// The mobile chat used `avatar`, the feed uses `profileImage`. Accept both.
export const getAvatar = (party) => party?.avatar || party?.profileImage || null;

export const getProductName = (product, fallback = 'Product') =>
  typeof product === 'string' ? 'Loading…' : product?.name || product?.title || fallback;

// A small on-brand rotation so contacts without a photo get distinct colours
const AVATAR_PALETTE = [
  { bg: '#F0FDFA', fg: '#0D9488' },
  { bg: '#FFF7ED', fg: '#F97316' },
  { bg: '#F0F9FF', fg: '#0284C7' },
  { bg: '#F5F3FF', fg: '#7C3AED' },
  { bg: '#FDF2F8', fg: '#EC4899' },
  { bg: '#FFFBEB', fg: '#B45309' },
];

export const getAvatarColors = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
};

// ── Time ──────────────────────────────────────────────────────────────────
export const formatInboxTime = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
};

export const formatClock = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' }) : '';

export const dayKey = (iso) => new Date(iso).toDateString();

export const dayLabel = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
};

// ── Layout ────────────────────────────────────────────────────────────────
// Sizes an element to exactly the space below the site header (and above the
// phone tab bar), tracking the on-screen keyboard through visualViewport.
export function useStageHeight(ref, varName, deps = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const viewH = window.visualViewport?.height ?? window.innerHeight;
      const bar = document.querySelector('.mtb-wrap');
      const barH = bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0;
      el.style.setProperty(varName, `${Math.max(320, viewH - top - barH)}px`);
    };

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    const header = document.querySelector('header');
    const ro = header && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro) ro.observe(header);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}