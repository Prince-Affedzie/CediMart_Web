// src/app/categories/[category]/page.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Search, ChevronRight, X, MapPin, ArrowUpDown, ChevronDown,
  Package, SlidersHorizontal, Star
} from 'lucide-react';
import { getProductsByCategory } from '@/apis/productApi';

import { CATEGORIES } from '@/constants/listings/categories';
import { SUBCATEGORIES } from '@/constants/listings/subcategories';
import { SORT_OPTIONS, CAMPUS_OPTIONS } from '@/constants/listings/options';

import ProductCard from '@/components/Listings/ProductCard';
import SkeletonCard from '@/components/Listings/SkeletonCard';
import Pagination from '@/components/Listings/Pagination';

import './category.css';

const PAGE_LIMIT = 20;

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Decode URL-encoded category (e.g. "computers%20and%20laptops")
  const category = decodeURIComponent(params.category || '');

  const catObj = CATEGORIES.find((c) => c.key === category);
  const CatIcon = catObj?.icon;
  const subcategories = SUBCATEGORIES[category] || [];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [activeSub, setActiveSub] = useState(searchParams.get('sub') || '');
  const [campus, setCampus] = useState(searchParams.get('campus') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [showSearch, setShowSearch] = useState(!!searchParams.get('q'));

  // ── Sync filters to URL ───────────────────────────────────────────────
  const syncURL = useCallback((overrides = {}) => {
    const next = {
      sub: activeSub,
      campus,
      sort,
      page: page.toString(),
      q: search,
      ...overrides,
    };
    const qs = new URLSearchParams();
    if (next.sub) qs.set('sub', next.sub);
    if (next.campus) qs.set('campus', next.campus);
    if (next.sort && next.sort !== 'newest') qs.set('sort', next.sort);
    if (next.page && next.page !== '1') qs.set('page', next.page);
    if (next.q) qs.set('q', next.q);
    const url = `/categories/${encodeURIComponent(category)}${qs.toString() ? `?${qs}` : ''}`;
    router.replace(url, { scroll: false });
  }, [activeSub, campus, sort, page, search, category, router]);

  // ── Fetch products ────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams = { page, limit: PAGE_LIMIT, sort };
      if (activeSub) apiParams.subcategory = activeSub;
      if (campus) apiParams.campus = campus;
      if (search) apiParams.search = search;

      const res = await getProductsByCategory(category, apiParams);
      const data = res?.data?.data || res?.data?.products || res?.data || [];
      const pgData = res?.data?.pagination || {};
      const tot = res?.data?.total ?? (Array.isArray(data) ? data.length : 0);

      setProducts(Array.isArray(data) ? data : []);
      setTotalPages(pgData.totalPages ?? Math.ceil(tot / PAGE_LIMIT) ?? 1);
      setTotal(tot);
    } catch (err) {
      console.error('Failed to fetch category products:', err);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [category, activeSub, campus, sort, page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    const next = searchInput.trim();
    setSearch(next);
    setPage(1);
    syncURL({ q: next, page: '1' });
  };

  const handleSubChange = (sub) => {
    const next = activeSub === sub ? '' : sub;
    setActiveSub(next);
    setPage(1);
    syncURL({ sub: next, page: '1' });
  };

  const handleCampusChange = (e) => {
    const next = e.target.value;
    setCampus(next);
    setPage(1);
    syncURL({ campus: next, page: '1' });
  };

  const handleSortChange = (e) => {
    const next = e.target.value;
    setSort(next);
    setPage(1);
    syncURL({ sort: next, page: '1' });
  };

  const handlePageChange = (next) => {
    setPage(next);
    syncURL({ page: next.toString() });
    // Scroll to top of grid
    const anchor = document.getElementById('category-grid-anchor');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
    setPage(1);
    syncURL({ q: '', page: '1' });
  };

  const clearAllFilters = () => {
    setActiveSub('');
    setCampus('');
    setSearch('');
    setSearchInput('');
    setSort('newest');
    setPage(1);
    syncURL({ sub: '', campus: '', q: '', sort: 'newest', page: '1' });
  };

  // ── Computed ──────────────────────────────────────────────────────────
  const activeSubObj = useMemo(() => {
    if (!activeSub) return null;
    return subcategories.find((s) => (s.id || s.key) === activeSub);
  }, [activeSub, subcategories]);

  const activeCampusLabel = CAMPUS_OPTIONS.find((c) => c.value === campus)?.label;
  const hasFilters = !!(activeSub || campus || search);
  const activeFilterCount = [activeSub, campus, search].filter(Boolean).length;

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Listings', href: '/listings' },
    { label: catObj?.label || category },
    ...(activeSubObj ? [{ label: activeSubObj.label }] : []),
  ];

  // Category hero gradient colors — fall back to brand teal
  const heroColor = catObj?.color || '#0D9488';

  return (
    <div className="cat-page" style={{ '--cat-color': heroColor }}>
      {/* ── Category Hero ── */}
      <section className="cat-hero">
        <div className="cat-hero-bg" />
        {CatIcon && <CatIcon className="cat-hero-decor" size={180} strokeWidth={0.8} />}

        <div className="cat-hero-inner">
          <nav className="cat-breadcrumb" aria-label="Breadcrumb">
            {crumbs.map((crumb, i) => (
              <span key={i} className="cat-breadcrumb-item">
                {i > 0 && <ChevronRight size={12} className="cat-breadcrumb-sep" />}
                {crumb.href ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span className="cat-breadcrumb-cur">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="cat-hero-title-row">
            <div className="cat-hero-icon-badge">
              {CatIcon && <CatIcon size={26} strokeWidth={2.2} />}
            </div>
            <div>
              <h1 className="cat-hero-title">{catObj?.label || category}</h1>
              <p className="cat-hero-sub">
                {loading
                  ? 'Loading listings…'
                  : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''} available${
                      campus ? ` in ${activeCampusLabel}` : ''
                    }`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky Filter Bar ── */}
      <div className="cat-toolbar">
        <div className="cat-toolbar-inner">
          {/* Search */}
          <form className="cat-search-form" onSubmit={handleSearch}>
            <span className="cat-search-icon-wrap">
              <Search size={16} strokeWidth={2} />
            </span>
            <input
              className="cat-search-input"
              placeholder={`Search in ${catObj?.label || category}…`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={`Search in ${catObj?.label || category}`}
            />
            {searchInput && (
              <button
                type="button"
                className="cat-search-clear"
                onClick={() => { setSearchInput(''); if (search) clearSearch(); }}
                aria-label="Clear search"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
            <button type="submit" className="cat-search-btn">Search</button>
          </form>

          {/* Campus select */}
          <div className="cat-select-wrap">
            <span className="cat-select-icon"><MapPin size={13} strokeWidth={2} /></span>
            <select
              className="cat-select"
              value={campus}
              onChange={handleCampusChange}
              aria-label="Filter by campus"
            >
              {CAMPUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="cat-select-chevron"><ChevronDown size={13} strokeWidth={2} /></span>
          </div>

          {/* Sort select */}
          <div className="cat-select-wrap">
            <span className="cat-select-icon"><ArrowUpDown size={13} strokeWidth={2} /></span>
            <select
              className="cat-select"
              value={sort}
              onChange={handleSortChange}
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="cat-select-chevron"><ChevronDown size={13} strokeWidth={2} /></span>
          </div>
        </div>

        {/* Subcategory strip */}
        {subcategories.length > 0 && (
          <div className="cat-subcat-strip">
            <div className="cat-subcat-scroll">
              <button
                className={`cat-subcat-chip ${!activeSub ? 'active' : ''}`}
                onClick={() => handleSubChange('')}
              >
                All
              </button>
              {subcategories.map((sub) => {
                const key = sub.id || sub.key;
                const isActive = activeSub === key;
                return (
                  <button
                    key={key}
                    className={`cat-subcat-chip ${isActive ? 'active' : ''}`}
                    onClick={() => handleSubChange(key)}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active filters row */}
        {hasFilters && (
          <div className="cat-active-filters">
            {activeSubObj && (
              <span className="cat-filter-pill">
                {activeSubObj.label}
                <button
                  className="cat-filter-pill-x"
                  onClick={() => handleSubChange(activeSub)}
                  aria-label="Remove subcategory filter"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            )}
            {campus && (
              <span className="cat-filter-pill">
                <MapPin size={11} strokeWidth={2} /> {activeCampusLabel}
                <button
                  className="cat-filter-pill-x"
                  onClick={() => { setCampus(''); setPage(1); syncURL({ campus: '', page: '1' }); }}
                  aria-label="Remove campus filter"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            )}
            {search && (
              <span className="cat-filter-pill">
                <Search size={11} strokeWidth={2} /> "{search}"
                <button
                  className="cat-filter-pill-x"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </span>
            )}
            <button className="cat-clear-all" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <main className="cat-main">
        <div id="category-grid-anchor" style={{ position: 'relative', top: -100 }} />

        {/* Result meta */}
        <div className="cat-result-meta">
          <h2 className="cat-result-title">
            {activeSubObj ? activeSubObj.label : catObj?.label || category}
          </h2>
          <span className="cat-result-count">
            {loading ? '—' : `${total.toLocaleString()} item${total !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="cat-grid">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="cat-empty">
            <div className="cat-empty-icon">
              <Package size={44} strokeWidth={1.5} />
            </div>
            <h3>No listings found</h3>
            <p>Try a different subcategory, campus, or search term.</p>
            {hasFilters && (
              <button className="cat-empty-reset" onClick={clearAllFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="cat-grid">
            {products.map((p, i) => <ProductCard key={p._id || i} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={loading ? 1 : totalPages} onPageChange={handlePageChange} />
      </main>
    </div>
  );
}