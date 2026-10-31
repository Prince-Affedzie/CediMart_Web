// src/components/Listings/InfiniteLoader.jsx
'use client';

import { useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';

export default function InfiniteLoader({
  hasMore, busy, error, count, total, showEnd, onLoadMore, onRetry,
}) {
  const sentinelRef = useRef(null);
  const loadRef = useRef(onLoadMore);
  loadRef.current = onLoadMore;

  // The observer is re-created after every load (`count`/`busy` change). A new
  // observer reports the current state immediately, so if the sentinel is
  // STILL on screen (tall monitor, short chunk) the next chunk keeps loading.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || busy || error) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadRef.current(); },
      { rootMargin: '0px 0px 700px 0px' } // start loading ~700px before the bottom
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, busy, error, count]);

  if (error) {
    return (
      <div className="lp-more" role="alert">
        <p>Couldn’t load more listings.</p>
        <button type="button" className="lp-more-btn" onClick={onRetry}>
          <RotateCw size={14} strokeWidth={2.4} /> Try again
        </button>
      </div>
    );
  }

  if (hasMore) return <div ref={sentinelRef} className="lp-more-sentinel" aria-hidden="true" />;

  if (showEnd && count > 0) {
    return <p className="lp-more-end">You’ve seen all {Math.max(total, count).toLocaleString()} listings</p>;
  }

  return null;
}