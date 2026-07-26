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

const HERO_SLIDES = [
  { id: '1', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1780782982/flyer13_1_fyp0xj.png', tag: '🎓  Campus Marketplace', title: 'Buy & Sell on\n Campus', subtitle: "Connect with students across Ghana's top universities", btnText: 'Start Shopping', overlayColor: 'rgba(10,20,60,0.50)', category: '' },
  { id: '2', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1780771354/flyer11_qkxwpv.jpg', tag: '💻  Electronics & Gadgets', title: 'Laptops, Phones\n& More', subtitle: 'Student-priced tech from trusted campus sellers', btnText: 'Browse Electronics', overlayColor: 'rgba(10,20,60,0.50)', category: 'electronics' },
  { id: '3', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1781101245/fashion_banner_ibwmaz.png', tag: '👗  Fashion & Style', title: 'Upgrade Your\nWardrobe', subtitle: 'Trendy outfits, accessories & vintage finds at great prices', btnText: 'Shop Fashion', overlayColor: 'rgba(10,20,60,0.50)', category: 'fashion' },
  { id: '4', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1781891792/food_nad_provisions_1_m6fvfn.png', tag: '🍽️  Food & Provisions', title: 'Stock Up on\nFood & Provisions', subtitle: 'Groceries, snacks, drinks and daily essentials delivered to your doorstep', btnText: 'Shop Food Items', overlayColor: 'rgba(10,20,60,0.50)', category: 'food and drinks' },
];

// ─── Teal + Coral Design Tokens ────────────────────────────────────────────────
const C = {
  void:       '#F8FAFC',
  surf:       '#FFFFFF',
  elev:       '#F1F5F9',
  border:     '#E2E8F0',
  brand:      '#0D9488',
  brandL:     '#14B8A6',
  brandD:     '#0F766E',
  brandDim:   'rgba(13,148,136,0.08)',
  accent:     '#F97316',
  accentDim:  'rgba(249,115,22,0.08)',
  coral:      '#DC2626',
  coralDim:   'rgba(220,38,38,0.08)',
  white:      '#0F172A',
  off:        '#475569',
  muted:      '#94A3B8',
};

const SIDEBAR_CATEGORIES = CATEGORIES.filter(c => c.id !== 'all');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p == null ? '—' : `GH₵\u00A0${Number(p).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return <div className="lp-sk-card"><div className="lp-sk-img" /><div className="lp-sk-body"><div className="lp-sk-line" style={{ width: '85%' }} /><div className="lp-sk-line" style={{ width: '55%' }} /><div className="lp-sk-line" style={{ width: '40%', height: 16 }} /></div></div>;
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const img = product.images?.[0] || product.image;
  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const pct = isOnSale ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100) : null;
  const rating = product.rating ?? null;
  const reviewCount = product.reviewCount ?? product.reviews?.length ?? null;

  return (
    <Link href={`/product/${product._id}`} className="lp-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="lp-card-img-wrap">
        {img ? <img src={img} alt={product.name} className="lp-card-img" onError={e => { e.target.src = 'https://placehold.co/400x400/F1F5F9/94A3B8?text=No+Image'; }} /> : <div className="lp-card-img-ph">📦</div>}
        {isOnSale && <span className="lp-badge-sale">-{pct}%</span>}
        <button type="button" className="lp-wishlist-btn" aria-label="Save to wishlist" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>♡</button>
      </div>
      <div className="lp-card-body">
        <p className="lp-card-name">{product.name}</p>
        {rating != null && (
          <div className="lp-card-rating">
            <span className="lp-stars" aria-hidden="true">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
            {reviewCount != null && <span className="lp-rating-count">({reviewCount})</span>}
          </div>
        )}
        <div className="lp-card-price-row">
          <span className="lp-price">{fmtPrice(product.price)}</span>
          {isOnSale && <s className="lp-original">{fmtPrice(product.discountInfo.originalPrice)}</s>}
        </div>
        <div className="lp-card-tags">
          {product.campus && <span className="lp-tag lp-tag-campus">📍 {product.campus}</span>}
          {product.negotiable && <span className="lp-tag lp-tag-nego">Negotiable</span>}
        </div>
      </div>
    </Link>
  );
}

// ─── Sidebar (unchanged) ──────────────────────────────────────────────────────
function Sidebar({ activeCategory, activeSub, campus, onCategory, onSub, onClearAll, sticky = true }) {
  const [openKeys, setOpenKeys] = useState(() => { const initial = {}; if (activeCategory) initial[activeCategory] = true; return initial; });
  useEffect(() => { if (activeCategory) setOpenKeys(prev => ({ ...prev, [activeCategory]: true })); }, [activeCategory]);
  const toggleOpen = (key) => setOpenKeys(prev => ({ ...prev, [key]: !prev[key] }));
  const handleCategoryClick = (cat) => { if (cat.id === activeCategory) { onCategory(''); onSub(''); } else { onCategory(cat.id); onSub(''); setOpenKeys(prev => ({ ...prev, [cat.id]: true })); } };
  const handleSubClick = (e, catId, subLabel) => { e.stopPropagation(); onCategory(catId); onSub(activeSub === subLabel ? '' : subLabel); };
  const hasFilters = !!(activeCategory || activeSub || campus);

  return (
    <aside className={`lp-sidebar${sticky ? '' : ' lp-sidebar-static'}`}>
      <div className="lp-sidebar-head">
        <p className="lp-sidebar-section-label">Category</p>
        {hasFilters && <button type="button" className="lp-clear-all" onClick={onClearAll}>Clear all</button>}
      </div>
      <button className={`lp-cat-row lp-all-row${!activeCategory ? ' lp-cat-active' : ''}`} onClick={() => { onCategory(''); onSub(''); }}>
        <span className="lp-checkbox" data-checked={!activeCategory} /><span className="lp-cat-label">All Products</span>
      </button>
      {SIDEBAR_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const isOpen = !!openKeys[cat.id];
        const subs = SUBCATEGORIES[cat.id] || [];
        return (
          <div key={cat.id} className="lp-cat-group">
            <button className={`lp-cat-row${isActive ? ' lp-cat-active' : ''}`} onClick={() => { handleCategoryClick(cat); if (subs.length) toggleOpen(cat.id); }}>
              <span className="lp-checkbox" data-checked={isActive} /><span className="lp-cat-icon">{cat.emoji}</span><span className="lp-cat-label">{cat.label}</span>
              {subs.length > 0 && <span className="lp-cat-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} onClick={(e) => { e.stopPropagation(); toggleOpen(cat.id); }}>›</span>}
            </button>
            {isOpen && subs.length > 0 && (
              <div className="lp-sub-list">
                {subs.map((sub) => { const subActive = isActive && activeSub === sub.label; return (<button key={sub.id} className={`lp-sub-row${subActive ? ' lp-sub-active' : ''}`} onClick={(e) => handleSubClick(e, cat.id, sub.label)}><span className="lp-checkbox lp-checkbox-sm" data-checked={subActive} /><span className="lp-sub-label">{sub.label}</span></button>); })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

// ─── Hero with search card OVERLAPPING the bottom ──────────────────────────────
function Hero({ searchInput, setSearchInput, onSearch, campus, setCampus, onPickCategory }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => { if (paused) return; const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500); return () => clearInterval(t); }, [paused]);
  const goTo = (i) => setSlide(((i % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length);
  const active = HERO_SLIDES[slide];

  const scrollToGrid = () => { document.getElementById('lp-grid-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const handleCta = () => { const matched = SIDEBAR_CATEGORIES.find(c => c.id.toLowerCase().replace(/[^a-z]/g, '') === active.category.toLowerCase().replace(/[^a-z]/g, '')); onPickCategory(matched ? matched.id : ''); scrollToGrid(); };

  return (
    <section className="lp-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {HERO_SLIDES.map((s, i) => (
        <div key={s.id} className={`lp-hero-slide${i === slide ? ' active' : ''}`} style={{ backgroundImage: `url(${s.image})` }}>
          <div className="lp-hero-overlay" style={{ background: `linear-gradient(90deg, ${s.overlayColor} 20%, rgba(10,20,60,0.15) 75%)` }} />
          <div className="lp-hero-copy">
            <span className="lp-hero-tag">{s.tag}</span>
            <h1 className="lp-hero-title">{s.title}</h1>
            <p className="lp-hero-subtitle">{s.subtitle}</p>
            <button type="button" className="lp-hero-cta" onClick={handleCta}>{s.btnText} →</button>
          </div>
        </div>
      ))}

      <button type="button" className="lp-hero-arrow lp-hero-arrow-prev" aria-label="Previous slide" onClick={() => goTo(slide - 1)}>‹</button>
      <button type="button" className="lp-hero-arrow lp-hero-arrow-next" aria-label="Next slide" onClick={() => goTo(slide + 1)}>›</button>

      <div className="lp-hero-dots">
        {HERO_SLIDES.map((s, i) => (<button key={s.id} type="button" aria-label={`Go to slide ${i + 1}`} className={`lp-hero-dot${i === slide ? ' active' : ''}`} onClick={() => goTo(i)} />))}
      </div>

      {/* ── Search card — overlaps the hero bottom, very prominent ── */}
      <div className="lp-hero-searchcard">
        <form className="lp-hero-search-row" onSubmit={onSearch}>
          <span className="lp-hero-search-icon">🔍</span>
          <input className="lp-hero-search-input" placeholder="Search for laptops, textbooks, sneakers…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          <button type="submit" className="lp-hero-search-btn">Search</button>
        </form>
       
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => { document.body.style.overflow = drawerOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [drawerOpen]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30, sort };
      if (activeSub) params.subcategory = activeSub;
      if (campus) params.campus = campus;
      if (search) params.search = search;
      let res;
      if (activeCategory) { res = await getProductsByCategory(activeCategory, params); }
      else { res = await getAllProducts(params); }
      const data = res?.data?.data || res?.data?.products || res?.data || [];
      const pgData = res?.data?.pagination || {};
      const tot = res?.data?.total ?? (Array.isArray(data) ? data.length : 0);
      setProducts(Array.isArray(data) ? data : []);
      setTotalPages(pgData.totalPages ?? Math.ceil(tot / 24) ?? 1);
      setTotal(tot);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [activeCategory, activeSub, campus, sort, page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [activeCategory, activeSub, campus, sort, search]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };
  const handleCategoryChange = (cat) => { setActiveCategory(cat); setActiveSub(''); setPage(1); };
  const handleSubChange = (sub) => { setActiveSub(sub); setPage(1); };
  const handleClearAll = () => { setActiveCategory(''); setActiveSub(''); setCampus(''); setPage(1); };

  const activeCatObj = SIDEBAR_CATEGORIES.find(c => c.id === activeCategory);
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Listings', href: '/listings' },
    ...(activeCatObj ? [{ label: activeCatObj.label }] : []),
    ...(activeSub ? [{ label: activeSub }] : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.void}; color: ${C.white}; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; overflow-x: hidden; }
        ::selection { background: ${C.brandDim}; color: ${C.brand}; }

        @keyframes shimmer { 0%{background-position:-400% center} 100%{background-position:400% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .lp-page { min-height: 100vh; }

        /* ── Top bar ── */
        .lp-topbar {
          background: ${C.surf}; border-bottom: 1px solid ${C.border};
          padding: 10px clamp(12px,3vw,48px); display: flex; align-items: center; gap: 12px;
          position: sticky; top: 0; z-index: 50;
        }
        .lp-mobile-filter-btn {
          display: none; align-items: center; gap: 6px; background: ${C.elev};
          border: 1px solid ${C.border}; border-radius: 10px; padding: 9px 13px;
          color: ${C.white}; font-weight: 700; font-size: 13px; cursor: pointer;
          white-space: nowrap; flex-shrink: 0; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .lp-mobile-filter-btn:hover { border-color: ${C.brand}; }

        .lp-search-wrap { flex: 1; display: flex; justify-content: flex-start; min-width: 0; }
        .lp-search-form {
          display: flex; align-items: center; width: 100%; max-width: 640px;
          background: ${C.surf}; border: 2px solid ${C.elev}; border-radius: 12px;
          overflow: hidden; transition: border-color .15s;
        }
        .lp-search-form:focus-within { border-color: ${C.brand}; }
        .lp-search-input {
          flex: 1; background: none; border: none; outline: none; padding: 10px 14px;
          font-size: 14px; color: ${C.white}; font-family: 'Plus Jakarta Sans', sans-serif; min-width: 0;
        }
        .lp-search-input::placeholder { color: ${C.muted}; }
        .lp-search-btn {
          background: ${C.brand}; border: none; cursor: pointer; padding: 10px 18px;
          color: #fff; font-size: 15px; font-weight: 700; transition: background .15s;
          display: flex; align-items: center; flex-shrink: 0;
        }
        .lp-search-btn:hover { background: ${C.brandD}; }

        .lp-topbar-utils { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .lp-select {
          background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 10px;
          color: ${C.white}; font-size: 13px; font-weight: 600; padding: 9px 13px;
          cursor: pointer; outline: none; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color .15s; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 11px center;
          padding-right: 32px; min-width: 128px;
        }
        .lp-select:hover, .lp-select:focus { border-color: ${C.brand}; }
        .lp-select option { background: ${C.surf}; }
        .lp-total-badge { font-size: 12px; font-weight: 600; color: ${C.muted}; white-space: nowrap; }
        .lp-topbar-brand { flex: 1; font-size: 14px; font-weight: 800; color: ${C.white}; letter-spacing: -.2px; }
        @media (max-width: 900px) { .lp-topbar-brand { display: none; } }

        /* ── Hero ── */
        .lp-hero {
          position: relative; height: 400px; overflow: visible;
          background: ${C.surf}; margin-bottom: 80px;
        }
        .lp-hero-slide {
          position: absolute; inset: 0; background-size: cover; background-position: center;
          opacity: 0; transition: opacity .7s ease; display: flex; align-items: center;
          border-radius: 0 0 24px 24px; overflow: hidden;
        }
        .lp-hero-slide.active { opacity: 1; z-index: 1; }
        .lp-hero-overlay { position: absolute; inset: 0; }
        .lp-hero-copy { position: relative; z-index: 2; padding: 0 clamp(20px,6vw,72px); max-width: 620px; }
        .lp-hero-tag {
          display: inline-block; font-size: 12.5px; font-weight: 700; color: #fff;
          background: rgba(255,255,255,.16); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,.3); border-radius: 20px;
          padding: 5px 14px; margin-bottom: 14px;
        }
        .lp-hero-title {
          font-size: clamp(26px,4vw,42px); font-weight: 900; color: #fff; line-height: 1.12;
          white-space: pre-line; letter-spacing: -.5px; margin-bottom: 10px;
          text-shadow: 0 2px 16px rgba(0,0,0,.25);
        }
        .lp-hero-subtitle { font-size: 14.5px; color: rgba(255,255,255,.92); line-height: 1.5; margin-bottom: 20px; max-width: 440px; }
        .lp-hero-cta {
          background: ${C.accent}; color: #fff; border: none; font-size: 14px; font-weight: 800;
          padding: 12px 22px; border-radius: 10px; cursor: pointer;
          transition: transform .15s, background .15s;
        }
        .lp-hero-cta:hover { background: ${C.accent}; filter: brightness(1.1); transform: translateY(-1px); }

        .lp-hero-arrow {
          position: absolute; top: 42%; transform: translateY(-50%); z-index: 3;
          width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
          background: rgba(255,255,255,.25); color: #fff; font-size: 22px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s; backdrop-filter: blur(4px);
        }
        .lp-hero-arrow:hover { background: rgba(255,255,255,.45); }
        .lp-hero-arrow-prev { left: 16px; }
        .lp-hero-arrow-next { right: 16px; }
        @media (max-width: 640px) { .lp-hero-arrow { display: none; } }

        .lp-hero-dots { position: absolute; top: 16px; right: 20px; z-index: 3; display: flex; gap: 6px; }
        .lp-hero-dot { width: 7px; height: 7px; border-radius: 50%; border: none; background: rgba(255,255,255,.45); cursor: pointer; padding: 0; transition: background .2s, width .2s; }
        .lp-hero-dot.active { background: #fff; width: 20px; border-radius: 4px; }

        /* ── Search card — OVERLAPS hero bottom, very prominent ── */
        .lp-hero-searchcard {
          position: absolute; left: 50%; bottom: -40px; transform: translateX(-50%); z-index: 10;
          width: min(94%, 820px); background: ${C.surf}; border-radius: 28px;
          box-shadow: 0 12px 40px rgba(15,23,42,.12), 0 2px 8px rgba(15,23,42,.06);
          padding: 20px 22px; border: 1px solid ${C.border};
        }
        .lp-hero-search-row {
          display: flex; align-items: center; gap: 8px;
          background: ${C.void}; border: 2px solid ${C.border};
          border-radius: 14px; padding: 4px 4px 4px 16px;
          transition: border-color .2s, box-shadow .2s;
        }
        .lp-hero-search-row:focus-within {
          border-color: ${C.brand};
          box-shadow: 0 0 0 4px ${C.brandDim};
        }
        .lp-hero-search-icon { font-size: 18px; flex-shrink: 0; }
        .lp-hero-search-input {
          flex: 1; background: none; border: none; outline: none; padding: 14px 8px;
          font-size: 15px; color: ${C.white}; font-family: 'Plus Jakarta Sans', sans-serif; min-width: 0;
        }
        .lp-hero-search-input::placeholder { color: ${C.muted}; }
        .lp-hero-search-btn {
          background: ${C.brand}; border: none; color: #fff; font-weight: 800;
          font-size: 14px; padding: 13px 24px; border-radius: 11px; cursor: pointer;
          transition: background .15s, transform .15s; flex-shrink: 0;
        }
        .lp-hero-search-btn:hover { background: ${C.brandD}; transform: scale(1.02); }

        .lp-hero-quickcats {
          display: flex; gap: 8px; overflow-x: auto; margin-top: 14px; padding-bottom: 2px;
          scrollbar-width: none;
        }
        .lp-hero-quickcats::-webkit-scrollbar { display: none; }
        .lp-hero-chip {
          flex-shrink: 0; display: flex; align-items: center; gap: 6px;
          background: ${C.elev}; border: 1px solid ${C.border}; border-radius: 20px;
          padding: 8px 14px; font-size: 12.5px; font-weight: 600; color: ${C.off};
          cursor: pointer; white-space: nowrap; transition: all .15s;
        }
        .lp-hero-chip:hover { border-color: ${C.brand}; color: ${C.brand}; background: ${C.brandDim}; }

        @media (max-width: 640px) {
          .lp-hero { height: 320px; margin-bottom: 100px; }
          .lp-hero-searchcard { bottom: -60px; padding: 14px; }
          .lp-hero-search-row { padding: 6px; }
          .lp-hero-search-btn { font-size: 13px; padding: 12px 18px; }
        }

        /* ── Body ── */
        .lp-body {
          display: grid; grid-template-columns: 216px 1fr; gap: 0;
          max-width: 1560px; margin: 0 auto; align-items: start;
        }
        @media (max-width: 900px) {
          .lp-body { grid-template-columns: 1fr; }
          .lp-sidebar:not(.lp-sidebar-static) { display: none; }
          .lp-mobile-filter-btn { display: flex; }
          .lp-topbar-utils .lp-select:last-of-type,
          .lp-topbar-utils .lp-total-badge { display: none; }
        }

        /* ── Sidebar ── */
        .lp-sidebar {
          position: sticky; top: 53px; height: calc(100vh - 53px);
          overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;
          padding: 16px 0 40px; border-right: 1px solid ${C.border};
          background: ${C.surf}; scrollbar-width: thin; scrollbar-color: ${C.border} transparent;
        }
        .lp-sidebar::-webkit-scrollbar { width: 3px; }
        .lp-sidebar::-webkit-scrollbar-track { background: transparent; }
        .lp-sidebar::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        .lp-sidebar-static { position: static; height: auto; overflow: visible; border-right: none; padding: 4px 0 0; }
        .lp-sidebar-head { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; margin-bottom: 8px; }
        .lp-sidebar-section-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .03em; color: ${C.white}; }
        .lp-clear-all { background: none; border: none; color: ${C.brand}; font-size: 12px; font-weight: 700; cursor: pointer; }
        .lp-clear-all:hover { text-decoration: underline; }
        .lp-sidebar-divider { height: 1px; background: ${C.border}; margin: 14px 16px 12px; }

        .lp-checkbox { width: 15px; height: 15px; border-radius: 3px; border: 1.5px solid ${C.border}; flex-shrink: 0; position: relative; background: ${C.surf}; }
        .lp-checkbox-sm { width: 13px; height: 13px; }
        .lp-checkbox[data-checked="true"] { background: ${C.brand}; border-color: ${C.brand}; }
        .lp-checkbox[data-checked="true"]::after { content: ''; position: absolute; left: 4px; top: 1px; width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
        .lp-checkbox-sm[data-checked="true"]::after { left: 3px; top: 0.5px; width: 3px; height: 7px; }

        .lp-cat-row, .lp-all-row {
          width: 100%; display: flex; align-items: center; gap: 10px; padding: 7px 16px;
          background: none; border: none; cursor: pointer; text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; font-weight: 500;
          color: ${C.off}; position: relative; transition: color .15s, background .15s; line-height: 1.35;
        }
        .lp-cat-row:hover, .lp-all-row:hover { color: ${C.white}; background: ${C.elev}; }
        .lp-cat-active { color: ${C.white} !important; font-weight: 700; }
        .lp-cat-icon  { font-size: 14px; flex-shrink: 0; }
        .lp-cat-label { flex: 1; }
        .lp-cat-chevron { font-size: 17px; color: ${C.muted}; line-height: 1; transition: transform .2s cubic-bezier(.4,0,.2,1); flex-shrink: 0; padding: 0 2px; }
        .lp-cat-row:hover .lp-cat-chevron { color: ${C.off}; }

        .lp-sub-list { padding: 2px 0 6px 41px; display: flex; flex-direction: column; gap: 0; animation: fadeUp .15s ease forwards; }
        .lp-sub-row { width: 100%; display: flex; align-items: center; gap: 8px; padding: 6px 16px 6px 0; background: none; border: none; cursor: pointer; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; font-weight: 400; color: ${C.off}; transition: color .15s; line-height: 1.3; }
        .lp-sub-row:hover { color: ${C.white}; }
        .lp-sub-active { color: ${C.white} !important; font-weight: 700; }
        .lp-sub-label { flex: 1; }

        /* ── Mobile drawer ── */
        .lp-drawer-overlay { display: none; }
        @media (max-width: 900px) { .lp-drawer-overlay.open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 200; animation: fadeIn .15s ease; } }
        .lp-drawer-panel { position: fixed; top: 0; left: 0; bottom: 0; width: min(84vw,320px); background: ${C.void}; z-index: 201; display: flex; flex-direction: column; animation: slideIn .2s cubic-bezier(.22,1,.36,1); box-shadow: 12px 0 40px rgba(0,0,0,.15); }
        .lp-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid ${C.border}; flex-shrink: 0; background: ${C.surf}; }
        .lp-drawer-title { font-size: 15px; font-weight: 800; color: ${C.white}; }
        .lp-drawer-close { background: ${C.elev}; border: 1px solid ${C.border}; color: ${C.off}; width: 30px; height: 30px; border-radius: 10px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .lp-drawer-body { flex: 1; overflow-y: auto; padding-bottom: 10px; background: ${C.surf}; }
        .lp-drawer-section { padding: 16px 20px 4px; display: flex; flex-direction: column; gap: 10px; }
        .lp-drawer-section .lp-select { width: 100%; min-width: 0; }
        .lp-drawer-foot { padding: 14px 18px; border-top: 1px solid ${C.border}; flex-shrink: 0; background: ${C.surf}; }
        .lp-drawer-apply-btn { width: 100%; background: ${C.brand}; border: none; color: #fff; font-weight: 800; font-size: 14px; padding: 13px; border-radius: 10px; cursor: pointer; }
        .lp-drawer-apply-btn:hover { background: ${C.brandD}; }

        /* ── Main content ── */
        .lp-main { padding: 14px clamp(12px,2vw,24px) 60px; min-height: calc(100vh - 53px); }
        .lp-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${C.muted}; margin-bottom: 14px; flex-wrap: wrap; }
        .lp-breadcrumb a { color: ${C.muted}; text-decoration: none; transition: color .15s; }
        .lp-breadcrumb a:hover { color: ${C.brand}; text-decoration: underline; }
        .lp-breadcrumb-sep { color: ${C.border}; font-size: 13px; }
        .lp-breadcrumb-cur { color: ${C.off}; font-weight: 600; }

        .lp-active-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .lp-filter-pill {
          display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600;
          color: ${C.brand}; background: ${C.brandDim}; border: 1px solid ${C.brand}40;
          border-radius: 20px; padding: 5px 12px;
        }
        .lp-filter-pill-x { background: none; border: none; cursor: pointer; color: ${C.brand}; font-size: 14px; line-height: 1; padding: 0; transition: color .15s; }
        .lp-filter-pill-x:hover { color: ${C.coral}; }

        .lp-section-title { font-size: 16px; font-weight: 800; color: ${C.white}; margin-bottom: 4px; letter-spacing: -.2px; }
        .lp-section-sub { font-size: 12px; color: ${C.muted}; margin-bottom: 16px; }

        .lp-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(150px,1fr)); gap: 12px; }

        .lp-card {
          display: block; background: ${C.surf}; border: 1px solid ${C.border};
          border-radius: 12px; overflow: hidden;
          transition: box-shadow .2s, border-color .2s;
          animation: fadeUp .3s ease both;
        }
        .lp-card:hover { box-shadow: 0 4px 16px rgba(15,23,42,.08); border-color: ${C.brand}50; }
        .lp-card-img-wrap { position: relative; aspect-ratio: 1 / 1; background: ${C.elev}; overflow: hidden; }
        .lp-card-img { width: 100%; height: 100%; object-fit: contain; display: block; padding: 8px; }
        .lp-card-img-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; }
        .lp-badge-sale {
          position: absolute; top: 8px; left: 8px; background: ${C.coral}; color: #fff;
          font-size: 11px; font-weight: 800; padding: 3px 7px; border-radius: 4px;
        }
        .lp-wishlist-btn {
          position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,.9); border: 1px solid ${C.border}; color: ${C.off};
          font-size: 15px; display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: color .15s, border-color .15s;
        }
        .lp-wishlist-btn:hover { color: ${C.coral}; border-color: ${C.coral}40; }

        .lp-card-body { padding: 10px 10px 12px; display: flex; flex-direction: column; gap: 4px; }
        .lp-card-name { font-size: 12.5px; font-weight: 500; color: ${C.white}; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.8em; }
        .lp-card-rating { display: flex; align-items: center; gap: 4px; }
        .lp-stars { font-size: 11px; color: ${C.accent}; letter-spacing: 1px; }
        .lp-rating-count { font-size: 10.5px; color: ${C.muted}; }

        .lp-card-price-row { display: flex; align-items: baseline; gap: 7px; flex-wrap: wrap; margin-top: 2px; }
        .lp-price { font-size: 16px; font-weight: 800; color: ${C.accent}; }
        .lp-original { font-size: 11px; color: ${C.muted}; text-decoration: line-through; }

        .lp-card-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 3px; }
        .lp-tag { font-size: 10px; font-weight: 700; border-radius: 4px; padding: 2px 6px; }
        .lp-tag-campus { color: ${C.brand}; background: ${C.brandDim}; }
        .lp-tag-nego { color: ${C.off}; background: ${C.elev}; }

        .lp-sk-card { background: linear-gradient(90deg,${C.elev} 25%,${C.surf} 50%,${C.elev} 75%); background-size: 400% 100%; animation: shimmer 1.5s ease-in-out infinite; border-radius: 12px; overflow: hidden; border: 1px solid ${C.border}; }
        .lp-sk-img  { aspect-ratio: 1/1; background: ${C.elev}; }
        .lp-sk-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
        .lp-sk-line { height: 11px; border-radius: 4px; background: ${C.elev}; }

        .lp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 70px 20px; text-align: center; color: ${C.muted}; grid-column: 1 / -1; }
        .lp-empty-icon { font-size: 42px; margin-bottom: 14px; }
        .lp-empty h3 { font-size: 16px; font-weight: 700; color: ${C.off}; margin-bottom: 6px; }
        .lp-empty p { font-size: 13px; line-height: 1.6; }

        .lp-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 32px; flex-wrap: wrap; }
        .lp-pg-btn {
          background: ${C.surf}; border: 1px solid ${C.border}; color: ${C.off};
          font-size: 13px; font-weight: 600; padding: 8px 13px; border-radius: 10px;
          cursor: pointer; transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif; min-width: 36px;
        }
        .lp-pg-btn:hover:not(:disabled) { border-color: ${C.brand}; color: ${C.brand}; }
        .lp-pg-btn.active { background: ${C.brand}; border-color: ${C.brand}; color: #fff; }
        .lp-pg-btn:disabled { opacity: .35; cursor: not-allowed; }
        .lp-pg-dots { color: ${C.muted}; font-size: 14px; padding: 0 4px; }

        @media (max-width: 640px) {
          .lp-topbar { gap: 8px; }
          .lp-grid { grid-template-columns: repeat(2,1fr); gap: 8px; }
        }
      `}</style>

      <div className="lp-page">

        <Hero searchInput={searchInput} setSearchInput={setSearchInput} onSearch={handleSearch} campus={campus} setCampus={(v) => { setCampus(v); setPage(1); }} onPickCategory={handleCategoryChange} />

        {/* ── Mobile drawer ── */}
        <div className={`lp-drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
        {drawerOpen && (
          <div className="lp-drawer-panel">
            <div className="lp-drawer-head"><span className="lp-drawer-title">Filters</span><button className="lp-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close filters">✕</button></div>
            <div className="lp-drawer-body">
              <div className="lp-drawer-section">
                <select className="lp-select" value={campus} onChange={e => { setCampus(e.target.value); setPage(1); }}>{CAMPUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                <select className="lp-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>{SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              </div>
              <div className="lp-sidebar-divider" />
              <Sidebar sticky={false} activeCategory={activeCategory} activeSub={activeSub} campus={campus} onCategory={handleCategoryChange} onSub={handleSubChange} onClearAll={handleClearAll} />
            </div>
            <div className="lp-drawer-foot"><button className="lp-drawer-apply-btn" onClick={() => setDrawerOpen(false)}>Show {total.toLocaleString()} result{total !== 1 ? 's' : ''}</button></div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="lp-body">
          <Sidebar activeCategory={activeCategory} activeSub={activeSub} campus={campus} onCategory={handleCategoryChange} onSub={handleSubChange} onClearAll={handleClearAll} />
          <main className="lp-main">
            <div id="lp-grid-anchor" style={{ position: 'relative', top: -66 }} />
            <nav className="lp-breadcrumb" aria-label="Breadcrumb">
              {crumbs.map((crumb, i) => (<span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{i > 0 && <span className="lp-breadcrumb-sep">›</span>}{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span className="lp-breadcrumb-cur">{crumb.label}</span>}</span>))}
            </nav>
            {(activeCategory || activeSub || campus || search) && (
              <div className="lp-active-filters">
                {activeCategory && <span className="lp-filter-pill">{activeCatObj?.emoji} {activeCatObj?.label}<button className="lp-filter-pill-x" onClick={() => handleCategoryChange('')}>×</button></span>}
                {activeSub && <span className="lp-filter-pill">{activeSub}<button className="lp-filter-pill-x" onClick={() => handleSubChange('')}>×</button></span>}
                {campus && <span className="lp-filter-pill">📍 {CAMPUS_OPTIONS.find(c => c.value === campus)?.label}<button className="lp-filter-pill-x" onClick={() => { setCampus(''); setPage(1); }}>×</button></span>}
                {search && <span className="lp-filter-pill">🔍 "{search}"<button className="lp-filter-pill-x" onClick={() => { setSearch(''); setSearchInput(''); }}>×</button></span>}
              </div>
            )}
            <h1 className="lp-section-title">{activeSub ? activeSub : activeCatObj ? activeCatObj.label : search ? `Results for "${search}"` : 'All Listings'}</h1>
            <p className="lp-section-sub">{loading ? 'Loading…' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''}${campus ? ` · ${CAMPUS_OPTIONS.find(c => c.value === campus)?.label}` : ''}`}</p>
            {loading ? (<div className="lp-grid">{[...Array(18)].map((_, i) => <SkeletonCard key={i} />)}</div>) : products.length === 0 ? (<div className="lp-grid"><div className="lp-empty"><div className="lp-empty-icon">📭</div><h3>No listings found</h3><p>Try a different category, campus, or search term.</p></div></div>) : (<div className="lp-grid">{products.map((p, i) => <ProductCard key={p._id || i} product={p} />)}</div>)}
            {!loading && totalPages > 1 && (
              <div className="lp-pagination">
                <button className="lp-pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2).reduce((acc, n, i, arr) => { if (i > 0 && n - arr[i - 1] > 1) acc.push('…'); acc.push(n); return acc; }, []).map((item, i) => item === '…' ? <span key={`dot-${i}`} className="lp-pg-dots">…</span> : <button key={item} className={`lp-pg-btn${page === item ? ' active' : ''}`} onClick={() => setPage(item)}>{item}</button>)}
                <button className="lp-pg-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}