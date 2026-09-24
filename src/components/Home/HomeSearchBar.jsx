// src/components/Home/HomeSearchBar.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, ArrowRight, ChevronDown } from 'lucide-react';
import { getAllProducts } from '@/apis/productApi';
import { CATEGORIES } from '@/constants/listings/categories';
import './HomeSearchBar.css';

const RECENT_KEY = 'cedimart:recent-searches';
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

function extractProducts(res) {
  const d = res?.data;
  const data = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];
  return Array.isArray(data) ? data.slice(0, 6) : [];
}

function loadRecent() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch { return []; }
}

function saveRecent(list) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch {}
}

export default function HomeSearchBar() {
  const router = useRouter();

  const [query, setQuery]             = useState('');
  const [category, setCategory]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [open, setOpen]               = useState(false);
  const [activeIdx, setActiveIdx]     = useState(-1);
  const [catOpen, setCatOpen]         = useState(false);

  const rootRef     = useRef(null);
  const inputRef    = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { setRecent(loadRecent()); }, []);

  // ── Debounced live search ──────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getAllProducts({
          search: q,
          limit: 6,
          category: category || undefined,
        });
        setSuggestions(extractProducts(res));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query, category]);

  // ── Close on outside click ─────────────────────────────────────────────
  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => { setActiveIdx(-1); }, [query, suggestions.length, open]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const pushRecent = useCallback((term) => {
    const t = term.trim();
    if (!t) return;
    const lower = t.toLowerCase();
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== lower)].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
  }, []);

  const goToResults = useCallback((term) => {
    const q = term.trim();
    if (q) pushRecent(q);
    setOpen(false);
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (category) params.set('category', category);
    router.push(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
  }, [router, pushRecent, category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      const p = suggestions[activeIdx];
      pushRecent(query);
      setOpen(false);
      router.push(`/product/${p._id}`);
      return;
    }
    goToResults(query);
  };

  const handleKeyDown = (e) => {
    if (!open && e.key === 'ArrowDown') { setOpen(true); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearRecent = () => { setRecent([]); saveRecent([]); };

  const selectedCatLabel =
    CATEGORIES.find((c) => c.key === category)?.label || 'All categories';

  const showRecent   = open && !query.trim() && recent.length > 0;
  const showResults  = open && query.trim().length >= MIN_QUERY_LENGTH;
  const showDropdown = showRecent || showResults;

  return (
    <section className="hs-wrap" ref={rootRef}>
      <form className="hs-bar" onSubmit={handleSubmit} role="search">
        {/* ── Category selector ── */}
        <div className="hs-cat">
          <button
            type="button"
            className="hs-cat-btn"
            onClick={() => setCatOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={catOpen}
          >
            <span className="hs-cat-label">{selectedCatLabel}</span>
            <ChevronDown size={14} strokeWidth={2.6} />
          </button>

          {catOpen && (
            <div className="hs-cat-menu" role="listbox">
              <button
                type="button"
                className={`hs-cat-item ${!category ? 'is-active' : ''}`}
                onClick={() => { setCategory(''); setCatOpen(false); }}
              >
                All categories
              </button>
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.key}
                    type="button"
                    className={`hs-cat-item ${category === c.key ? 'is-active' : ''}`}
                    onClick={() => { setCategory(c.key); setCatOpen(false); }}
                  >
                    {Icon && <Icon size={14} strokeWidth={2.2} className="hs-cat-item-icon" />}
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <span className="hs-divider" aria-hidden="true" />

        {/* ── Input ── */}
        <Search size={18} strokeWidth={2.4} className="hs-icon" />
        <input
          ref={inputRef}
          type="text"
          className="hs-input"
          placeholder="Search for laptops, textbooks, sneakers…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search listings"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          autoComplete="off"
        />

        {query.length > 0 && (
          <button
            type="button"
            className="hs-clear"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            aria-label="Clear search"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        )}

        {/* ── Submit ── */}
        <button type="submit" className="hs-submit" aria-label="Search">
          <Search size={17} strokeWidth={2.6} />
         
        </button>
      </form>

      {/* ── Suggestions dropdown ── */}
      {showDropdown && (
        <div className="hs-dropdown" role="listbox">
          {showRecent && (
            <>
              <div className="hs-dropdown-head">
                <span>Recent searches</span>
                <button type="button" className="hs-dropdown-clear" onClick={clearRecent}>
                  Clear
                </button>
              </div>
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="hs-suggestion"
                  onClick={() => goToResults(term)}
                >
                  <Clock size={14} strokeWidth={2.2} className="hs-suggestion-icon" />
                  <span className="hs-suggestion-text">{term}</span>
                  <ArrowRight size={14} strokeWidth={2} className="hs-suggestion-arrow" />
                </button>
              ))}
            </>
          )}

          {showResults && (
            <>
              {loading && suggestions.length === 0 && (
                <div className="hs-dropdown-empty">Searching…</div>
              )}
              {!loading && suggestions.length === 0 && (
                <div className="hs-dropdown-empty">
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}
              {suggestions.length > 0 && (
                <>
                  <div className="hs-dropdown-head">
                    <span>Suggestions</span>
                  </div>
                  {suggestions.map((p, i) => (
                    <button
                      key={p._id}
                      type="button"
                      className={`hs-suggestion ${activeIdx === i ? 'is-active' : ''}`}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => {
                        pushRecent(query);
                        setOpen(false);
                        router.push(`/product/${p._id}`);
                      }}
                    >
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="hs-suggestion-thumb" />
                      ) : (
                        <span className="hs-suggestion-thumb hs-suggestion-thumb-empty" />
                      )}
                      <span className="hs-suggestion-text">{p.name}</span>
                      <span className="hs-suggestion-price">
                        GH₵ {Number(p.price).toFixed(2)}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="hs-dropdown-all"
                    onClick={() => goToResults(query)}
                  >
                    See all results for &ldquo;{query}&rdquo;
                    <ArrowRight size={14} strokeWidth={2.4} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}