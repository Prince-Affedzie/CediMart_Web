// src/components/Feed/feedUtils.js

export const FEED_TYPES = [
  { key: '', label: 'For You' },
  { key: 'product_reel', label: 'Products' },
  { key: 'event', label: 'Events' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'hack', label: 'Hacks' },
  { key: 'achievement', label: 'Wins' },
  { key: 'funny_moment', label: 'Funny' },
];

const GRADIENTS = {
  product_reel: ['#0D9488', '#14B8A6'],
  service_reel: ['#7C3AED', '#8B5CF6'],
  lifestyle: ['#F97316', '#FB923C'],
  campus_event: ['#0284C7', '#38BDF8'],
  campus_hack: ['#F59E0B', '#FBBF24'],
  achievement: ['#059669', '#34D399'],
  funny_moment: ['#EC4899', '#F472B6'],
};

export const getGradient = (type) => GRADIENTS[type] || ['#1E293B', '#334155'];

export const formatCount = (count) => {
  if (!count) return '';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
};

export const getTimeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const fullName = (author) =>
  author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() : '';

export const dedupeById = (list) => {
  const seen = new Set();
  return list.filter((p) => {
    if (seen.has(p._id)) return false;
    seen.add(p._id);
    return true;
  });
};