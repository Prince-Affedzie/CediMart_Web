// src/app/listings/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, ChevronRight, X,
  MapPin, ArrowUpDown, ShoppingBag, Menu,
  ChevronDown, Check, Package, ChevronLeft
} from 'lucide-react';
import { getAllProducts, getProductsByCategory } from '@/apis/productApi';

// ─── Category + subcategory data ─────────────────────────────────────────────
const CATEGORIES = [
  { key: 'electronics',           label: 'Electronics',      icon: '💻',
    sub: ['Headphones & Earbuds','Speakers','Chargers & Cables','Power Banks','Smartwatches','Cameras','Other'] },
  { key: 'phones and tablets',    label: 'Phones & Tablets', icon: '📱',
    sub: ['Smartphones','Tablets','iPads','Phone Cases','Screen Protectors','Other Accessories'] },
  { key: 'computers and laptops', label: 'Computers & Laptops', icon: '🖥️',
    sub: ['Laptops','Desktops','Monitors','Keyboards','Mouse','Laptop Bags','Software','Other'] },
  { key: 'gaming',                label: 'Gaming',           icon: '🎮',
    sub: ['Consoles','Games','Controllers','Gaming Accessories'] },
  { key: 'fashion',               label: 'Fashion',          icon: '👗',
    sub: ["Men's Clothing","Women's Clothing",'Unisex Clothing','Shoes','Bags','Watches','Jewelry','Other'] },
  { key: 'books-course-materials',label: 'Books & Materials',icon: '📚',
    sub: ['Textbooks','Course Notes','Past Questions','Stationery','Novels','Other'] },
  { key: 'hostel-items',          label: 'Hostel Items',     icon: '🏠',
    sub: ['Bedding','Kitchenware','Cleaning Supplies','Storage','Lighting','Other'] },
  { key: 'appliances',            label: 'Appliances',       icon: '🔌',
    sub: ['Fans','Irons','Kettles','Blenders','Microwaves','Other'] },
  { key: 'furniture',             label: 'Furniture',        icon: '🪑',
    sub: ['Chairs','Tables & Desks','Beds & Mattresses','Shelves','Other'] },
  { key: 'beauty and grooming',   label: 'Beauty & Grooming',icon: '💄',
    sub: ['Skincare','Makeup','Hair Care','Perfumes','Nail Care','Other'] },
  { key: 'sports and fitness',    label: 'Sports & Fitness', icon: '⚽',
    sub: ['Sports Equipment','Gym Gear','Activewear','Other'] },
  { key: 'food and drinks',       label: 'Food & Drinks',    icon: '🍕',
    sub: ['Snacks','Drinks','Homemade Meals','Baked Goods','Other'] },
  { key: 'services',              label: 'Services',         icon: '🛠️',
    sub: ['Tutoring','Graphic Design','Photography','Printing','Laundry','Tech Repairs','Other'] },
  { key: 'accessories',           label: 'Accessories',      icon: '⌚',
    sub: ['Phone Accessories','Laptop Accessories','Fashion Accessories','Other'] },
  { key: 'other',                 label: 'Other',            icon: '📦',
    sub: ['Miscellaneous'] },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest'           },
  { value: 'popular',    label: 'Most Popular'     },
  { value: 'price-asc',  label: 'Price: Low → High'},
  { value: 'price-desc', label: 'Price: High → Low'},
];

const CAMPUS_OPTIONS = [
  { value: '',       label: 'All Campuses' },
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
  { id: '1', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1780782982/flyer13_1_fyp0xj.png', tag: '🎓 Campus Marketplace', title: 'Buy & Sell on\nCampus', subtitle: "Connect with students across Ghana's top universities", category: '' },
  { id: '2', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1780771354/flyer11_qkxwpv.jpg', tag: '💻 Electronics & Gadgets', title: 'Laptops, Phones\n& More', subtitle: 'Student-priced tech from trusted campus sellers', category: 'electronics' },
  { id: '3', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1781101245/fashion_banner_ibwmaz.png', tag: '👗 Fashion & Style', title: 'Upgrade Your\nWardrobe', subtitle: 'Trendy outfits, accessories & vintage finds at great prices', category: 'fashion' },
  { id: '4', image: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1781891792/food_nad_provisions_1_m6fvfn.png', tag: '🍽️ Food & Provisions', title: 'Stock Up on\nFood & Provisions', subtitle: 'Groceries, snacks, drinks and daily essentials delivered to your doorstep', category: 'food and drinks' },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p == null ? '—' : `GH₵\u00A0${Number(p).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="lp-sk-card">
      <div className="lp-sk-img" />
      <div className="lp-sk-body">
        <div className="lp-sk-line" style={{ width: '55%' }} />
        <div className="lp-sk-line" style={{ width: '85%' }} />
        <div className="lp-sk-line" style={{ width: '40%', height: 18 }} />
      </div>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const img = product.images?.[0] || product.image;
  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const pct = isOnSale ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100) : null;

  return (
    <Link href={`/product/${product._id}`} className="lp-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="lp-card-img-wrap">
        {img ? <img src={img} alt={product.name} className="lp-card-img" onError={e => { e.target.src = 'https://placehold.co/400x300/F1F5F9/94A3B8?text=No+Image'; }} /> : <div className="lp-card-img-ph"><Package size={36} color={C.muted} /></div>}
        {isOnSale && <span className="lp-badge lp-badge-sale">-{pct}%</span>}
        {product.negotiable && <span className="lp-badge lp-badge-nego">Nego.</span>}
      </div>
      <div className="lp-card-body">
        {product.campus && <span className="lp-card-campus">{product.campus}</span>}
        <p className="lp-card-name">{product.name}</p>
        <div className="lp-card-foot">
          <div>
            {isOnSale && <s className="lp-original">{fmtPrice(product.discountInfo.originalPrice)}</s>}
            <span className="lp-price" style={{ color: isOnSale ? C.coral : C.accent }}>{fmtPrice(product.price)}</span>
          </div>
          <span className="lp-view">View</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Category Tree (shared) ───────────────────────────────────────────────────
function CategoryTree({ activeCategory, activeSub, onCategory, onSub, onClose }) {
  const [openKeys, setOpenKeys] = useState(() => {
    const init = {};
    if (activeCategory) init[activeCategory] = true;
    return init;
  });

  useEffect(() => {
    if (activeCategory) setOpenKeys(prev => ({ ...prev, [activeCategory]: true }));
  }, [activeCategory]);

  const toggle = (key) => setOpenKeys(prev => ({ ...prev, [key]: !prev[key] }));

  const pickCategory = (cat) => {
    if (cat.key === activeCategory) { onCategory(''); onSub(''); }
    else { onCategory(cat.key); onSub(''); setOpenKeys(prev => ({ ...prev, [cat.key]: true })); }
    onClose?.();
  };

  const pickSub = (e, catKey, subLabel) => {
    e.stopPropagation();
    onCategory(catKey);
    onSub(activeSub === subLabel ? '' : subLabel);
    onClose?.();
  };

  return (
    <div className="lp-cat-tree">
      <button className={`lp-cat-row lp-all-row${!activeCategory ? ' lp-cat-active' : ''}`} onClick={() => { onCategory(''); onSub(''); onClose?.(); }}>
        <ShoppingBag size={15} strokeWidth={2} className="lp-cat-icon-svg" />
        <span className="lp-cat-label">All Products</span>
        {!activeCategory && <Check size={14} strokeWidth={2.5} style={{ marginLeft: 'auto', color: C.brand, flexShrink: 0 }} />}
      </button>
      <div className="lp-sidebar-divider" />
      <p className="lp-sidebar-section-label">Shop by Category</p>
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.key;
        const isOpen = !!openKeys[cat.key];
        return (
          <div key={cat.key} className="lp-cat-group">
            <button className={`lp-cat-row${isActive ? ' lp-cat-active' : ''}`} onClick={() => { pickCategory(cat); if (cat.sub?.length) toggle(cat.key); }}>
              <span className="lp-cat-emoji">{cat.icon}</span>
              <span className="lp-cat-label">{cat.label}</span>
              {isActive && !isOpen && <Check size={13} strokeWidth={2.5} style={{ color: C.brand, flexShrink: 0, marginRight: 4 }} />}
              {cat.sub?.length > 0 && (
                <span className="lp-chevron-wrap" onClick={(e) => { e.stopPropagation(); toggle(cat.key); }} role="button" aria-label={isOpen ? 'Collapse' : 'Expand'}>
                  <ChevronRight size={15} strokeWidth={2} className="lp-cat-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .22s cubic-bezier(.4,0,.2,1)', color: isActive ? C.brandL : C.muted }} />
                </span>
              )}
            </button>
            {isOpen && cat.sub?.length > 0 && (
              <div className="lp-sub-list">
                {cat.sub.map((sub) => {
                  const subActive = isActive && activeSub === sub;
                  return (
                    <button key={sub} className={`lp-sub-row${subActive ? ' lp-sub-active' : ''}`} onClick={(e) => pickSub(e, cat.key, sub)}>
                      <span className="lp-sub-dot-wrap">{subActive ? <span className="lp-sub-dot-filled" /> : <span className="lp-sub-dot-empty" />}</span>
                      <span className="lp-sub-label">{sub}</span>
                      {subActive && <Check size={11} strokeWidth={2.5} style={{ marginLeft: 'auto', color: C.brandL, flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeCategory, activeSub, onCategory, onSub }) {
  return (
    <aside className="lp-sidebar">
      <CategoryTree activeCategory={activeCategory} activeSub={activeSub} onCategory={onCategory} onSub={onSub} />
    </aside>
  );
}

// ─── Mobile filter sheet ─────────────────────────────────────────────────────
function MobileFilterSheet({ open, onClose, activeCategory, activeSub, onCategory, onSub }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;

  return (
    <>
      <div className="lp-sheet-backdrop" onClick={onClose} />
      <div className="lp-sheet">
        <div className="lp-sheet-header">
          <div className="lp-sheet-handle" />
          <div className="lp-sheet-title-row">
            <span className="lp-sheet-title">Categories</span>
            <button className="lp-sheet-close" onClick={onClose} aria-label="Close"><X size={18} strokeWidth={2} /></button>
          </div>
        </div>
        <div className="lp-sheet-body">
          <CategoryTree activeCategory={activeCategory} activeSub={activeSub} onCategory={onCategory} onSub={onSub} onClose={onClose} />
        </div>
      </div>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ searchInput, setSearchInput, onSearch, onPickCategory }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => { if (paused) return; const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500); return () => clearInterval(t); }, [paused]);
  const goTo = (i) => setSlide(((i % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length);
  const active = HERO_SLIDES[slide];

  const scrollToGrid = () => { document.getElementById('lp-grid-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const handleCta = () => { const matched = CATEGORIES.find(c => c.key.toLowerCase().replace(/[^a-z]/g, '') === active.category.toLowerCase().replace(/[^a-z]/g, '')); onPickCategory(matched ? matched.key : ''); scrollToGrid(); };

  return (
    <section className="lp-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {HERO_SLIDES.map((s, i) => (
        <div key={s.id} className={`lp-hero-slide${i === slide ? ' active' : ''}`} style={{ backgroundImage: `url(${s.image})` }}>
          <div className="lp-hero-overlay" />
          <div className="lp-hero-copy">
            <span className="lp-hero-tag">{s.tag}</span>
            <h1 className="lp-hero-title">{s.title}</h1>
            <p className="lp-hero-subtitle">{s.subtitle}</p>
            <button type="button" className="lp-hero-cta" onClick={handleCta}>{s.btnText} →</button>
          </div>
        </div>
      ))}

      <button type="button" className="lp-hero-arrow lp-hero-arrow-prev" aria-label="Previous slide" onClick={() => goTo(slide - 1)}><ChevronLeft size={24} /></button>
      <button type="button" className="lp-hero-arrow lp-hero-arrow-next" aria-label="Next slide" onClick={() => goTo(slide + 1)}><ChevronRight size={24} /></button>

      <div className="lp-hero-dots">
        {HERO_SLIDES.map((s, i) => (<button key={s.id} type="button" aria-label={`Go to slide ${i + 1}`} className={`lp-hero-dot${i === slide ? ' active' : ''}`} onClick={() => goTo(i)} />))}
      </div>

      {/* Search card overlapping the hero bottom 
      <div className="lp-hero-searchcard">
        <form className="lp-hero-search-row" onSubmit={onSearch}>
          <Search size={20} className="lp-hero-search-icon" strokeWidth={2} />
          <input className="lp-hero-search-input" placeholder="Search for laptops, textbooks, sneakers…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          <button type="submit" className="lp-hero-search-btn">Search</button>
        </form>
        
      </div>*/}
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
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [activeCategory, activeSub, campus, sort, page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [activeCategory, activeSub, campus, sort, search]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };
  const handleCatChange = (cat) => { setActiveCategory(cat); setActiveSub(''); setPage(1); };
  const handleSubChange = (sub) => { setActiveSub(sub); setPage(1); };

  const activeCatObj = CATEGORIES.find(c => c.key === activeCategory);
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Listings', href: '/listings' },
    ...(activeCatObj ? [{ label: activeCatObj.label }] : []),
    ...(activeSub ? [{ label: activeSub }] : []),
  ];

  const hasFilters = !!(activeCategory || activeSub || campus || search);
  const activeFilterCount = [activeCategory, activeSub, campus, search].filter(Boolean).length;

  return (
    <>
      <style>{styles}</style>
      <div className="lp-page">
        <Hero searchInput={searchInput} setSearchInput={setSearchInput} onSearch={handleSearch} onPickCategory={handleCatChange} />

        <div className="lp-topbar">
          <button className="lp-hamburger" onClick={() => setSheetOpen(true)} aria-label="Open category filter" aria-expanded={sheetOpen}>
            <Menu size={20} strokeWidth={2} />
            {activeFilterCount > 0 && <span className="lp-hamburger-badge">{activeFilterCount}</span>}
          </button>

          <form className="lp-search-form" onSubmit={handleSearch}>
            <span className="lp-search-icon-wrap"><Search size={16} strokeWidth={2} /></span>
            <input className="lp-search-input" placeholder="Search listings…" value={searchInput} onChange={e => setSearchInput(e.target.value)} aria-label="Search listings" />
            <button type="submit" className="lp-search-btn" aria-label="Submit search"><Search size={15} strokeWidth={2.5} /></button>
          </form>

          <div className="lp-select-wrap">
            <span className="lp-select-icon"><MapPin size={13} strokeWidth={2} /></span>
            <select className="lp-select" value={campus} onChange={e => { setCampus(e.target.value); setPage(1); }} aria-label="Filter by campus">
              {CAMPUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="lp-select-chevron"><ChevronDown size={13} strokeWidth={2} /></span>
          </div>

          <div className="lp-select-wrap">
            <span className="lp-select-icon"><ArrowUpDown size={13} strokeWidth={2} /></span>
            <select className="lp-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} aria-label="Sort by">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="lp-select-chevron"><ChevronDown size={13} strokeWidth={2} /></span>
          </div>

          {!loading && <span className="lp-total-badge">{total.toLocaleString()} listing{total !== 1 ? 's' : ''}</span>}
        </div>

        <MobileFilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} activeCategory={activeCategory} activeSub={activeSub} onCategory={handleCatChange} onSub={handleSubChange} />

        <div className="lp-body">
          <Sidebar activeCategory={activeCategory} activeSub={activeSub} onCategory={handleCatChange} onSub={handleSubChange} />
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

            {hasFilters && (
              <div className="lp-active-filters">
                {activeCategory && <span className="lp-filter-pill">{activeCatObj?.icon} {activeCatObj?.label}<button className="lp-filter-pill-x" onClick={() => handleCatChange('')} aria-label="Remove category filter"><X size={13} strokeWidth={2.5} /></button></span>}
                {activeSub && <span className="lp-filter-pill">{activeSub}<button className="lp-filter-pill-x" onClick={() => handleSubChange('')} aria-label="Remove subcategory filter"><X size={13} strokeWidth={2.5} /></button></span>}
                {campus && <span className="lp-filter-pill"><MapPin size={11} strokeWidth={2} /> {CAMPUS_OPTIONS.find(c => c.value === campus)?.label}<button className="lp-filter-pill-x" onClick={() => { setCampus(''); setPage(1); }} aria-label="Remove campus filter"><X size={13} strokeWidth={2.5} /></button></span>}
                {search && <span className="lp-filter-pill"><Search size={11} strokeWidth={2} /> "{search}"<button className="lp-filter-pill-x" onClick={() => { setSearch(''); setSearchInput(''); }} aria-label="Clear search"><X size={13} strokeWidth={2.5} /></button></span>}
              </div>
            )}

            <h1 className="lp-section-title">{activeSub ? activeSub : activeCatObj ? activeCatObj.label : search ? `Results for "${search}"` : 'All Listings'}</h1>
            <p className="lp-section-sub">{loading ? 'Loading…' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''}${campus ? ` · ${CAMPUS_OPTIONS.find(c => c.value === campus)?.label}` : ''}`}</p>

            {loading ? (
              <div className="lp-grid">{[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : products.length === 0 ? (
              <div className="lp-empty"><div className="lp-empty-icon"><Package size={48} color={C.muted} /></div><h3>No listings found</h3><p>Try a different category, campus, or search term.</p></div>
            ) : (
              <div className="lp-grid">{products.map((p, i) => <ProductCard key={p._id || i} product={p} />)}</div>
            )}

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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:${C.void};color:${C.white};font-family:'Plus Jakarta Sans',-apple-system,sans-serif;overflow-x:hidden}
  ::selection{background:${C.brandDim};color:${C.brand}}
  @keyframes shimmer{0%{background-position:-400% center}100%{background-position:400% center}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}

  .lp-page{min-height:100vh}

  /* ── Hero ── */
  .lp-hero{position:relative;height:400px;overflow:visible;background:${C.surf};margin-bottom:80px}
  .lp-hero-slide{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity .7s ease;display:flex;align-items:center;border-radius:0 0 24px 24px;overflow:hidden}
  .lp-hero-slide.active{opacity:1;z-index:1}
  .lp-hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,20,60,0.55) 20%,rgba(10,20,60,0.15) 75%)}
  .lp-hero-copy{position:relative;z-index:2;padding:0 clamp(20px,6vw,72px);max-width:620px}
  .lp-hero-tag{display:inline-block;font-size:12.5px;font-weight:700;color:#fff;background:rgba(255,255,255,.16);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:5px 14px;margin-bottom:14px}
  .lp-hero-title{font-size:clamp(26px,4vw,42px);font-weight:900;color:#fff;line-height:1.12;white-space:pre-line;letter-spacing:-.5px;margin-bottom:10px;text-shadow:0 2px 16px rgba(0,0,0,.25)}
  .lp-hero-subtitle{font-size:14.5px;color:rgba(255,255,255,.92);line-height:1.5;margin-bottom:20px;max-width:440px}
  .lp-hero-cta{background:${C.accent};color:#fff;border:none;font-size:14px;font-weight:800;padding:12px 22px;border-radius:10px;cursor:pointer;transition:transform .15s,filter .15s}
  .lp-hero-cta:hover{filter:brightness(1.1);transform:translateY(-1px)}
  .lp-hero-arrow{position:absolute;top:42%;transform:translateY(-50%);z-index:3;width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;background:rgba(255,255,255,.25);color:#fff;display:flex;align-items:center;justify-content:center;transition:background .15s;backdrop-filter:blur(4px)}
  .lp-hero-arrow:hover{background:rgba(255,255,255,.45)}
  .lp-hero-arrow-prev{left:16px}
  .lp-hero-arrow-next{right:16px}
  @media(max-width:640px){.lp-hero-arrow{display:none}}
  .lp-hero-dots{position:absolute;top:16px;right:20px;z-index:3;display:flex;gap:6px}
  .lp-hero-dot{width:7px;height:7px;border-radius:50%;border:none;background:rgba(255,255,255,.45);cursor:pointer;padding:0;transition:background .2s,width .2s}
  .lp-hero-dot.active{background:#fff;width:20px;border-radius:4px}

  /* ── Hero search card ── */
  .lp-hero-searchcard{position:absolute;left:50%;bottom:-40px;transform:translateX(-50%);z-index:10;width:min(94%,820px);background:${C.surf};border-radius:24px;box-shadow:0 20px 60px rgba(15,23,42,.12),0 4px 16px rgba(15,23,42,.06);padding:20px 22px;border:1px solid ${C.border}}
  .lp-hero-search-row{display:flex;align-items:center;gap:4px;background:${C.void};border:2px solid ${C.border};border-radius:18px;padding:6px 6px 6px 18px;transition:all .25s cubic-bezier(.4,0,.2,1)}
  .lp-hero-search-row:focus-within{border-color:${C.brand};box-shadow:0 0 0 5px ${C.brandDim},0 4px 20px rgba(13,148,136,.12);transform:scale(1.01)}
  .lp-hero-search-icon{color:${C.muted};flex-shrink:0;opacity:.6}
  .lp-hero-search-input{flex:1;background:none;border:none;outline:none;padding:15px 10px;font-size:16px;color:${C.white};font-family:'Plus Jakarta Sans',sans-serif;min-width:0}
  .lp-hero-search-input::placeholder{color:${C.muted};font-size:15px}
  .lp-hero-search-btn{background:linear-gradient(135deg,${C.brand},${C.brandL});border:none;color:#fff;font-weight:800;font-size:14px;padding:14px 28px;border-radius:14px;cursor:pointer;transition:all .2s;flex-shrink:0;box-shadow:0 4px 14px rgba(13,148,136,.25)}
  .lp-hero-search-btn:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 6px 20px rgba(13,148,136,.35)}
  .lp-hero-quickcats{display:flex;gap:8px;overflow-x:auto;margin-top:14px;padding-bottom:2px;scrollbar-width:none}
  .lp-hero-quickcats::-webkit-scrollbar{display:none}
  .lp-hero-chip{flex-shrink:0;display:flex;align-items:center;gap:6px;background:${C.elev};border:1px solid ${C.border};border-radius:20px;padding:8px 14px;font-size:12.5px;font-weight:600;color:${C.off};cursor:pointer;white-space:nowrap;transition:all .15s}
  .lp-hero-chip:hover{border-color:${C.brand};color:${C.brand};background:${C.brandDim}}
  @media(max-width:640px){.lp-hero{height:320px;margin-bottom:100px}.lp-hero-searchcard{bottom:-60px;padding:14px;border-radius:18px}.lp-hero-search-row{padding:4px;border-radius:14px}.lp-hero-search-input{padding:13px 8px;font-size:14px}.lp-hero-search-input::placeholder{font-size:13px}.lp-hero-search-btn{font-size:13px;padding:12px 18px;border-radius:11px}}

  /* ── Top bar ── */
  .lp-topbar{background:${C.surf};border-bottom:1px solid ${C.border};padding:12px clamp(14px,4vw,56px);display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:50}
  .lp-hamburger{display:none;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;background:${C.elev};border:1.5px solid ${C.border};cursor:pointer;color:${C.white};flex-shrink:0;transition:border-color .2s,background .2s;position:relative}
  .lp-hamburger:hover{border-color:${C.brand};background:${C.brandDim}}
  .lp-hamburger-badge{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:${C.brand};color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid ${C.surf}}
  @media(max-width:900px){.lp-hamburger{display:flex}}
  .lp-search-form{display:flex;align-items:center;flex:1;min-width:0;max-width:440px;background:${C.elev};border:1.5px solid ${C.border};border-radius:999px;overflow:hidden;transition:border-color .22s,box-shadow .22s}
  .lp-search-form:focus-within{border-color:${C.brand};box-shadow:0 0 0 3px ${C.brandDim}}
  .lp-search-icon-wrap{display:flex;align-items:center;padding:0 4px 0 16px;color:${C.muted};pointer-events:none;flex-shrink:0;transition:color .2s}
  .lp-search-form:focus-within .lp-search-icon-wrap{color:${C.brandL}}
  .lp-search-input{flex:1;background:none;border:none;outline:none;padding:12px 10px;font-size:14px;color:${C.white};font-family:'Plus Jakarta Sans',sans-serif;min-width:0}
  .lp-search-input::placeholder{color:${C.muted}}
  .lp-search-btn{background:${C.brand};border:none;cursor:pointer;padding:10px 18px;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:0 999px 999px 0;transition:background .2s;flex-shrink:0;height:100%}
  .lp-search-btn:hover{background:${C.brandD}}
  .lp-select-wrap{position:relative;flex-shrink:0}
  .lp-select-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:${C.muted};pointer-events:none;display:flex;align-items:center}
  .lp-select-chevron{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:${C.muted};pointer-events:none}
  .lp-select{background:${C.elev};border:1.5px solid ${C.border};border-radius:14px;color:${C.white};font-size:13px;font-weight:600;padding:11px 34px 11px 34px;cursor:pointer;outline:none;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color .2s,box-shadow .2s;appearance:none;min-width:130px}
  .lp-select:hover,.lp-select:focus{border-color:${C.brand};box-shadow:0 0 0 3px ${C.brandDim}}
  .lp-select option{background:${C.surf}}
  .lp-total-badge{margin-left:auto;font-size:12px;font-weight:600;color:${C.muted};white-space:nowrap;font-family:'JetBrains Mono',monospace;flex-shrink:0}
  @media(max-width:640px){.lp-select-wrap{display:none}.lp-total-badge{display:none}.lp-search-form{max-width:none}}

  /* ── Body grid ── */
  .lp-body{display:grid;grid-template-columns:248px 1fr;align-items:start;max-width:1440px;margin:0 auto}
  @media(max-width:900px){.lp-body{grid-template-columns:1fr}.lp-sidebar{display:none}}

  /* ── Sidebar ── */
  .lp-sidebar{position:sticky;top:70px;height:calc(100vh - 70px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:20px 0 48px;border-right:1px solid ${C.border};background:${C.void};scrollbar-width:thin;scrollbar-color:${C.border} transparent}
  .lp-sidebar::-webkit-scrollbar{width:3px}
  .lp-sidebar::-webkit-scrollbar-track{background:transparent}
  .lp-sidebar::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
  .lp-sidebar-section-label{font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${C.muted};padding:0 20px;margin-bottom:6px;font-family:'JetBrains Mono',monospace}
  .lp-sidebar-divider{height:1px;background:${C.border};margin:10px 20px 14px}
  .lp-cat-group{position:relative}
  .lp-cat-row,.lp-all-row{width:100%;display:flex;align-items:center;gap:9px;padding:9px 16px 9px 20px;background:none;border:none;border-left:3px solid transparent;cursor:pointer;text-align:left;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:500;color:${C.off};transition:color .16s,background .16s,border-color .16s;line-height:1.35}
  .lp-cat-row:hover,.lp-all-row:hover{color:${C.white};background:rgba(13,148,136,.04)}
  .lp-cat-active{color:${C.white}!important;font-weight:700;border-left-color:${C.brand}!important;background:${C.brandDim}!important}
  .lp-cat-icon-svg{flex-shrink:0;color:${C.muted};width:20px}
  .lp-cat-active .lp-cat-icon-svg{color:${C.brandL}}
  .lp-cat-emoji{font-size:15px;flex-shrink:0;width:20px;text-align:center;line-height:1}
  .lp-cat-label{flex:1;min-width:0}
  .lp-chevron-wrap{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;flex-shrink:0;transition:background .15s}
  .lp-chevron-wrap:hover{background:rgba(13,148,136,.08)}
  .lp-sub-list{padding:2px 0 6px 49px;display:flex;flex-direction:column;animation:fadeUp .18s ease forwards}
  .lp-sub-row{width:100%;display:flex;align-items:center;gap:8px;padding:7px 16px 7px 0;background:none;border:none;border-left:3px solid transparent;cursor:pointer;text-align:left;font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;font-weight:400;color:${C.muted};transition:color .16s;line-height:1.3}
  .lp-sub-row:hover{color:${C.white}}
  .lp-sub-active{color:${C.brandL}!important;font-weight:600}
  .lp-sub-dot-wrap{display:flex;align-items:center;justify-content:center;width:14px;flex-shrink:0}
  .lp-sub-dot-filled{width:6px;height:6px;border-radius:50%;background:${C.brand};display:block}
  .lp-sub-dot-empty{width:4px;height:4px;border-radius:50%;background:${C.border};display:block}
  .lp-sub-label{flex:1}

  /* ── Mobile sheet ── */
  .lp-sheet-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:200;animation:fadeIn .2s ease forwards}
  .lp-sheet{position:fixed;bottom:0;left:0;right:0;z-index:201;background:${C.surf};border-radius:24px 24px 0 0;border-top:1px solid ${C.border};max-height:88dvh;display:flex;flex-direction:column;animation:slideUp .28s cubic-bezier(.22,1,.36,1) forwards;box-shadow:0 -12px 48px rgba(0,0,0,.15)}
  .lp-sheet-header{flex-shrink:0;padding:10px 20px 0;border-bottom:1px solid ${C.border}}
  .lp-sheet-handle{width:36px;height:4px;border-radius:2px;background:${C.border};margin:0 auto 14px}
  .lp-sheet-title-row{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px}
  .lp-sheet-title{font-size:16px;font-weight:800;color:${C.white};letter-spacing:-.2px}
  .lp-sheet-close{width:32px;height:32px;border-radius:50%;background:${C.elev};border:1px solid ${C.border};display:flex;align-items:center;justify-content:center;cursor:pointer;color:${C.off};transition:border-color .2s,color .2s}
  .lp-sheet-close:hover{border-color:${C.coral};color:${C.coral}}
  .lp-sheet-body{flex:1;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:8px 0 env(safe-area-inset-bottom,24px);-webkit-overflow-scrolling:touch}
  .lp-sheet-body .lp-cat-row,.lp-sheet-body .lp-all-row{padding-top:12px;padding-bottom:12px;font-size:14.5px}
  .lp-sheet-body .lp-sub-row{padding-top:9px;padding-bottom:9px;font-size:13.5px}

  /* ── Main content ── */
  .lp-main{padding:20px clamp(14px,3vw,36px) 60px;min-height:calc(100vh - 70px)}
  .lp-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:${C.muted};margin-bottom:20px;flex-wrap:wrap}
  .lp-breadcrumb a{color:${C.muted};text-decoration:none;transition:color .15s}
  .lp-breadcrumb a:hover{color:${C.brand}}
  .lp-breadcrumb-sep{color:${C.border}}
  .lp-breadcrumb-cur{color:${C.off};font-weight:600}
  .lp-active-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .lp-filter-pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:${C.brand};background:${C.brandDim};border:1px solid ${C.brand}40;border-radius:20px;padding:5px 10px 5px 12px}
  .lp-filter-pill-x{background:none;border:none;cursor:pointer;color:${C.brand};display:flex;align-items:center;padding:0;transition:color .15s}
  .lp-filter-pill-x:hover{color:${C.coral}}
  .lp-section-title{font-size:18px;font-weight:800;color:${C.white};margin-bottom:4px;letter-spacing:-.3px}
  .lp-section-sub{font-size:12px;color:${C.muted};margin-bottom:20px;font-family:'JetBrains Mono',monospace}
  .lp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
  .lp-card{display:block;background:${C.surf};border:1px solid ${C.border};border-radius:16px;overflow:hidden;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s,border-color .2s;animation:fadeUp .4s ease both}
  .lp-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.1);border-color:${C.brand}50}
  .lp-card-img-wrap{position:relative;height:170px;background:${C.elev};overflow:hidden}
  .lp-card-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease}
  .lp-card:hover .lp-card-img{transform:scale(1.05)}
  .lp-card-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
  .lp-badge{position:absolute;font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:7px;letter-spacing:.02em}
  .lp-badge-sale{top:8px;right:8px;background:${C.coral};color:#fff}
  .lp-badge-nego{bottom:8px;left:8px;background:${C.accentDim};color:${C.accent};border:1px solid ${C.accent}30}
  .lp-card-body{padding:12px 14px 14px;display:flex;flex-direction:column;gap:5px}
  .lp-card-campus{font-size:9.5px;font-weight:700;color:${C.brand};background:${C.brandDim};border-radius:7px;padding:2px 7px;display:inline-block;font-family:'JetBrains Mono',monospace;width:fit-content}
  .lp-card-name{font-size:13.5px;font-weight:700;color:${C.white};line-height:1.38;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .lp-card-foot{display:flex;align-items:flex-end;justify-content:space-between;margin-top:4px}
  .lp-original{font-size:10px;color:${C.muted};text-decoration:line-through;display:block;margin-bottom:1px;font-family:'JetBrains Mono',monospace}
  .lp-price{font-size:16px;font-weight:800;font-family:'JetBrains Mono',monospace}
  .lp-view{font-size:11.5px;font-weight:700;background:${C.brandDim};color:${C.brand};border:1px solid ${C.brand}30;padding:5px 11px;border-radius:8px;white-space:nowrap;transition:all .18s}
  .lp-card:hover .lp-view{background:${C.brand};color:#fff;border-color:transparent}
  .lp-sk-card{background:linear-gradient(90deg,${C.surf} 25%,${C.elev} 50%,${C.surf} 75%);background-size:400% 100%;animation:shimmer 1.6s ease-in-out infinite;border-radius:16px;overflow:hidden;border:1px solid ${C.border}}
  .lp-sk-img{height:170px;background:${C.elev}}
  .lp-sk-body{padding:12px 14px;display:flex;flex-direction:column;gap:8px}
  .lp-sk-line{height:12px;border-radius:6px;background:${C.elev}}
  .lp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center;color:${C.muted}}
  .lp-empty-icon{margin-bottom:16px;opacity:.35}
  .lp-empty h3{font-size:17px;font-weight:700;color:${C.off};margin-bottom:6px}
  .lp-empty p{font-size:14px;line-height:1.6}
  .lp-pagination{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:40px;flex-wrap:wrap}
  .lp-pg-btn{background:${C.surf};border:1px solid ${C.border};color:${C.off};font-size:13px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;transition:all .18s;font-family:'Plus Jakarta Sans',sans-serif;min-width:38px}
  .lp-pg-btn:hover:not(:disabled){border-color:${C.brand};color:${C.brand}}
  .lp-pg-btn.active{background:${C.brand};border-color:${C.brand};color:#fff}
  .lp-pg-btn:disabled{opacity:.35;cursor:not-allowed}
  .lp-pg-dots{color:${C.muted};font-size:14px;padding:0 4px}
  @media(max-width:640px){.lp-grid{grid-template-columns:repeat(2,1fr);gap:10px}}
`;