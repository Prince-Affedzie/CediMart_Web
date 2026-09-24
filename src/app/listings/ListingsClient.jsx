// src/app/listings/ListingsClient.jsx
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, X, MapPin, Search, Package, SlidersHorizontal } from 'lucide-react';
import { getAllProducts, getProductsByCategory } from '@/apis/productApi';

import { CATEGORIES } from '@/constants/listings/categories';
import { SORT_OPTIONS, CONDITION_OPTIONS } from '@/constants/listings/options';
import { CITY_OPTIONS, getSuburbs, GHANA_LOCATIONS } from '@/constants/listings/options';

import Sidebar from '@/components/Listings/Sidebar';
import ProductCard from '@/components/Listings/ProductCard';
import SkeletonCard from '@/components/Listings/SkeletonCard';
import FloatingAiButton from '@/components/Home/FloatingAiButton'
import VisualSearchFab from '@/components/VisualSearchFab'
import Pagination from '@/components/Listings/Pagination';

import './listings.css';

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 350;
const MIN_SUGGEST_LENGTH = 2;

function getLocationLabel(location) {
  if (!location) return null;
  if (typeof location === 'string') return location;
  if (location.city) {
    const cityLabel = GHANA_LOCATIONS[location.city]?.label || location.city;
    return location.area ? `${location.area}, ${cityLabel}` : cityLabel;
  }
  if (location.campusArea) {
    return location.hostel ? `${location.hostel}, ${location.campusArea}` : location.campusArea;
  }
  return null;
}

function extractProducts(res) {
  const d = res?.data;
  const data = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];
  return Array.isArray(data) ? data : [];
}

function readFiltersFromParams(params) {
  return {
    search:     params.get('search')    || '',
    category:   params.get('category')  || '',
    sub:        params.get('sub')       || '',
    city:       params.get('city')      || '',
    suburb:     params.get('suburb')    || '',
    sort:       params.get('sort')      || 'newest',
    condition:  params.get('condition') || '',
    negotiable: params.get('negotiable') === '1',
    minPrice:   params.get('minPrice')  || '',
    maxPrice:   params.get('maxPrice')  || '',
    page:       Math.max(1, parseInt(params.get('page') || '1', 10) || 1),
  };
}

export default function ListingsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSuburb, setSelectedSuburb] = useState('');
  const [sort, setSort] = useState('newest');
  const [condition, setCondition] = useState('');
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  // Search
  const [searchQuery, setSearchQuery] = useState('');       // committed value
  const [searchInput, setSearchInput] = useState('');       // live input value
  const [liveResults, setLiveResults] = useState([]);
  const [liveSearching, setLiveSearching] = useState(false);
  //  Single source of truth for "show the suggestions dropdown." Only
  //  keystrokes in the input turn this on; everything else turns it off.
  const [suggestOpen, setSuggestOpen] = useState(false);

  // UI
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const isMountedRef = useRef(true);
  const fetchIdRef = useRef(0);
  const hydratedRef = useRef(false);
  const searchWrapRef = useRef(null);

  // ── Seed state from URL on mount only ─────────────────────────────────────
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const seed = readFiltersFromParams(searchParams);
    setSearchInput(seed.search);
    setSearchQuery(seed.search);
    setActiveCategory(seed.category);
    setActiveSub(seed.sub);
    setSelectedLocation(seed.city);
    setSelectedSuburb(seed.suburb);
    setSort(seed.sort);
    setCondition(seed.condition);
    setNegotiableOnly(seed.negotiable);
    setMinPrice(seed.minPrice);
    setMaxPrice(seed.maxPrice);
    setPage(seed.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keep the URL in sync with state ───────────────────────────────────────
  const urlSyncRef = useRef(null);
  useEffect(() => {
    if (!hydratedRef.current) return;

    clearTimeout(urlSyncRef.current);
    urlSyncRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery)               params.set('search', searchQuery);
      if (activeCategory)            params.set('category', activeCategory);
      if (activeSub)                 params.set('sub', activeSub);
      if (selectedLocation)          params.set('city', selectedLocation);
      if (selectedSuburb)            params.set('suburb', selectedSuburb);
      if (sort && sort !== 'newest') params.set('sort', sort);
      if (condition)                 params.set('condition', condition);
      if (negotiableOnly)            params.set('negotiable', '1');
      if (minPrice)                  params.set('minPrice', minPrice);
      if (maxPrice)                  params.set('maxPrice', maxPrice);
      if (page > 1)                  params.set('page', String(page));

      const qs = params.toString();
      const next = `${pathname}${qs ? `?${qs}` : ''}`;
      router.replace(next, { scroll: false });
    }, 200);

    return () => clearTimeout(urlSyncRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery, activeCategory, activeSub, selectedLocation, selectedSuburb,
    sort, condition, negotiableOnly, minPrice, maxPrice, page,
  ]);

  // Derived location lists
  const cityOptions = useMemo(
    () => CITY_OPTIONS.map((c) => ({ id: c.id, label: c.label, region: c.region })),
    []
  );
  const suburbOptions = useMemo(() => getSuburbs(selectedLocation), [selectedLocation]);

  const hasAnyActiveFilter =
    !!selectedLocation || !!selectedSuburb || !!condition ||
    negotiableOnly || !!minPrice || !!maxPrice;

  const activeFilterCount = [
    condition, negotiableOnly, minPrice, maxPrice,
  ].filter(Boolean).length;

  // ── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async ({ pageNum = 1, searchOverride, filterChange = false } = {}) => {
      fetchIdRef.current += 1;
      const myId = fetchIdRef.current;

      if (filterChange) setFilterLoading(true);
      else setLoading(true);

      try {
        const effectiveSearch = searchOverride !== undefined ? searchOverride : searchQuery;
        const params = {
          page: pageNum,
          limit: PAGE_SIZE,
          sort,
          category: activeCategory || undefined,
          subcategory: activeSub || undefined,
          location: selectedLocation || undefined,
          suburb: selectedSuburb || undefined,
          condition: condition || undefined,
          negotiable: negotiableOnly || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          search: effectiveSearch.trim() || undefined,
        };

        const res = activeCategory
          ? await getProductsByCategory(activeCategory, params)
          : await getAllProducts(params);

        if (myId !== fetchIdRef.current || !isMountedRef.current) return;

        const data = extractProducts(res);
        const pg = res?.data?.pagination || res?.pagination || {};
        const tot = res?.data?.total ?? res?.total ?? data.length;

        setProducts(data);
        setTotalPages(pg.totalPages ?? Math.ceil(tot / PAGE_SIZE) ?? 1);
        setTotal(tot);
      } catch {
        if (myId === fetchIdRef.current && isMountedRef.current) {
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (myId !== fetchIdRef.current || !isMountedRef.current) return;
        setLoading(false);
        setFilterLoading(false);
      }
    },
    [
      activeCategory, activeSub, sort,
      selectedLocation, selectedSuburb,
      condition, negotiableOnly, minPrice, maxPrice,
      searchQuery,
    ]
  );

  useEffect(() => {
    if (!hydratedRef.current) return;
    fetchProducts({ pageNum: page, filterChange: page === 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeCategory, activeSub, sort, selectedLocation, selectedSuburb,
    condition, negotiableOnly, minPrice, maxPrice, searchQuery, page,
  ]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Live search (debounced fetch) ─────────────────────────────────────────
  //  Note this effect ONLY fetches results. It does NOT open or close the
  //  dropdown. Opening is the input's job (see onChange below); closing is
  //  every other action's job. This split is what prevents the dropdown
  //  from popping back open after a submit — the fetch resolves without
  //  touching `suggestOpen`, so the state you set in `submitSearch` sticks.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.trim().length >= MIN_SUGGEST_LENGTH) {
        performLiveSearch(searchInput);
      } else {
        setLiveResults([]);
        setLiveSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function performLiveSearch(q) {
    setLiveSearching(true);
    try {
      const res = await getAllProducts({
        search: q.trim(),
        limit: 6,
        category: activeCategory || undefined,
        location: selectedLocation || undefined,
        suburb: selectedSuburb || undefined,
      });
      if (isMountedRef.current) {
        setLiveResults(extractProducts(res));
        // NO setSuggestOpen(true) here — deliberately omitted.
      }
    } catch { /* silent */ }
    finally { if (isMountedRef.current) setLiveSearching(false); }
  }

  // ── Click-outside closes suggestions ──────────────────────────────────────
  useEffect(() => {
    if (!suggestOpen) return;
    const onDocClick = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [suggestOpen]);

  // ── Escape closes suggestions ─────────────────────────────────────────────
  useEffect(() => {
    if (!suggestOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setSuggestOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [suggestOpen]);

  // ── Search handlers ────────────────────────────────────────────────────────
  const submitSearch = useCallback(() => {
    setSuggestOpen(false);
    setSearchQuery(searchInput);
    setPage(1);
    //  Blur the input as a belt-and-braces measure — even if some code path
    //  re-opens the dropdown, the input has lost focus so onFocus won't
    //  re-trigger it. Safe to call even if there's no active element.
    if (typeof document !== 'undefined') document.activeElement?.blur?.();
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setLiveResults([]);
    setSuggestOpen(false);
    setPage(1);
  }, []);

  const handleInputChange = useCallback((value) => {
    setSearchInput(value);
    //  Every keystroke opens the dropdown. That's the only way it ever
    //  becomes true. If the value is now too short, it stays closed.
    setSuggestOpen(value.trim().length >= MIN_SUGGEST_LENGTH);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (liveResults.length > 0 && searchInput.trim().length >= MIN_SUGGEST_LENGTH) {
      setSuggestOpen(true);
    }
  }, [liveResults.length, searchInput]);

  // ── Other handlers ─────────────────────────────────────────────────────────
  const handleCatChange = (cat) => {
    setActiveCategory(cat);
    setActiveSub('');
    setPage(1);
  };

  const handleSubChange = (sub) => {
    setActiveSub(sub);
    setPage(1);
  };

  const clearAllFilters = () => {
    setActiveCategory('');
    setActiveSub('');
    setSelectedLocation('');
    setSelectedSuburb('');
    setCondition('');
    setNegotiableOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSearchInput('');
    setSearchQuery('');
    setLiveResults([]);
    setSuggestOpen(false);
    setPage(1);
  };

  const removeLocationFilter = () => {
    setSelectedLocation('');
    setSelectedSuburb('');
    setPage(1);
  };

  // ── Breadcrumbs and derived labels ─────────────────────────────────────────
  const activeCatObj = CATEGORIES.find((c) => c.key === activeCategory);
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Listings', href: '/listings' },
    ...(activeCatObj ? [{ label: activeCatObj.label }] : []),
    ...(activeSub ? [{ label: activeSub }] : []),
  ];

  const locationLabel = selectedLocation
    ? (GHANA_LOCATIONS[selectedLocation]?.label || selectedLocation)
    : 'All Cities';
  const deliverToLabel = selectedSuburb
    ? `${selectedSuburb}, ${locationLabel}`
    : locationLabel;

  //  Show the dropdown only when BOTH conditions are true. Belt and braces:
  //  even if some code path leaves suggestOpen=true, the dropdown won't
  //  render if the input is empty or too short.
  const showSuggestions =
    suggestOpen && searchInput.trim().length >= MIN_SUGGEST_LENGTH;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="lp-page">
      <div className="lp-topbar">
        <div className="lp-topbar-inner">
          <div className="lp-topbar-left">
            <h1 className="lp-topbar-title">
              {activeSub
                ? activeSub
                : activeCatObj
                  ? activeCatObj.label
                  : searchQuery
                    ? `Results for "${searchQuery}"`
                    : 'Shop'}
            </h1>
            <span className="lp-topbar-count">
              {loading ? 'Loading…' : `${total.toLocaleString()} items`}
            </span>
          </div>

          <div className="lp-topbar-right">
            <button
              type="button"
              className="lp-deliver-pill"
              onClick={() => setLocationSheetOpen(true)}
            >
              <MapPin size={13} strokeWidth={2.5} />
              <span className="lp-deliver-pill-text">
                <span className="lp-deliver-pill-label">Deliver to</span>
                <span className="lp-deliver-pill-value">{deliverToLabel}</span>
              </span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="lp-search-wrap" ref={searchWrapRef}>
          <form
            className="lp-search-bar"
            onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
            role="search"
          >
            <Search size={17} strokeWidth={2.2} className="lp-search-icon" />
            <input
              type="search"
              className="lp-search-input"
              placeholder="Search listings…"
              value={searchInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              aria-label="Search listings"
              aria-expanded={showSuggestions}
              aria-autocomplete="list"
              autoComplete="off"
            />
            {searchInput.length > 0 && (
              <>
                <button
                  type="button"
                  className="lp-search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <X size={16} strokeWidth={2.4} />
                </button>
                <button type="submit" className="lp-search-go" aria-label="Search">
                  <Search size={15} strokeWidth={2.4} color="#fff" />
                </button>
              </>
            )}
          </form>

          {showSuggestions && (
            <div className="lp-live-dropdown">
              {liveSearching && liveResults.length === 0 ? (
                <div className="lp-live-loading">Searching…</div>
              ) : liveResults.length > 0 ? (
                <>
                  {liveResults.map((p) => (
                    <Link
                      key={p._id}
                      href={`/product/${p._id}`}
                      className="lp-live-row"
                      onClick={() => {
                        setSuggestOpen(false);
                        setLiveResults([]);
                      }}
                    >
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="lp-live-thumb" />
                      ) : (
                        <div className="lp-live-thumb lp-live-thumb-empty" />
                      )}
                      <div className="lp-live-info">
                        <span className="lp-live-name">{p.name}</span>
                        <span className="lp-live-meta">
                          <strong>GH₵ {Number(p.price).toFixed(2)}</strong>
                          {getLocationLabel(p.location) && (
                            <span className="lp-live-loc">{getLocationLabel(p.location)}</span>
                          )}
                        </span>
                      </div>
                    </Link>
                  ))}
                  <button
                    type="button"
                    className="lp-live-view-all"
                    onClick={submitSearch}
                  >
                    See all results for &quot;{searchInput}&quot; →
                  </button>
                </>
              ) : (
                <div className="lp-live-empty">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* SORT / FILTER BAR */}
        <div className="lp-sortbar">
          <div className="lp-sortbar-seg">
            <select
              className="lp-sort-select"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value || o.id} value={o.value || o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="lp-sortbar-divider" />
          <button
            type="button"
            className={`lp-sortbar-seg ${activeFilterCount > 0 ? 'is-active' : ''}`}
            onClick={() => setFilterSheetOpen(true)}
          >
            <SlidersHorizontal size={14} strokeWidth={2.4} />
            <span>Filter</span>
            {activeFilterCount > 0 && <span className="lp-sortbar-count">{activeFilterCount}</span>}
          </button>
        </div>

        {/* ACTIVE FILTER CHIPS */}
        {hasAnyActiveFilter && (
          <div className="lp-active-filters">
            {selectedLocation && (
              <span className="lp-filter-pill">
                <MapPin size={11} strokeWidth={2.2} /> {deliverToLabel}
                <button className="lp-filter-pill-x" onClick={removeLocationFilter} aria-label="Remove location">
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            )}
            {condition && (
              <span className="lp-filter-pill">
                {CONDITION_OPTIONS.find((c) => c.value === condition)?.label || condition}
                <button className="lp-filter-pill-x" onClick={() => { setCondition(''); setPage(1); }}>
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            )}
            {negotiableOnly && (
              <span className="lp-filter-pill">
                Negotiable
                <button className="lp-filter-pill-x" onClick={() => { setNegotiableOnly(false); setPage(1); }}>
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="lp-filter-pill">
                GH₵ {minPrice || '0'} – {maxPrice || '∞'}
                <button className="lp-filter-pill-x" onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1); }}>
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="lp-filter-pill">
                <Search size={11} strokeWidth={2.2} /> &quot;{searchQuery}&quot;
                <button className="lp-filter-pill-x" onClick={clearSearch}>
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            )}
            <button className="lp-clear-all" onClick={clearAllFilters}>Clear all</button>
          </div>
        )}
      </div>

      {/* MAIN SHELL */}
      <div className="lp-shell">
        <Sidebar
          activeCategory={activeCategory}
          activeSub={activeSub}
          onCategory={handleCatChange}
          onSub={handleSubChange}
        />

        <div className="lp-right">
          <main className="lp-main">
            <nav className="lp-breadcrumb" aria-label="Breadcrumb">
              {crumbs.map((crumb, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i > 0 && (
                    <span className="lp-breadcrumb-sep">
                      <ChevronRight size={12} strokeWidth={2} />
                    </span>
                  )}
                  {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span className="lp-breadcrumb-cur">{crumb.label}</span>}
                </span>
              ))}
            </nav>

            {filterLoading ? (
              <div className="lp-grid">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : loading ? (
              <div className="lp-grid">
                {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="lp-empty">
                <div className="lp-empty-icon"><Package size={44} strokeWidth={1.5} /></div>
                <h3>No listings found</h3>
                <p>Try a different category, location, or search term.</p>
                {(activeCategory || activeSub || hasAnyActiveFilter || searchQuery) && (
                  <button className="lp-empty-reset" onClick={clearAllFilters}>Clear filters</button>
                )}
              </div>
            ) : (
              <div className="lp-grid">
                {products.map((p, i) => (
                  <ProductCard key={p._id || i} product={p} index={i} />
                ))}
              </div>
            )}

            <Pagination
              page={page}
              totalPages={loading ? 1 : totalPages}
              onPageChange={setPage}
            />
            <VisualSearchFab />
             <FloatingAiButton/>
          </main>
        </div>
      </div>

      {/* LOCATION SHEET */}
      {locationSheetOpen && (
        <div className="lp-sheet-backdrop" onClick={() => setLocationSheetOpen(false)}>
          <div className="lp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="lp-sheet-handle" />
            <h2 className="lp-sheet-title">Deliver To</h2>

            <div className="lp-sheet-body">
              <p className="lp-sheet-sub">City</p>
              <div className="lp-chip-wrap">
                <button
                  className={`lp-chip ${!selectedLocation ? 'is-active' : ''}`}
                  onClick={() => { setSelectedLocation(''); setSelectedSuburb(''); setPage(1); }}
                >
                  All Cities
                </button>
                {cityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    className={`lp-chip ${selectedLocation === opt.id ? 'is-active' : ''}`}
                    onClick={() => { setSelectedLocation(opt.id); setSelectedSuburb(''); setPage(1); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {selectedLocation && suburbOptions.length > 0 && (
                <>
                  <p className="lp-sheet-sub" style={{ marginTop: 20 }}>
                    Area in {GHANA_LOCATIONS[selectedLocation]?.label}
                  </p>
                  <div className="lp-chip-wrap">
                    <button
                      className={`lp-chip ${!selectedSuburb ? 'is-active' : ''}`}
                      onClick={() => { setSelectedSuburb(''); setPage(1); }}
                    >
                      All Areas
                    </button>
                    {suburbOptions.map((sub) => (
                      <button
                        key={sub}
                        className={`lp-chip ${selectedSuburb === sub ? 'is-active' : ''}`}
                        onClick={() => { setSelectedSuburb(selectedSuburb === sub ? '' : sub); setPage(1); }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedLocation && suburbOptions.length === 0 && (
                <p className="lp-sheet-hint">
                  No specific areas listed for this city — showing everything in {GHANA_LOCATIONS[selectedLocation]?.label}.
                </p>
              )}
            </div>

            <button
              className="lp-sheet-apply"
              onClick={() => setLocationSheetOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ADVANCED FILTER SHEET */}
      {filterSheetOpen && (
        <div className="lp-sheet-backdrop" onClick={() => setFilterSheetOpen(false)}>
          <div className="lp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="lp-sheet-handle" />
            <div className="lp-sheet-head">
              <h2 className="lp-sheet-title">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  className="lp-sheet-clear"
                  onClick={() => { setCondition(''); setNegotiableOnly(false); setMinPrice(''); setMaxPrice(''); setPage(1); }}
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="lp-sheet-body">
              <p className="lp-sheet-sub">Condition</p>
              <div className="lp-chip-wrap">
                {CONDITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`lp-chip ${condition === opt.value ? 'is-active' : ''}`}
                    onClick={() => { setCondition(opt.value); setPage(1); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <p className="lp-sheet-sub" style={{ marginTop: 20 }}>Price Range (GH₵)</p>
              <div className="lp-price-row">
                <input
                  type="number"
                  className="lp-price-input"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                />
                <span className="lp-price-dash" />
                <input
                  type="number"
                  className="lp-price-input"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                />
              </div>

              <label className="lp-toggle-row">
                <div>
                  <span className="lp-toggle-label">Negotiable Only</span>
                  <span className="lp-toggle-sub">Show listings open to price discussion</span>
                </div>
                <input
                  type="checkbox"
                  className="lp-toggle-input"
                  checked={negotiableOnly}
                  onChange={(e) => { setNegotiableOnly(e.target.checked); setPage(1); }}
                />
              </label>
            </div>

            <button
              className="lp-sheet-apply"
              onClick={() => setFilterSheetOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}