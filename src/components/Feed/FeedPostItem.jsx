// src/components/Feed/FeedPostItem.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Heart, Store, ChevronRight, ShoppingBag } from 'lucide-react';
import { toggleLike, toggleSave } from '@/apis/feedApi';
import ReelVideo from './ReelVideo';
import ActionRail from './ActionRail';
import { getGradient, getTimeAgo, fullName } from './feedUtils';

// Only rows this close to the active one get a real <video>. Browsers cap
// concurrent decoders, so everything further away shows its thumbnail only.
const LOAD_DISTANCE = 1;

export default function FeedPostItem({
  post, index, active, distance, muted, userId,
  isFollowing, followLoading, onFollow,
  requireAuth, notify, onComment, onReport,
}) {
  const media = post.media?.[0];
  const isVideo = media?.type === 'video' || !!media?.url?.includes('playlist.m3u8');
  const isImage = !!media?.url && !isVideo;
  const loadVideo = isVideo && distance <= LOAD_DISTANCE;

  const authorId = post.author?._id || post.author;
  const name = fullName(post.author) || 'Unknown';
  const handle = `@${name.replace(/\s+/g, '').toLowerCase() || 'user'}`;
  const isVendor = post.author?.role === 'vendor';

  const [liked, setLiked] = useState(() =>
    post.isLiked ?? (Array.isArray(post.likes) && userId ? post.likes.includes(userId) : false)
  );
  const [likeCount, setLikeCount] = useState(post.likeCount ?? post.likes?.length ?? 0);
  const [saved, setSaved] = useState(!!post.isSaved);
  const [paused, setPaused] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const lastTap = useRef(0);
  const tapTimer = useRef(null);

  useEffect(() => () => clearTimeout(tapTimer.current), []);
  useEffect(() => { if (!active) setPaused(false); }, [active]);

  // ── Like / save (optimistic, reverts on failure) ─────────────────────────
  const setLike = (next) => {
    if (!requireAuth('Log in to like posts')) return false;
    if (next === liked) return true;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    Promise.resolve(toggleLike(post._id)).catch(() => {
      setLiked(!next);
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
      notify('Couldn’t update like. Please try again.');
    });
    return true;
  };

  const handleSave = () => {
    if (!requireAuth('Log in to save posts')) return;
    const next = !saved;
    setSaved(next);
    Promise.resolve(toggleSave(post._id)).catch(() => {
      setSaved(!next);
      notify('Couldn’t update bookmark. Please try again.');
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/feed`;
    const text = `Check out this post on CediMart: ${post.title}`;
    if (navigator.share) {
      try { await navigator.share({ title: post.title, text, url }); } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      notify('Link copied');
    } catch {
      notify('Couldn’t copy the link');
    }
  };

  // ── Tap = pause/play, double tap = like ──────────────────────────────────
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      clearTimeout(tapTimer.current);
      lastTap.current = 0;
      if (setLike(true)) setHeartKey((k) => k + 1);
      return;
    }
    lastTap.current = now;
    if (isVideo) tapTimer.current = setTimeout(() => setPaused((p) => !p), 280);
  };

  const [g1, g2] = getGradient(post.type);

  return (
    <article className="fd-post" data-idx={index} aria-label={post.title}>
      {/* Media layer */}
      <div
        className="fd-media"
        style={!media ? { background: `linear-gradient(160deg, ${g1}, ${g2})` } : undefined}
      >
        {loadVideo && (
          <ReelVideo
            src={media.url}
            poster={media.thumbnailUrl}
            active={active}
            paused={paused}
            muted={muted}
          />
        )}
        {isVideo && !loadVideo && media?.thumbnailUrl && (
          <img className="fd-poster" src={media.thumbnailUrl} alt="" />
        )}
        {isImage && (
          <img
            className="fd-image"
            src={media.url}
            alt={post.title || ''}
            loading={distance <= 1 ? 'eager' : 'lazy'}
          />
        )}
      </div>

      {/* Tap layer (sits under the overlay controls) */}
      <button
        type="button"
        className="fd-tap"
        onClick={handleTap}
        aria-label={isVideo ? (paused ? 'Play video' : 'Pause video') : 'Double tap to like'}
      />

      {paused && isVideo && (
        <div className="fd-pause" aria-hidden="true"><Play size={40} fill="currentColor" /></div>
      )}
      {heartKey > 0 && (
        <div key={heartKey} className="fd-bigheart" aria-hidden="true">
          <Heart size={96} fill="currentColor" strokeWidth={0} />
        </div>
      )}

      <div className="fd-gradient" aria-hidden="true" />

      {/* Info + rail */}
      <div className="fd-bottom">
        <div className="fd-info">
          {isVendor && post.vendorId && (
            <Link href={`/vendors/${post.vendorId}`} className="fd-shop-btn">
              <Store size={14} /> View Shop <ChevronRight size={12} />
            </Link>
          )}

          {post.linkedProduct && (
            <div className="fd-chip">
              <Link href={`/product/${post.linkedProduct._id}`} className="fd-chip-main">
                {post.linkedProduct.images?.[0] ? (
                  <img src={post.linkedProduct.images[0]} alt="" className="fd-chip-img" />
                ) : (
                  <span className="fd-chip-img fd-chip-img-empty" />
                )}
                <span className="fd-chip-text">
                  <span className="fd-chip-name">{post.linkedProduct.name}</span>
                  <span className="fd-chip-price">GH₵ {Number(post.linkedProduct.price).toFixed(2)}</span>
                </span>
              </Link>
              <Link href={`/product/${post.linkedProduct._id}`} className="fd-chip-buy">
                <ShoppingBag size={12} /> Buy Now
              </Link>
            </div>
          )}

          <p className="fd-author-line">
            {handle}
            <span className="fd-meta">  ·  {getTimeAgo(post.createdAt)}</span>
            {post.campus && post.campus !== 'ALL' && <span className="fd-meta">  ·  {post.campus}</span>}
          </p>

          <h2 className="fd-post-title">{post.title}</h2>

          {!!post.description && (
            <div className="fd-desc-wrap">
              <p className={`fd-desc${showFullDesc ? '' : ' is-clamped'}`}>{post.description}</p>
              {post.description.length > 110 && (
                <button type="button" className="fd-readmore" onClick={() => setShowFullDesc((v) => !v)}>
                  {showFullDesc ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>

        <ActionRail
          liked={liked}
          likeCount={likeCount}
          saved={saved}
          commentCount={post.commentCount || 0}
          showFollow={!!authorId && authorId !== userId}
          isFollowing={isFollowing}
          followLoading={followLoading}
          authorInitial={(post.author?.firstName || '?').charAt(0).toUpperCase()}
          authorImage={post.author?.profileImage}
          onLike={() => setLike(!liked)}
          onComment={onComment}
          onSave={handleSave}
          onShare={handleShare}
          onReport={onReport}
          onFollow={() => onFollow(authorId)}
        />
      </div>
    </article>
  );
}