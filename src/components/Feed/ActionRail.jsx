// src/components/Feed/ActionRail.jsx
'use client';

import { Heart, MessageCircle, Bookmark, Share2, Flag, Plus, Check, Loader2 } from 'lucide-react';
import { formatCount } from './feedUtils';

export default function ActionRail({
  liked, likeCount, saved, commentCount,
  showFollow, isFollowing, followLoading,
  authorInitial, authorImage,
  onLike, onComment, onSave, onShare, onReport, onFollow,
}) {
  return (
    <div className="fd-rail">
      <div className="fd-rail-avatar-wrap">
        <div className="fd-rail-avatar">
          {authorImage ? <img src={authorImage} alt="" /> : <span>{authorInitial}</span>}
        </div>
        {showFollow && (
          <button
            type="button"
            className={`fd-rail-follow${isFollowing ? ' is-following' : ''}`}
            onClick={onFollow}
            disabled={followLoading}
            aria-label={isFollowing ? 'Unfollow' : 'Follow'}
          >
            {followLoading ? <Loader2 size={12} className="fd-spin" /> : isFollowing ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
          </button>
        )}
      </div>

      <button type="button" className={`fd-rail-btn${liked ? ' is-liked' : ''}`} onClick={onLike} aria-pressed={liked} aria-label="Like">
        <Heart size={30} fill="currentColor" strokeWidth={0} />
        <span>{formatCount(likeCount)}</span>
      </button>

      <button type="button" className="fd-rail-btn" onClick={onComment} aria-label="Comments">
        <MessageCircle size={30} fill="currentColor" strokeWidth={0} />
        <span>{formatCount(commentCount)}</span>
      </button>

      <button type="button" className={`fd-rail-btn${saved ? ' is-saved' : ''}`} onClick={onSave} aria-pressed={saved} aria-label="Save">
        <Bookmark size={30} fill="currentColor" strokeWidth={0} />
      </button>

      <button type="button" className="fd-rail-btn" onClick={onShare} aria-label="Share">
        <Share2 size={28} />
      </button>

      <button type="button" className="fd-rail-btn" onClick={onReport} aria-label="Report">
        <Flag size={26} />
      </button>
    </div>
  );
}