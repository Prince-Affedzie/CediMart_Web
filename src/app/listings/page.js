'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAllProducts, getProductsByCategory } from '@/apis/productApi';
import { CATEGORIES, SUBCATEGORIES } from '@/data/data';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest'          },
  { value: 'popular',    label: 'Most Popular'    },
  { value: 'price-asc',  label: 'Price: Low → High'},
  { value: 'price-desc', label: 'Price: High → Low'},
];

const CAMPUS_OPTIONS = [
  { value: '', label: 'All Campuses' },
  { value: 'UG',     label: 'University of Ghana' },
  { value: 'KNUST',  label: 'KNUST'               },
  { value: 'UCC',    label: 'UCC'                 },
  { value: 'UPSA',   label: 'UPSA'                },
  { value: 'GIMPA',  label: 'GIMPA'               },
  { value: 'ASHESI', label: 'Ashesi'              },
  { value: 'UEW',    label: 'UEW'                 },
  { value: 'ATU',    label: 'ATU'                 },
];

// ─── Design tokens (consistent with the rest of CediMart) ────────────────────
const C = {
  void:       '#09090F',
  surf:       '#13131E',
  elev:       '#1C1C2E',
  border:     '#27273A',
  indigo:     '#6366F1',
  indigoL:    '#818CF8',
  indigoDim:  'rgba(99,102,241,0.10)',
  amber:      '#F59E0B',
  amberDim:   'rgba(245,158,11,0.10)',
  coral:      '#F43F5E',
  white:      '#F1F0FF',
  off:        '#A8A8B8',
  muted:      '#52525B',
};

// Categories to actually render in the sidebar (drop the synthetic "all" entry —
// we already have a dedicated "All Products" row)
const SIDEBAR_CATEGORIES = CATEGORIES.filter(c => c.id !== 'all');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p == null ? '—'
  : `GH₵\u00A0${Number(p).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return <div className="lp-sk-card"><div className="lp-sk-img" /><div className="lp-sk-body"><div className="lp-sk-line" style={{ width: '55%' }} /><div className="lp-sk-line" style={{ width: '85%' }} /><div className="lp-sk-line" style={{ width: '40%', height: 18 }} /></div></div>;
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const img = product.images?.[0] || product.image;
  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const pct = isOnSale
    ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100)
    : null;

  return (
    <Link href={`/product/${product._id}`} className="lp-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="lp-card-img-wrap">
        {img
          ? <img src={img} alt={product.name} className="lp-card-img" onError={e => { e.target.src = 'https://placehold.co/400x300/1C1C2E/52525B?text=No+Image'; }} />
          : <div className="lp-card-img-ph">📦</div>
        }
        {isOnSale && <span className="lp-badge lp-badge-sale">-{pct}%</span>}
        {product.negotiable && <span className="lp-badge lp-badge-nego">Nego.</span>}
      </div>
      <div className="lp-card-body">
        {product.campus && <span className="lp-card-campus">{product.campus}</span>}
        <p className="lp-card-name">{product.name}</p>
        <div className="lp-card-foot">
          <div>
            {isOnSale && <s className="lp-original">{fmtPrice(product.discountInfo.originalPrice)}</s>}
            <span className="lp-price" style={{ color: isOnSale ? C.coral : C.amber }}>{fmtPrice(product.price)}</span>
          </div>
          <span className="lp-view">View →</span>
        </div>
      </div>
    </Link>
  );
}

// ─── THE SIDEBAR ──────────────────────────────────────────────────────────────
// `sticky=true`  → desktop rail: position:sticky, own scroll, border-right
// `sticky=false` → used inside the mobile drawer: static, no inner scroll
//   (the drawer panel itself scrolls)
function Sidebar({ activeCategory, activeSub, onCategory, onSub, sticky = true }) {
  const [openKeys, setOpenKeys] = useState(() => {
    const initial = {};
    if (activeCategory) initial[activeCategory] = true;
    return initial;
  });

  useEffect(() => {
    if (activeCategory) {
      setOpenKeys(prev => ({ ...prev, [activeCategory]: true }));
    }
  }, [activeCategory]);

  const toggleOpen = (key) => {
    setOpenKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCategoryClick = (cat) => {
    if (cat.id === activeCategory) {
      onCategory('');
      onSub('');
    } else {
      onCategory(cat.id);
      onSub('');
      setOpenKeys(prev => ({ ...prev, [cat.id]: true }));
    }
  };

  const handleSubClick = (e, catId, subLabel) => {
    e.stopPropagation();
    onCategory(catId);
    onSub(activeSub === subLabel ? '' : subLabel);
  };

  return (
    <aside className={`lp-sidebar${sticky ? '' : ' lp-sidebar-static'}`}>
      {/* "All Products" row */}
      <button
        className={`lp-cat-row lp-all-row${!activeCategory ? ' lp-cat-active' : ''}`}
        onClick={() => { onCategory(''); onSub(''); }}
      >
        <span className="lp-cat-icon">🛒</span>
        <span className="lp-cat-label">All Products</span>
      </button>

      <div className="lp-sidebar-divider" />

      <p className="lp-sidebar-section-label">Shop by Category</p>

      {SIDEBAR_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const isOpen   = !!openKeys[cat.id];
        const subs     = SUBCATEGORIES[cat.id] || [];

        return (
          <div key={cat.id} className="lp-cat-group">
            {/* Category header row */}
            <button
              className={`lp-cat-row${isActive ? ' lp-cat-active' : ''}`}
              onClick={() => {
                handleCategoryClick(cat);
                if (subs.length) toggleOpen(cat.id);
              }}
            >
              <span className="lp-cat-icon">{cat.emoji}</span>
              <span className="lp-cat-label">{cat.label}</span>
              {subs.length > 0 && (
                <span
                  className="lp-cat-chevron"
                  style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  onClick={(e) => { e.stopPropagation(); toggleOpen(cat.id); }}
                >
                  ›
                </span>
              )}
            </button>

            {/* Subcategory list — inline expand, NO extra scroll */}
            {isOpen && subs.length > 0 && (
              <div className="lp-sub-list">
                {subs.map((sub) => {
                  const subActive = isActive && activeSub === sub.label;
                  return (
                    <button
                      key={sub.id}
                      className={`lp-sub-row${subActive ? ' lp-sub-active' : ''}`}
                      onClick={(e) => handleSubClick(e, cat.id, sub.label)}
                    >
                      {subActive && <span className="lp-sub-dot" />}
                      <span className="lp-sub-label">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);

  // Filters
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSub,      setActiveSub]      = useState('');
  const [campus,         setCampus]         = useState('');
  const [sort,           setSort]           = useState('newest');
  const [page,           setPage]           = useState(1);
  const [search,         setSearch]         = useState('');
  const [searchInput,    setSearchInput]    = useState('');

  // Mobile filter drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sort };
      if (activeSub)  params.subcategory = activeSub;
      if (campus)     params.campus      = campus;
      if (search)     params.search      = search;

      let res;
      if (activeCategory) {
        res = await getProductsByCategory(activeCategory, params);
      } else {
        res = await getAllProducts(params);
      }

      const data     = res?.data?.data        || res?.data?.products || res?.data || [];
      const pgData   = res?.data?.pagination  || {};
      const tot      = res?.data?.total ?? (Array.isArray(data) ? data.length : 0);

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

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [activeCategory, activeSub, campus, sort, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveSub('');
    setPage(1);
  };

  const handleSubChange = (sub) => {
    setActiveSub(sub);
    setPage(1);
  };

  // Breadcrumb
  const activeCatObj = SIDEBAR_CATEGORIES.find(c => c.id === activeCategory);
  const crumbs = [
    { label: 'Home',     href: '/'          },
    { label: 'Listings', href: '/listings'  },
    ...(activeCatObj ? [{ label: activeCatObj.label }] : []),
    ...(activeSub     ? [{ label: activeSub }]          : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: ${C.void};
          color: ${C.white};
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          overflow-x: hidden;
        }
        ::selection { background: ${C.indigoDim}; color: ${C.indigoL}; }

        /* ── Keyframes ── */
        @keyframes shimmer {
          0%   { background-position: -400% center; }
          100% { background-position:  400% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0);      }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Layout shell ── */
        .lp-page    { min-height: 100vh; }

        /* ══════════════════════════════════════════════
           TOP BAR — Jumia-style: brand · centered search · utilities
        ══════════════════════════════════════════════ */
        .lp-topbar {
          background: ${C.surf};
          border-bottom: 1px solid ${C.border};
          box-shadow: 0 2px 12px rgba(0,0,0,.25);
          padding: 12px clamp(16px, 4vw, 60px);
          display: flex;
          align-items: center;
          gap: 14px;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .lp-brand {
          font-size: 19px;
          font-weight: 900;
          letter-spacing: -.5px;
          color: ${C.white};
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .lp-brand span { color: ${C.amber}; }

        .lp-mobile-filter-btn {
          display: none;
          align-items: center;
          gap: 6px;
          background: ${C.elev};
          border: 1.5px solid ${C.border};
          border-radius: 10px;
          padding: 10px 13px;
          color: ${C.white};
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .lp-mobile-filter-btn:hover { border-color: ${C.indigo}; }

        .lp-search-wrap {
          flex: 1;
          display: flex;
          justify-content: center;
          min-width: 0;
        }
        .lp-search-form {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 580px;
          background: ${C.elev};
          border: 1.5px solid ${C.border};
          border-radius: 24px;
          overflow: hidden;
          transition: border-color .2s, box-shadow .2s;
        }
        .lp-search-form:focus-within {
          border-color: ${C.indigo};
          box-shadow: 0 0 0 3px ${C.indigoDim};
        }
        .lp-search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          padding: 11px 18px;
          font-size: 14px;
          color: ${C.white};
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-width: 0;
        }
        .lp-search-input::placeholder { color: ${C.muted}; }
        .lp-search-btn {
          background: ${C.indigo};
          border: none;
          cursor: pointer;
          padding: 11px 20px;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          transition: background .2s;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .lp-search-btn:hover { background: ${C.indigoL}; }

        .lp-topbar-utils {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .lp-select {
          background: ${C.elev};
          border: 1.5px solid ${C.border};
          border-radius: 10px;
          color: ${C.white};
          font-size: 13px;
          font-weight: 600;
          padding: 10px 14px;
          cursor: pointer;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color .2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A8A8B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 34px;
          min-width: 140px;
        }
        .lp-select:hover,
        .lp-select:focus { border-color: ${C.indigo}; }
        .lp-select option { background: ${C.surf}; }

        .lp-total-badge {
          font-size: 12px;
          font-weight: 600;
          color: ${C.muted};
          white-space: nowrap;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Body: sidebar + grid ── */
        .lp-body {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 0;
          max-width: 1440px;
          margin: 0 auto;
          align-items: start;
        }
        @media (max-width: 900px) {
          .lp-body { grid-template-columns: 1fr; }
          .lp-sidebar:not(.lp-sidebar-static) { display: none; }
          .lp-mobile-filter-btn { display: flex; }
          .lp-topbar-utils .lp-select,
          .lp-topbar-utils .lp-total-badge { display: none; }
        }

        /* ════════════════════════════════════════════
           THE SIDEBAR (desktop rail)
        ════════════════════════════════════════════ */
        .lp-sidebar {
          position: sticky;
          top: 62px;
          height: calc(100vh - 62px);
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          padding: 20px 0 40px;
          border-right: 1px solid ${C.border};
          background: ${C.void};
          scrollbar-width: thin;
          scrollbar-color: ${C.border} transparent;
        }
        .lp-sidebar::-webkit-scrollbar       { width: 3px; }
        .lp-sidebar::-webkit-scrollbar-track { background: transparent; }
        .lp-sidebar::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }

        /* Static variant used inside the mobile drawer — no sticky/scroll of its own */
        .lp-sidebar-static {
          position: static;
          height: auto;
          overflow: visible;
          border-right: none;
          padding: 4px 0 0;
        }

        .lp-sidebar-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: ${C.muted};
          padding: 0 20px;
          margin-bottom: 6px;
          font-family: 'JetBrains Mono', monospace;
        }
        .lp-sidebar-divider {
          height: 1px;
          background: ${C.border};
          margin: 10px 20px 14px;
        }

        .lp-cat-group { position: relative; }

        .lp-cat-row,
        .lp-all-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 20px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: ${C.off};
          position: relative;
          transition: color .18s, background .18s;
          border-left: 3px solid transparent;
          line-height: 1.35;
        }
        .lp-cat-row:hover,
        .lp-all-row:hover {
          color: ${C.white};
          background: rgba(255,255,255,.03);
        }

        .lp-cat-active {
          color: ${C.white} !important;
          font-weight: 700;
          border-left-color: ${C.indigo} !important;
          background: ${C.indigoDim} !important;
        }

        .lp-cat-icon  { font-size: 15px; flex-shrink: 0; width: 20px; text-align: center; }
        .lp-cat-label { flex: 1; }

        .lp-cat-chevron {
          font-size: 18px;
          color: ${C.muted};
          line-height: 1;
          transition: transform .22s cubic-bezier(.4,0,.2,1);
          flex-shrink: 0;
          padding: 0 4px;
        }
        .lp-cat-row:hover .lp-cat-chevron { color: ${C.off}; }

        .lp-sub-list {
          padding: 2px 0 6px 49px;
          display: flex;
          flex-direction: column;
          gap: 0;
          animation: fadeUp .18s ease forwards;
        }

        .lp-sub-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 20px 7px 0;
          background: none;
          border: none;
          border-left: 3px solid transparent;
          cursor: pointer;
          text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 400;
          color: ${C.muted};
          transition: color .18s;
          line-height: 1.3;
        }
        .lp-sub-row:hover { color: ${C.white}; }

        .lp-sub-active {
          color: ${C.indigoL} !important;
          font-weight: 600;
        }
        .lp-sub-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: ${C.indigo};
          flex-shrink: 0;
        }
        .lp-sub-label { flex: 1; }

        /* ════════════════════════════════════════════
           MOBILE FILTER DRAWER
        ════════════════════════════════════════════ */
        .lp-drawer-overlay {
          display: none;
        }
        @media (max-width: 900px) {
          .lp-drawer-overlay.open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.55);
            z-index: 200;
            animation: fadeIn .18s ease;
          }
        }
        .lp-drawer-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(84vw, 320px);
          background: ${C.void};
          z-index: 201;
          display: flex;
          flex-direction: column;
          animation: slideIn .22s cubic-bezier(.22,1,.36,1);
          box-shadow: 12px 0 40px rgba(0,0,0,.5);
        }
        .lp-drawer-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid ${C.border};
          flex-shrink: 0;
        }
        .lp-drawer-title { font-size: 15px; font-weight: 800; color: ${C.white}; }
        .lp-drawer-close {
          background: ${C.elev};
          border: 1px solid ${C.border};
          color: ${C.off};
          width: 30px; height: 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 10px;
        }
        .lp-drawer-section {
          padding: 16px 20px 4px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .lp-drawer-section .lp-select { width: 100%; min-width: 0; }
        .lp-drawer-foot {
          padding: 14px 18px;
          border-top: 1px solid ${C.border};
          flex-shrink: 0;
        }
        .lp-drawer-apply-btn {
          width: 100%;
          background: ${C.indigo};
          border: none;
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          padding: 13px;
          border-radius: 10px;
          cursor: pointer;
        }
        .lp-drawer-apply-btn:hover { background: ${C.indigoL}; }

        /* ── Main content area ── */
        .lp-main {
          padding: 20px clamp(16px, 3vw, 36px) 60px;
          min-height: calc(100vh - 62px);
        }

        .lp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: ${C.muted};
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .lp-breadcrumb a  { color: ${C.muted}; text-decoration: none; transition: color .15s; }
        .lp-breadcrumb a:hover { color: ${C.indigoL}; }
        .lp-breadcrumb-sep { color: ${C.border}; font-size: 14px; }
        .lp-breadcrumb-cur { color: ${C.off}; font-weight: 600; }

        .lp-active-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .lp-filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: ${C.indigoL};
          background: ${C.indigoDim};
          border: 1px solid ${C.indigo}40;
          border-radius: 20px;
          padding: 5px 12px;
        }
        .lp-filter-pill-x {
          background: none;
          border: none;
          cursor: pointer;
          color: ${C.indigoL};
          font-size: 14px;
          line-height: 1;
          padding: 0;
          transition: color .15s;
        }
        .lp-filter-pill-x:hover { color: ${C.coral}; }

        .lp-section-title {
          font-size: 18px;
          font-weight: 800;
          color: ${C.white};
          margin-bottom: 6px;
          letter-spacing: -.3px;
        }
        .lp-section-sub {
          font-size: 12px;
          color: ${C.muted};
          margin-bottom: 22px;
          font-family: 'JetBrains Mono', monospace;
        }

        .lp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .lp-card {
          display: block;
          background: ${C.surf};
          border: 1px solid ${C.border};
          border-radius: 16px;
          overflow: hidden;
          transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s, border-color .2s;
          animation: fadeUp .4s ease both;
        }
        .lp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,.45);
          border-color: ${C.indigo}50;
        }
        .lp-card-img-wrap {
          position: relative;
          height: 170px;
          background: ${C.elev};
          overflow: hidden;
        }
        .lp-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .35s ease;
        }
        .lp-card:hover .lp-card-img { transform: scale(1.05); }
        .lp-card-img-ph {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 38px; opacity: .35;
        }
        .lp-badge {
          position: absolute;
          font-size: 9.5px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 7px;
          letter-spacing: .02em;
        }
        .lp-badge-sale  { top: 8px; right: 8px; background: ${C.coral};    color: #fff; }
        .lp-badge-nego  { bottom: 8px; left: 8px; background: ${C.amberDim}; color: ${C.amber}; border: 1px solid ${C.amber}30; }
        .lp-card-body   { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 5px; }
        .lp-card-campus { font-size: 9.5px; font-weight: 700; color: ${C.indigoL}; background: ${C.indigoDim}; border-radius: 7px; padding: 2px 7px; display: inline-block; width: fit-content; font-family: 'JetBrains Mono', monospace; }
        .lp-card-name   { font-size: 13.5px; font-weight: 700; color: ${C.white}; line-height: 1.38; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .lp-card-foot   { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 4px; }
        .lp-original    { font-size: 10px; color: ${C.muted}; text-decoration: line-through; display: block; margin-bottom: 1px; font-family: 'JetBrains Mono', monospace; }
        .lp-price       { font-size: 16px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
        .lp-view        { font-size: 11.5px; font-weight: 700; background: ${C.indigoDim}; color: ${C.indigoL}; border: 1px solid ${C.indigo}30; padding: 5px 11px; border-radius: 8px; white-space: nowrap; transition: all .18s; }
        .lp-card:hover .lp-view { background: ${C.indigo}; color: #fff; border-color: transparent; }

        .lp-sk-card {
          background: linear-gradient(90deg, ${C.surf} 25%, ${C.elev} 50%, ${C.surf} 75%);
          background-size: 400% 100%;
          animation: shimmer 1.6s ease-in-out infinite;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid ${C.border};
        }
        .lp-sk-img  { height: 170px; background: ${C.elev}; }
        .lp-sk-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
        .lp-sk-line { height: 12px; border-radius: 6px; background: ${C.elev}; }

        .lp-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; text-align: center;
          color: ${C.muted};
        }
        .lp-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: .4; }
        .lp-empty h3   { font-size: 17px; font-weight: 700; color: ${C.off}; margin-bottom: 6px; }
        .lp-empty p    { font-size: 14px; line-height: 1.6; }

        .lp-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 40px;
          flex-wrap: wrap;
        }
        .lp-pg-btn {
          background: ${C.surf};
          border: 1px solid ${C.border};
          color: ${C.off};
          font-size: 13px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 9px;
          cursor: pointer;
          transition: all .18s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-width: 38px;
        }
        .lp-pg-btn:hover:not(:disabled) { border-color: ${C.indigo}; color: ${C.indigoL}; }
        .lp-pg-btn.active { background: ${C.indigo}; border-color: ${C.indigo}; color: #fff; }
        .lp-pg-btn:disabled { opacity: .35; cursor: not-allowed; }
        .lp-pg-dots { color: ${C.muted}; font-size: 14px; padding: 0 4px; }

        @media (max-width: 640px) {
          .lp-brand    { display: none; }
          .lp-topbar   { gap: 8px; }
          .lp-grid     { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>

      <div className="lp-page">

        {/* ── Top bar ── */}
        <div className="lp-topbar">
          

          <button
            className="lp-mobile-filter-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open filters"
          >
            ☰ Filters
          </button>

          <div className="lp-search-wrap">
            <form className="lp-search-form" onSubmit={handleSearch}>
              <input
                className="lp-search-input"
                placeholder="Search listings…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button type="submit" className="lp-search-btn" aria-label="Search">🔍</button>
            </form>
          </div>

          <div className="lp-topbar-utils">
            <select
              className="lp-select"
              value={campus}
              onChange={e => { setCampus(e.target.value); setPage(1); }}
              aria-label="Filter by campus"
            >
              {CAMPUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              className="lp-select"
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {!loading && (
              <span className="lp-total-badge">
                {total.toLocaleString()} listing{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* ── Mobile filter drawer ── */}
        <div className={`lp-drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
        {drawerOpen && (
          <div className="lp-drawer-panel">
            <div className="lp-drawer-head">
              <span className="lp-drawer-title">Filters</span>
              <button className="lp-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close filters">✕</button>
            </div>
            <div className="lp-drawer-body">
              <div className="lp-drawer-section">
                <select
                  className="lp-select"
                  value={campus}
                  onChange={e => { setCampus(e.target.value); setPage(1); }}
                  aria-label="Filter by campus"
                >
                  {CAMPUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <select
                  className="lp-select"
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  aria-label="Sort by"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="lp-sidebar-divider" />
              <Sidebar
                sticky={false}
                activeCategory={activeCategory}
                activeSub={activeSub}
                onCategory={handleCategoryChange}
                onSub={handleSubChange}
              />
            </div>
            <div className="lp-drawer-foot">
              <button className="lp-drawer-apply-btn" onClick={() => setDrawerOpen(false)}>
                Show {total.toLocaleString()} result{total !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* ── Body: sidebar + main ── */}
        <div className="lp-body">

          {/* Desktop sidebar */}
          <Sidebar
            activeCategory={activeCategory}
            activeSub={activeSub}
            onCategory={handleCategoryChange}
            onSub={handleSubChange}
          />

          {/* Main content */}
          <main className="lp-main">

            {/* Breadcrumb */}
            <nav className="lp-breadcrumb" aria-label="Breadcrumb">
              {crumbs.map((crumb, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i > 0 && <span className="lp-breadcrumb-sep">›</span>}
                  {crumb.href
                    ? <Link href={crumb.href}>{crumb.label}</Link>
                    : <span className="lp-breadcrumb-cur">{crumb.label}</span>
                  }
                </span>
              ))}
            </nav>

            {/* Active filter pills */}
            {(activeCategory || activeSub || campus || search) && (
              <div className="lp-active-filters">
                {activeCategory && (
                  <span className="lp-filter-pill">
                    {activeCatObj?.emoji} {activeCatObj?.label}
                    <button className="lp-filter-pill-x" onClick={() => { handleCategoryChange(''); }} aria-label="Remove category filter">×</button>
                  </span>
                )}
                {activeSub && (
                  <span className="lp-filter-pill">
                    {activeSub}
                    <button className="lp-filter-pill-x" onClick={() => handleSubChange('')} aria-label="Remove subcategory filter">×</button>
                  </span>
                )}
                {campus && (
                  <span className="lp-filter-pill">
                    📍 {CAMPUS_OPTIONS.find(c => c.value === campus)?.label}
                    <button className="lp-filter-pill-x" onClick={() => { setCampus(''); setPage(1); }} aria-label="Remove campus filter">×</button>
                  </span>
                )}
                {search && (
                  <span className="lp-filter-pill">
                    🔍 "{search}"
                    <button className="lp-filter-pill-x" onClick={() => { setSearch(''); setSearchInput(''); }} aria-label="Remove search">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="lp-section-title">
              {activeSub
                ? activeSub
                : activeCatObj
                  ? activeCatObj.label
                  : search
                    ? `Results for "${search}"`
                    : 'All Listings'}
            </h1>
            <p className="lp-section-sub">
              {loading ? 'Loading…' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''}${campus ? ` · ${CAMPUS_OPTIONS.find(c => c.value === campus)?.label}` : ''}`}
            </p>

            {/* Grid */}
            {loading ? (
              <div className="lp-grid">
                {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="lp-empty">
                <div className="lp-empty-icon">📭</div>
                <h3>No listings found</h3>
                <p>Try a different category, campus, or search term.</p>
              </div>
            ) : (
              <div className="lp-grid">
                {products.map((p, i) => (
                  <ProductCard key={p._id || i} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="lp-pagination">
                <button
                  className="lp-pg-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                  .reduce((acc, n, i, arr) => {
                    if (i > 0 && n - arr[i - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === '…'
                      ? <span key={`dot-${i}`} className="lp-pg-dots">…</span>
                      : <button
                          key={item}
                          className={`lp-pg-btn${page === item ? ' active' : ''}`}
                          onClick={() => setPage(item)}
                        >
                          {item}
                        </button>
                  )
                }

                <button
                  className="lp-pg-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}