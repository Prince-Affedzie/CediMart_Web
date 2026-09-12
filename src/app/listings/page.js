// src/app/listings/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, X, MapPin, ArrowUpDown, Menu, ChevronDown, Package } from 'lucide-react';
import { getAllProducts, getProductsByCategory } from '@/apis/productApi';

import { CATEGORIES } from '@/constants/listings/categories';
import { SORT_OPTIONS, CAMPUS_OPTIONS } from '@/constants/listings/options';

import Hero from '@/components/Listings/Hero';
import Sidebar from '@/components/Listings/Sidebar';
import MobileFilterSheet from '@/components/Listings/MobileFilterSheet';
import ProductCard from '@/components/Listings/ProductCard';
import SkeletonCard from '@/components/Listings/SkeletonCard';
import Pagination from '@/components/Listings/Pagination';

import './listings.css';

export default function ListingsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [activeCategory, setActiveCategory] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [campus, setCampus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sort };
      if (activeSub) params.subcategory = activeSub;
      if (campus) params.campus = campus;
      if (search) params.search = search;
      const res = activeCategory ? await getProductsByCategory(activeCategory, params) : await getAllProducts(params);
      const data = res?.data?.data || res?.data?.products || res?.data || [];
      const pgData = res?.data?.pagination || {};
      const tot = res?.data?.total ?? (Array.isArray(data) ? data.length : 0);
      setProducts(Array.isArray(data) ? data : []);
      setTotalPages(pgData.totalPages ?? Math.ceil(tot / 20) ?? 1);
      setTotal(tot);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSub, campus, sort, page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [activeCategory, activeSub, campus, sort, search]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };
  const handleCatChange = (cat) => { setActiveCategory(cat); setActiveSub(''); setPage(1); };
  const handleSubChange = (sub) => { setActiveSub(sub); setPage(1); };
  const clearAllFilters = () => { setActiveCategory(''); setActiveSub(''); setCampus(''); setSearch(''); setSearchInput(''); setPage(1); };

  const activeCatObj = CATEGORIES.find((c) => c.key === activeCategory);
  const ActiveCatIcon = activeCatObj?.icon;
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Listings', href: '/listings' },
    ...(activeCatObj ? [{ label: activeCatObj.label }] : []),
    ...(activeSub ? [{ label: activeSub }] : []),
  ];

  const hasFilters = !!(activeCategory || activeSub || campus || search);
  const activeFilterCount = [activeCategory, activeSub, campus, search].filter(Boolean).length;

  return (
    <div className="lp-page">
      <Hero onPickCategory={handleCatChange} />

      <div className="lp-shell">
        <Sidebar activeCategory={activeCategory} activeSub={activeSub} onCategory={handleCatChange} onSub={handleSubChange} />

        <div className="lp-right">
          <div className="lp-topbar">
            <div className="lp-topbar-row">
              <button className="lp-hamburger" onClick={() => setSheetOpen(true)} aria-label="Open category filter" aria-expanded={sheetOpen}>
                <Menu size={19} strokeWidth={2} />
                <span className="lp-hamburger-label">Filters</span>
                {activeFilterCount > 0 && <span className="lp-hamburger-badge">{activeFilterCount}</span>}
              </button>

              <form className="lp-search-form" onSubmit={handleSearch}>
                <span className="lp-search-icon-wrap"><Search size={16} strokeWidth={2} /></span>
                <input
                  className="lp-search-input"
                  placeholder="Search for laptops, textbooks, sneakers…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label="Search listings"
                />
                {searchInput && (
                  <button type="button" className="lp-search-clear" onClick={() => { setSearchInput(''); setSearch(''); }} aria-label="Clear search">
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
                <button type="submit" className="lp-search-btn">Search</button>
              </form>
            </div>

            <div className="lp-topbar-row lp-topbar-row-filters">
              <div className="lp-select-wrap">
                <span className="lp-select-icon"><MapPin size={13} strokeWidth={2} /></span>
                <select className="lp-select" value={campus} onChange={(e) => { setCampus(e.target.value); setPage(1); }} aria-label="Filter by campus">
                  {CAMPUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className="lp-select-chevron"><ChevronDown size={13} strokeWidth={2} /></span>
              </div>

              <div className="lp-select-wrap">
                <span className="lp-select-icon"><ArrowUpDown size={13} strokeWidth={2} /></span>
                <select className="lp-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} aria-label="Sort by">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className="lp-select-chevron"><ChevronDown size={13} strokeWidth={2} /></span>
              </div>

              <span className="lp-topbar-divider" />
              {!loading && <span className="lp-total-badge">{total.toLocaleString()} listing{total !== 1 ? 's' : ''}</span>}
            </div>
          </div>

        <main className="lp-main">
          <div id="lp-grid-anchor" style={{ position: 'relative', top: -80 }} />

          <nav className="lp-breadcrumb" aria-label="Breadcrumb">
            {crumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span className="lp-breadcrumb-sep"><ChevronRight size={12} strokeWidth={2} /></span>}
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span className="lp-breadcrumb-cur">{crumb.label}</span>}
              </span>
            ))}
          </nav>

          <div className="lp-header-row">
            <div>
              <h1 className="lp-section-title">
                {activeSub ? activeSub : activeCatObj ? activeCatObj.label : search ? `Results for "${search}"` : 'All Listings'}
              </h1>
              <p className="lp-section-sub">
                {loading ? 'Loading…' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''} found${campus ? ` in ${CAMPUS_OPTIONS.find((c) => c.value === campus)?.label}` : ''}`}
              </p>
            </div>
          </div>

          {hasFilters && (
            <div className="lp-active-filters">
              {activeCategory && (
                <span className="lp-filter-pill">
                  {ActiveCatIcon && <ActiveCatIcon size={12} strokeWidth={2.5} />} {activeCatObj?.label}
                  <button className="lp-filter-pill-x" onClick={() => handleCatChange('')} aria-label="Remove category filter"><X size={13} strokeWidth={2.5} /></button>
                </span>
              )}
              {activeSub && (
                <span className="lp-filter-pill">
                  {activeSub}
                  <button className="lp-filter-pill-x" onClick={() => handleSubChange('')} aria-label="Remove subcategory filter"><X size={13} strokeWidth={2.5} /></button>
                </span>
              )}
              {campus && (
                <span className="lp-filter-pill">
                  <MapPin size={11} strokeWidth={2} /> {CAMPUS_OPTIONS.find((c) => c.value === campus)?.label}
                  <button className="lp-filter-pill-x" onClick={() => { setCampus(''); setPage(1); }} aria-label="Remove campus filter"><X size={13} strokeWidth={2.5} /></button>
                </span>
              )}
              {search && (
                <span className="lp-filter-pill">
                  <Search size={11} strokeWidth={2} /> "{search}"
                  <button className="lp-filter-pill-x" onClick={() => { setSearch(''); setSearchInput(''); }} aria-label="Clear search"><X size={13} strokeWidth={2.5} /></button>
                </span>
              )}
              <button className="lp-clear-all" onClick={clearAllFilters}>Clear all</button>
            </div>
          )}

          {loading ? (
            <div className="lp-grid">{[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : products.length === 0 ? (
            <div className="lp-empty">
              <div className="lp-empty-icon"><Package size={44} strokeWidth={1.5} /></div>
              <h3>No listings found</h3>
              <p>Try a different category, campus, or search term.</p>
              {hasFilters && <button className="lp-empty-reset" onClick={clearAllFilters}>Clear filters</button>}
            </div>
          ) : (
            <div className="lp-grid">{products.map((p, i) => <ProductCard key={p._id || i} product={p} />)}</div>
          )}

          <Pagination page={page} totalPages={loading ? 1 : totalPages} onPageChange={setPage} />
          </main>
        </div>
      </div>

      <MobileFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeCategory={activeCategory}
        activeSub={activeSub}
        onCategory={handleCatChange}
        onSub={handleSubChange}
      />
    </div>
  );
}