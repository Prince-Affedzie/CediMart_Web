// src/app/feed/FeedClient.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ArrowLeft, ChevronUp, ChevronDown, Volume2, VolumeX, Film } from 'lucide-react';
import { getFeed, searchFeed, incrementView } from '@/apis/feedApi';
import * as userApi from '@/apis/userApi';
import { useAuth } from '@/context/AuthContext';
import FeedPostItem from '@/components/Feed/FeedPostItem';
import CommentsPanel from '@/components/Feed/CommentsPanel';
import ReportModal from '@/components/Feed/ReportModal';
import TypeFilter from '@/components/Feed/TypeFilter';
import ReelSkeleton from '@/components/Feed/ReelSkeleton';
import { FEED_TYPES, dedupeById } from '@/components/Feed/feedUtils';
import './feed.css';

const PAGE_LIMIT = 5;

export default function FeedClient() {
  const { isAuthenticated, user } = useAuth();

  // ── Feed state ──────────────────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeType, setActiveType] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // ── Search state ────────────────────────────────────────────────────────
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────
  const [muted, setMuted] = useState(true); // browsers only autoplay muted video
  const [commentPost, setCommentPost] = useState(null);
  const [reportPost, setReportPost] = useState(null);
  const [followingIds, setFollowingIds] = useState(() => new Set());
  const [followBusyId, setFollowBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const stageRef = useRef(null);
  const scrollerRef = useRef(null);
  const searchInputRef = useRef(null);
  const feedReqRef = useRef(0);
  const searchReqRef = useRef(0);
  const busyRef = useRef(false);
  const searchTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const viewedRef = useRef(new Set());

  const displayPosts = isSearchMode ? searchResults : posts;

  // ── Size the stage to exactly the space below the site header ───────────
  useEffect(() => {
    const update = () => {
      const el = stageRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      el.style.setProperty('--feed-h', `${Math.max(360, window.innerHeight - top)}px`);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    const header = document.querySelector('header');
    const ro = header && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro) ro.observe(header);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      ro?.disconnect();
    };
  }, []);

  // ── Toast + auth gate ───────────────────────────────────────────────────
  const notify = useCallback((message, withLogin = false) => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, withLogin });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const requireAuth = useCallback(
    (message) => {
      if (isAuthenticated) return true;
      notify(message, true);
      return false;
    },
    [isAuthenticated, notify]
  );

  useEffect(() => () => {
    clearTimeout(toastTimerRef.current);
    clearTimeout(searchTimerRef.current);
  }, []);

  // ── Fetch feed ──────────────────────────────────────────────────────────
  const fetchFeed = useCallback(
    async (pageNum = 1) => {
      const id = ++feedReqRef.current;
      busyRef.current = true;
      if (pageNum === 1) setLoading(true);
      setError(false);
      try {
        const res = await getFeed({ page: pageNum, limit: PAGE_LIMIT, type: activeType || undefined });
        if (id !== feedReqRef.current) return;
        const newPosts = res.data?.data?.posts || [];
        const pg = res.data?.data?.pagination || {};
        setPosts((prev) => (pageNum === 1 ? newPosts : dedupeById([...prev, ...newPosts])));
        setHasMore(pageNum < (pg.totalPages || 0));
        setPage(pageNum);
      } catch {
        if (id === feedReqRef.current) setError(true);
      } finally {
        if (id === feedReqRef.current) {
          setLoading(false);
          busyRef.current = false;
        }
      }
    },
    [activeType]
  );

  useEffect(() => {
    setPosts([]);
    setActiveIndex(0);
    scrollerRef.current?.scrollTo({ top: 0 });
    fetchFeed(1);
  }, [fetchFeed]);

  // ── Search ──────────────────────────────────────────────────────────────
  const performSearch = useCallback(
    async (query, pageNum = 1, append = false) => {
      const id = ++searchReqRef.current;
      busyRef.current = true;
      if (pageNum === 1) {
        setSearchLoading(true);
        setIsSearchMode(true);
      }
      try {
        const res = await searchFeed({ query, page: pageNum, limit: PAGE_LIMIT, type: activeType || undefined });
        if (id !== searchReqRef.current) return;
        const list = res.data?.data?.posts || [];
        const pg = res.data?.data?.pagination || {};
        setSearchResults((prev) => (append ? dedupeById([...prev, ...list]) : list));
        setSearchHasMore(pageNum < (pg.totalPages || 0));
        setSearchPage(pageNum);
      } catch {
        if (id === searchReqRef.current && pageNum === 1) setSearchResults([]);
      } finally {
        if (id === searchReqRef.current) {
          setSearchLoading(false);
          busyRef.current = false;
        }
      }
    },
    [activeType]
  );

  const resetSearchResults = () => {
    setIsSearchMode(false);
    setSearchResults([]);
    setSearchHasMore(false);
    setSearchPage(1);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    clearTimeout(searchTimerRef.current);
    if (!text.trim()) {
      resetSearchResults();
      return;
    }
    searchTimerRef.current = setTimeout(() => performSearch(text.trim(), 1), 500);
  };

  const openSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    clearTimeout(searchTimerRef.current);
    setSearchQuery('');
    resetSearchResults();
    setShowSearch(false);
  };

  const clearSearchText = () => {
    clearTimeout(searchTimerRef.current);
    setSearchQuery('');
    resetSearchResults();
    searchInputRef.current?.focus();
  };

  // Back to the top whenever we enter or leave search results
  useEffect(() => {
    setActiveIndex(0);
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [isSearchMode]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (busyRef.current) return;
    if (isSearchMode) {
      if (searchHasMore && searchQuery.trim()) performSearch(searchQuery.trim(), searchPage + 1, true);
    } else if (hasMore && !loading) {
      fetchFeed(page + 1);
    }
  }, [isSearchMode, searchHasMore, searchQuery, searchPage, hasMore, loading, page, performSearch, fetchFeed]);

  useEffect(() => {
    if (displayPosts.length > 0 && activeIndex >= displayPosts.length - 2) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, displayPosts.length]);

  // ── Which reel is on screen? ────────────────────────────────────────────
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveIndex(Number(e.target.dataset.idx));
        }
      },
      { root, threshold: 0.7 }
    );
    root.querySelectorAll('[data-idx]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [displayPosts.length, isSearchMode]);

  // Count a view once per post
  useEffect(() => {
    const p = displayPosts[activeIndex];
    if (p && !viewedRef.current.has(p._id)) {
      viewedRef.current.add(p._id);
      incrementView(p._id)?.catch?.(() => {});
    }
  }, [activeIndex, displayPosts]);

  // ── Navigation (buttons + keyboard) ─────────────────────────────────────
  const goTo = useCallback(
    (i) => {
      const el = scrollerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(i, displayPosts.length - 1));
      el.scrollTo({ top: clamped * el.clientHeight, behavior: 'smooth' });
    },
    [displayPosts.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (commentPost || reportPost) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); goTo(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); goTo(activeIndex - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, goTo, commentPost, reportPost]);

  // ── Post patching (comment counts) ──────────────────────────────────────
  const patchPost = useCallback((id, fn) => {
    const apply = (list) => list.map((p) => (p._id === id ? fn(p) : p));
    setPosts(apply);
    setSearchResults(apply);
  }, []);

  // ── Follow (state lives here so it stays in sync across posts) ──────────
  const handleFollow = async (authorId) => {
    if (!authorId || followBusyId) return;
    if (!requireAuth('Log in to follow creators')) return;
    const was = followingIds.has(authorId);
    const setTo = (on) =>
      setFollowingIds((prev) => {
        const next = new Set(prev);
        on ? next.add(authorId) : next.delete(authorId);
        return next;
      });
    setTo(!was);
    setFollowBusyId(authorId);
    try {
      // If userApi has a dedicated unfollowUser it is used; otherwise followUser is called again.
      const call = was ? (userApi.followUser) : userApi.followUser;
      await call(authorId);
    } catch {
      setTo(was);
      notify('Couldn’t update follow. Please try again.');
    } finally {
      setFollowBusyId(null);
    }
  };

  const handleComment = (post) => {
    if (!requireAuth('Log in to comment')) return;
    setCommentPost(post);
  };

  const handleReport = (post) => {
    if (!requireAuth('Log in to report posts')) return;
    setReportPost(post);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  const showSkeleton =
    (loading && posts.length === 0 && !isSearchMode) ||
    (searchLoading && searchResults.length === 0 && isSearchMode);

  const typeLabel = FEED_TYPES.find((t) => t.key === activeType)?.label;

  return (
    <div className="fd-stage" ref={stageRef}>
      <div className="fd-frame">
        {/* Floating top bar */}
        <div className="fd-topbar">
          {showSearch ? (
            <div className="fd-search-row">
              <button type="button" className="fd-icon-btn" onClick={closeSearch} aria-label="Close search">
                <ArrowLeft size={20} />
              </button>
              <div className="fd-search-wrap">
                <Search size={16} />
                <input
                  ref={searchInputRef}
                  className="fd-search-input"
                  type="search"
                  placeholder="Search posts…"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      clearTimeout(searchTimerRef.current);
                      performSearch(searchQuery.trim(), 1);
                    }
                  }}
                  autoComplete="off"
                  aria-label="Search posts"
                />
                {searchQuery && (
                  <button type="button" className="fd-search-clear" onClick={clearSearchText} aria-label="Clear">
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="fd-title-row">
                <h1 className="fd-title">Feed</h1>
                <div className="fd-title-actions">
                  <button
                    type="button"
                    className="fd-icon-btn"
                    onClick={() => setMuted((m) => !m)}
                    aria-label={muted ? 'Unmute videos' : 'Mute videos'}
                    aria-pressed={!muted}
                  >
                    {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                  </button>
                  <button type="button" className="fd-icon-btn" onClick={openSearch} aria-label="Search posts">
                    <Search size={19} />
                  </button>
                </div>
              </div>
              <TypeFilter types={FEED_TYPES} activeType={activeType} onSelect={setActiveType} />
            </>
          )}
        </div>

        {/* Scrolling reels */}
        <div className="fd-scroller" ref={scrollerRef}>
          {displayPosts.map((post, index) => (
            <FeedPostItem
              key={post._id}
              post={post}
              index={index}
              active={index === activeIndex}
              distance={Math.abs(index - activeIndex)}
              muted={muted}
              userId={user?._id}
              isFollowing={followingIds.has(post.author?._id || post.author)}
              followLoading={followBusyId === (post.author?._id || post.author)}
              onFollow={handleFollow}
              requireAuth={requireAuth}
              notify={notify}
              onComment={() => handleComment(post)}
              onReport={() => handleReport(post)}
            />
          ))}

          {!showSkeleton && displayPosts.length === 0 && (
            <div className="fd-empty">
              <div className="fd-empty-icon"><Film size={38} strokeWidth={1.6} /></div>
              {error ? (
                <>
                  <h2>Couldn’t load the feed</h2>
                  <p>Check your connection and try again.</p>
                  <button type="button" className="fd-empty-btn" onClick={() => fetchFeed(1)}>Try again</button>
                </>
              ) : isSearchMode ? (
                <>
                  <h2>No results found</h2>
                  <p>No posts match “{searchQuery}”.</p>
                  <button type="button" className="fd-empty-btn" onClick={clearSearchText}>Clear search</button>
                </>
              ) : (
                <>
                  <h2>{activeType ? `No ${typeLabel} posts yet` : 'No posts yet'}</h2>
                  <p>Check back soon for videos from campus sellers.</p>
                </>
              )}
            </div>
          )}
        </div>

        {showSkeleton && <ReelSkeleton />}
      </div>

      {/* Desktop up/down buttons */}
      {displayPosts.length > 1 && (
        <div className="fd-nav">
          <button type="button" className="fd-nav-btn" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Previous post">
            <ChevronUp size={22} />
          </button>
          <button type="button" className="fd-nav-btn" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex >= displayPosts.length - 1} aria-label="Next post">
            <ChevronDown size={22} />
          </button>
        </div>
      )}

      <CommentsPanel
        open={!!commentPost}
        postId={commentPost?._id}
        user={user}
        onClose={() => setCommentPost(null)}
        onCountChange={(delta) =>
          commentPost &&
          patchPost(commentPost._id, (p) => ({ ...p, commentCount: Math.max(0, (p.commentCount || 0) + delta) }))
        }
      />

      <ReportModal
        open={!!reportPost}
        contentType="FeedPost"
        contentId={reportPost?._id}
        onClose={() => setReportPost(null)}
      />

      {toast && (
        <div className="fd-toast" role="status">
          <span>{toast.message}</span>
          {toast.withLogin && <Link href="/login">Log in</Link>}
        </div>
      )}
    </div>
  );
}