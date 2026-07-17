// src/app/listings/page.js
'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAllProducts, getProductsByCategory, searchProducts } from '@/apis/productApi';

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  void:    '#09090F',
  surf:    '#13131E',
  elev:    '#1C1C2E',
  indigo:  '#6366F1',
  indigoL: '#818CF8',
  indigoDim:'rgba(99,102,241,0.12)',
  amber:   '#F59E0B',
  amberL:  '#FCD34D',
  amberDim:'rgba(245,158,11,0.12)',
  coral:   '#F43F5E',
  coralDim:'rgba(244,63,94,0.12)',
  emerald: '#10B981',
  emeraldDim:'rgba(16,185,129,0.12)',
  white:   '#F1F0FF',
  off:     '#A8A8B8',
  muted:   '#52525B',
  border:  '#27273A',
};

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🛍️', color: '#10B981' },
  { id: 'electronics', label: 'Electronics', emoji: '🔌', color: '#6366F1' },
  { id: 'phones and tablets', label: 'Phones & Tablets', emoji: '📱', color: '#8B5CF6' },
  { id: 'computers and laptops', label: 'Computers', emoji: '💻', color: '#3B82F6' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮', color: '#EC4899' },
  { id: 'fashion', label: 'Fashion', emoji: '👗', color: '#F43F5E' },
  { id: 'books-course-materials', label: 'Books', emoji: '📚', color: '#F59E0B' },
  { id: 'hostel-items', label: 'Hostel', emoji: '🏠', color: '#10B981' },
  { id: 'appliances', label: 'Appliances', emoji: '🔧', color: '#06B6D4' },
  { id: 'furniture', label: 'Furniture', emoji: '🪑', color: '#84CC16' },
  { id: 'beauty and grooming', label: 'Beauty', emoji: '💄', color: '#EC4899' },
  { id: 'sports and fitness', label: 'Sports', emoji: '⚽', color: '#14B8A6' },
  { id: 'food and drinks', label: 'Food & Drinks', emoji: '🍕', color: '#F97316' },
  { id: 'services', label: 'Services', emoji: '🛠️', color: '#6366F1' },
  { id: 'other', label: 'Other', emoji: '📦', color: '#71717A' },
];

const CAMPUS_OPTIONS = [
  { id: '', label: 'All Campuses' },
  { id: 'UG', label: 'University of Ghana' },
  { id: 'KNUST', label: 'KNUST' },
  { id: 'UCC', label: 'Univ. of Cape Coast' },
  { id: 'ASHESI', label: 'Ashesi University' },
  { id: 'GIMPA', label: 'GIMPA' },
  { id: 'UEW', label: 'Univ. of Education' },
  { id: 'UPSA', label: 'UPSA' },
  { id: 'ATU', label: 'Accra Technical Univ.' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
  { id: 'popular', label: 'Most Popular' },
];

const CONDITION_OPTIONS = [
  { id: '', label: 'Any Condition' },
  { id: 'new', label: 'Brand New' },
  { id: 'like-new', label: 'Like New' },
  { id: 'excellent', label: 'Excellent' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
  { id: 'slightly-used', label: 'Slightly Used' },
];

const fmtPrice = (p) =>
  p == null ? '—' : `GH₵\u00A0${Number(p).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard({ viewMode }) {
  return (
    <div className={`list-card-skel ${viewMode === 'list' ? 'list-view' : ''}`}>
      <div className="skel-img" />
      <div className="skel-info">
        <div className="skel-line" style={{ width: '60%' }} />
        <div className="skel-line" style={{ width: '90%' }} />
        <div className="skel-line" style={{ width: '40%', height: 20 }} />
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, viewMode }) {
  const img = product.images?.[0] || product.image || null;
  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100)
    : null;

  if (viewMode === 'list') {
    return (
      <Link href={`/product/${product._id}`} className="list-card-h">
        <div className="list-card-img-wrap">
          {img ? (
            <img src={img} alt={product.name} onError={e => { e.target.src = 'https://placehold.co/400x300/13131E/52525B?text=No+Image'; }} />
          ) : (
            <div className="list-card-img-placeholder">📦</div>
          )}
          {isOnSale && <span className="list-card-badge">-{discountPct}%</span>}
        </div>
        <div className="list-card-content">
          <div className="list-card-top">
            <h3 className="list-card-name">{product.name}</h3>
            <span className="list-card-cat">{product.category?.replace(/-/g, ' ') || 'Other'}</span>
          </div>
          <div className="list-card-meta">
            {product.campus && <span className="list-card-campus">📍 {product.campus}</span>}
            {product.condition && <span className="list-card-cond">{product.condition}</span>}
            {product.negotiable && <span className="list-card-nego">Nego</span>}
          </div>
          <div className="list-card-bottom">
            <div>
              {isOnSale && <span className="list-card-original">{fmtPrice(product.discountInfo.originalPrice)}</span>}
              <span className={`list-card-price ${isOnSale ? 'sale' : ''}`}>{fmtPrice(product.price)}</span>
            </div>
            <span className="list-card-view">View →</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product._id}`} className="grid-card">
      <div className="grid-card-img-wrap">
        {img ? (
          <img src={img} alt={product.name} onError={e => { e.target.src = 'https://placehold.co/400x300/13131E/52525B?text=No+Image'; }} />
        ) : (
          <div className="grid-card-img-placeholder">📦</div>
        )}
        {isOnSale && <span className="grid-card-badge">-{discountPct}%</span>}
        {product.condition && !isOnSale && <span className="grid-card-cond-badge">{product.condition}</span>}
        {product.negotiable && <span className="grid-card-nego-badge">Nego</span>}
      </div>
      <div className="grid-card-info">
        <p className="grid-card-name">{product.name}</p>
        <div className="grid-card-meta">
          {product.campus && <span className="grid-card-campus">{product.campus}</span>}
        </div>
        <div className="grid-card-footer">
          <div>
            {isOnSale && <span className="grid-card-original">{fmtPrice(product.discountInfo.originalPrice)}</span>}
            <span className={`grid-card-price ${isOnSale ? 'sale' : ''}`}>{fmtPrice(product.price)}</span>
          </div>
          <span className="grid-card-view">View</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Loading Fallback ──────────────────────────────────────────────────────────
function ListingsFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #27273A',
        borderTopColor: '#10B981',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#52525B', fontFamily: 'sans-serif', fontSize: '14px' }}>
        Loading listings...
      </p>
    </div>
  );
}

// ─── Listings Content (uses useSearchParams) ───────────────────────────────────
function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const searchInputRef = useRef(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    const cat = searchParams.get('category');
    const camp = searchParams.get('campus');
    const q = searchParams.get('q');
    if (cat) setSelectedCategory(cat);
    if (camp) setSelectedCampus(camp);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const fetchProducts = useCallback(async (page = 1, append = false) => {
    fetchIdRef.current += 1;
    const myId = fetchIdRef.current;

    if (!append) setLoading(true);

    try {
      const params = {
        limit: 20,
        page,
        sort: selectedSort,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedCampus && { campus: selectedCampus }),
        ...(selectedCondition && { condition: selectedCondition }),
        ...(negotiableOnly && { negotiable: true }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      };

      let res;
      if (searchQuery.trim()) {
        res = await searchProducts(searchQuery.trim());
      } else if (selectedCategory !== 'all') {
        const { getProductsByCategory } = await import('@/apis/productApi');
        res = await getProductsByCategory(selectedCategory, params);
      } else {
        res = await getAllProducts(params);
      }

      if (myId !== fetchIdRef.current) return;

      const data = res?.data?.data?.products || 
                   res?.data?.data?.data || 
                   res?.data?.products || 
                   res?.data?.data || 
                   res?.data || 
                   [];
      
      const productsList = Array.isArray(data) ? data : [];
      setProducts(append ? prev => [...prev, ...productsList] : productsList);
      setTotalProducts(res?.data?.total || res?.data?.pagination?.total || productsList.length);
      setHasMore(res?.data?.pagination?.hasNextPage || false);
      setCurrentPage(page);
    } catch (err) {
      console.error('Fetch error:', err);
      if (!append) setProducts([]);
    } finally {
      if (myId === fetchIdRef.current) setLoading(false);
    }
  }, [selectedCategory, selectedCampus, selectedSort, selectedCondition, negotiableOnly, minPrice, maxPrice, searchQuery]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedCampus('');
    setSelectedSort('newest');
    setSelectedCondition('');
    setNegotiableOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const activeFilterCount = [selectedCampus, selectedCondition, negotiableOnly, minPrice, maxPrice].filter(Boolean).length;

  return (
    <>
      <style>{listingsStyles}</style>
      <div className="l-page">
        {/* Header */}
        <div className="l-header">
          <div className="l-header-inner">
            <Link href="/" className="l-back-btn">← Back</Link>
            <h1 className="l-title">Browse Listings</h1>
            <span className="l-count">{totalProducts.toLocaleString()} items</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="l-search-bar">
          <form onSubmit={handleSearch} className="l-search-form">
            <input
              ref={searchInputRef}
              type="text"
              className="l-search-input"
              placeholder="Search listings, brands…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="l-search-btn">Search</button>
            {searchQuery && (
              <button type="button" className="l-search-clear" onClick={() => { setSearchQuery(''); fetchProducts(1); }}>
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Category Tabs */}
        <div className="l-cat-strip">
          <div className="l-cat-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`l-cat-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={selectedCategory === cat.id ? { '--cat-color': cat.color } : {}}
              >
                <span className="l-cat-emoji">{cat.emoji}</span>
                <span className="l-cat-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="l-toolbar">
          <div className="l-toolbar-left">
            <select
              className="l-select"
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
            >
              {CAMPUS_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            <select
              className="l-select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            <button
              className={`l-filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          <div className="l-toolbar-right">
            <div className="l-view-toggle">
              <button
                className={`l-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ▦
              </button>
              <button
                className={`l-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="l-filters-panel">
            <div className="l-filters-grid">
              <div className="l-filter-group">
                <label className="l-filter-label">Condition</label>
                <select
                  className="l-select"
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                >
                  {CONDITION_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="l-filter-group">
                <label className="l-filter-label">Price Range (GH₵)</label>
                <div className="l-price-inputs">
                  <input
                    type="number"
                    className="l-price-input"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="l-price-dash">–</span>
                  <input
                    type="number"
                    className="l-price-input"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="l-filter-group">
                <label className="l-filter-label">Options</label>
                <label className="l-toggle">
                  <input
                    type="checkbox"
                    checked={negotiableOnly}
                    onChange={(e) => setNegotiableOnly(e.target.checked)}
                  />
                  <span className="l-toggle-slider" />
                  <span className="l-toggle-text">Negotiable Only</span>
                </label>
              </div>
            </div>

            <div className="l-filters-actions">
              <button className="l-clear-btn" onClick={clearFilters}>Clear All Filters</button>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {(selectedCampus || selectedCondition || negotiableOnly || minPrice || maxPrice) && (
          <div className="l-active-filters">
            {selectedCampus && (
              <span className="l-chip">
                📍 {selectedCampus}
                <button onClick={() => setSelectedCampus('')}>✕</button>
              </span>
            )}
            {selectedCondition && (
              <span className="l-chip">
                {CONDITION_OPTIONS.find(c => c.id === selectedCondition)?.label}
                <button onClick={() => setSelectedCondition('')}>✕</button>
              </span>
            )}
            {negotiableOnly && (
              <span className="l-chip">
                Negotiable
                <button onClick={() => setNegotiableOnly(false)}>✕</button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="l-chip">
                GH₵{minPrice || '0'} – {maxPrice || '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Products */}
        <div className="l-products-area">
          {loading && products.length === 0 ? (
            <div className={`l-products-${viewMode}`}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} viewMode={viewMode} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="l-empty">
              <div className="l-empty-icon">🔍</div>
              <h3>No listings found</h3>
              <p>{searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}</p>
              <button className="l-clear-btn" onClick={clearFilters}>Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className={`l-products-${viewMode}`}>
                {products.map(product => (
                  <ProductCard key={product._id} product={product} viewMode={viewMode} />
                ))}
              </div>

              {hasMore && !loading && (
                <div className="l-load-more-wrap">
                  <button className="l-load-more-btn" onClick={() => fetchProducts(currentPage + 1, true)}>
                    Load More Listings ↓
                  </button>
                </div>
              )}

              {loading && products.length > 0 && (
                <div className="l-loading-more">
                  <div className="l-spinner" />
                  <span>Loading more...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Exported Page ────────────────────────────────────────────────────────
export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsFallback />}>
      <ListingsContent />
    </Suspense>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const listingsStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .l-page {
    min-height: 100vh;
    background: ${C.void};
    color: ${C.white};
    overflow-x: hidden;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .l-header {
    background: ${C.surf};
    border-bottom: 1px solid ${C.border};
    padding: 14px 24px;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .l-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .l-back-btn {
    color: ${C.off};
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: color .2s;
  }
  .l-back-btn:hover { color: ${C.white}; }
  .l-title {
    font-size: 18px;
    font-weight: 800;
    flex: 1;
  }
  .l-count {
    font-size: 13px;
    color: ${C.muted};
    font-family: 'JetBrains Mono', monospace;
  }

  .l-search-bar {
    background: ${C.surf};
    padding: 12px 24px;
    border-bottom: 1px solid ${C.border};
  }
  .l-search-form {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    gap: 10px;
  }
  .l-search-input {
    flex: 1;
    background: ${C.elev};
    border: 1.5px solid ${C.border};
    border-radius: 14px;
    padding: 12px 18px;
    color: ${C.white};
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: all .2s;
  }
  .l-search-input:focus {
    border-color: ${C.emerald};
    box-shadow: 0 0 0 3px rgba(16,185,129,.1);
  }
  .l-search-input::placeholder { color: ${C.muted}; }
  .l-search-btn {
    background: linear-gradient(135deg, ${C.emerald}, #34D399);
    color: #000;
    font-weight: 700;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all .2s;
    white-space: nowrap;
  }
  .l-search-btn:hover { filter: brightness(1.1); }
  .l-search-clear {
    background: none;
    border: none;
    color: ${C.muted};
    cursor: pointer;
    font-size: 16px;
    padding: 0 8px;
  }

  .l-cat-strip {
    background: ${C.surf};
    border-bottom: 1px solid ${C.border};
    padding: 10px 0;
    overflow: hidden;
  }
  .l-cat-scroll {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 0 24px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .l-cat-scroll::-webkit-scrollbar { display: none; }
  .l-cat-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 40px;
    border: 1.5px solid ${C.border};
    background: none;
    color: ${C.off};
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all .2s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    flex-shrink: 0;
  }
  .l-cat-tab:hover {
    border-color: ${C.indigoL};
    color: ${C.white};
  }
  .l-cat-tab.active {
    background: var(--cat-color, ${C.emerald});
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 16px rgba(0,0,0,.25);
  }
  .l-cat-emoji { font-size: 16px; }
  .l-cat-label { font-size: 12.5px; }

  .l-toolbar {
    max-width: 1280px;
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .l-toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .l-toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .l-select {
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 8px 32px 8px 12px;
    color: ${C.white};
    font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2352525B' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }
  .l-filter-btn {
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 8px 14px;
    color: ${C.off};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all .2s;
  }
  .l-filter-btn:hover { border-color: ${C.indigoL}; color: ${C.white}; }
  .l-filter-btn.active {
    background: ${C.indigoDim};
    border-color: ${C.indigoL};
    color: ${C.indigoL};
  }
  .l-view-toggle {
    display: flex;
    background: ${C.elev};
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid ${C.border};
  }
  .l-view-btn {
    background: none;
    border: none;
    padding: 8px 12px;
    color: ${C.muted};
    cursor: pointer;
    font-size: 16px;
    transition: all .2s;
  }
  .l-view-btn.active {
    background: ${C.indigo};
    color: #fff;
  }

  .l-filters-panel {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px 16px;
    border-bottom: 1px solid ${C.border};
  }
  .l-filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 12px;
  }
  .l-filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .l-filter-label {
    font-size: 11px;
    font-weight: 700;
    color: ${C.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .l-price-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .l-price-input {
    flex: 1;
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 8px;
    padding: 8px 12px;
    color: ${C.white};
    font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    width: 100%;
  }
  .l-price-dash { color: ${C.muted}; }
  .l-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  .l-toggle input { display: none; }
  .l-toggle-slider {
    width: 44px;
    height: 24px;
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 12px;
    position: relative;
    transition: all .2s;
  }
  .l-toggle-slider::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    background: ${C.muted};
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: all .2s;
  }
  .l-toggle input:checked + .l-toggle-slider {
    background: ${C.emerald};
    border-color: ${C.emerald};
  }
  .l-toggle input:checked + .l-toggle-slider::after {
    background: #fff;
    left: 22px;
  }
  .l-toggle-text { font-size: 13px; color: ${C.off}; }
  .l-filters-actions {
    display: flex;
    gap: 10px;
  }
  .l-clear-btn {
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 8px 16px;
    color: ${C.coral};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all .2s;
  }
  .l-clear-btn:hover {
    background: ${C.coralDim};
    border-color: ${C.coral};
  }

  .l-active-filters {
    max-width: 1280px;
    margin: 0 auto;
    padding: 10px 24px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .l-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: ${C.indigoDim};
    border: 1px solid ${C.indigoL}30;
    color: ${C.indigoL};
    font-size: 11px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 20px;
  }
  .l-chip button {
    background: none;
    border: none;
    color: ${C.indigoL};
    cursor: pointer;
    font-size: 10px;
    padding: 0;
  }

  .l-products-area {
    max-width: 1280px;
    margin: 0 auto;
    padding: 16px 24px 60px;
  }
  .l-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }
  .l-products-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  @media (max-width: 480px) {
    .l-products-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  .grid-card {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 14px;
    overflow: hidden;
    text-decoration: none;
    transition: all .2s;
    display: flex;
    flex-direction: column;
  }
  .grid-card:hover {
    border-color: ${C.indigoL};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,.3);
  }
  .grid-card-img-wrap {
    position: relative;
    aspect-ratio: 1;
    background: ${C.elev};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .grid-card-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .grid-card-img-placeholder { font-size: 36px; }
  .grid-card-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: ${C.coral};
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    padding: 3px 7px;
    border-radius: 6px;
  }
  .grid-card-cond-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: ${C.elev};
    color: ${C.off};
    font-size: 9px;
    font-weight: 700;
    padding: 3px 7px;
    border-radius: 6px;
    text-transform: capitalize;
    border: 1px solid ${C.border};
  }
  .grid-card-nego-badge {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: ${C.amberDim};
    color: ${C.amber};
    font-size: 9px;
    font-weight: 700;
    padding: 3px 7px;
    border-radius: 6px;
    border: 1px solid rgba(245,158,11,.25);
  }
  .grid-card-info {
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
  .grid-card-name {
    font-size: 13px;
    font-weight: 700;
    color: ${C.white};
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .grid-card-meta { display: flex; gap: 6px; flex-wrap: wrap; }
  .grid-card-campus {
    font-size: 10px;
    font-weight: 600;
    color: ${C.indigoL};
    background: ${C.indigoDim};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
  }
  .grid-card-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: auto;
  }
  .grid-card-price {
    font-size: 16px;
    font-weight: 800;
    color: ${C.amber};
    font-family: 'JetBrains Mono', monospace;
    display: block;
  }
  .grid-card-price.sale { color: ${C.coral}; }
  .grid-card-original {
    font-size: 11px;
    color: ${C.muted};
    text-decoration: line-through;
    font-family: 'JetBrains Mono', monospace;
    display: block;
  }
  .grid-card-view {
    font-size: 11px;
    font-weight: 700;
    background: ${C.indigoDim};
    color: ${C.indigoL};
    padding: 5px 10px;
    border-radius: 8px;
    border: 1px solid ${C.indigo}20;
    white-space: nowrap;
  }

  .list-card-h {
    display: flex;
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 14px;
    overflow: hidden;
    text-decoration: none;
    transition: all .2s;
  }
  .list-card-h:hover {
    border-color: ${C.indigoL};
    box-shadow: 0 4px 16px rgba(0,0,0,.2);
  }
  .list-card-img-wrap {
    width: 140px;
    min-height: 140px;
    background: ${C.elev};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  .list-card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .list-card-img-placeholder { font-size: 32px; }
  .list-card-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: ${C.coral};
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    padding: 3px 7px;
    border-radius: 6px;
  }
  .list-card-content {
    flex: 1;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .list-card-top { display: flex; justify-content: space-between; gap: 8px; }
  .list-card-name {
    font-size: 14px;
    font-weight: 700;
    color: ${C.white};
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .list-card-cat { font-size: 10px; color: ${C.muted}; white-space: nowrap; text-transform: capitalize; }
  .list-card-meta { display: flex; gap: 6px; flex-wrap: wrap; }
  .list-card-campus {
    font-size: 10px;
    font-weight: 600;
    color: ${C.indigoL};
    background: ${C.indigoDim};
    padding: 2px 6px;
    border-radius: 4px;
  }
  .list-card-cond {
    font-size: 10px;
    font-weight: 600;
    color: ${C.off};
    background: ${C.elev};
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: capitalize;
  }
  .list-card-nego {
    font-size: 10px;
    font-weight: 700;
    color: ${C.amber};
    background: ${C.amberDim};
    padding: 2px 6px;
    border-radius: 4px;
  }
  .list-card-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: auto;
  }
  .list-card-price {
    font-size: 18px;
    font-weight: 800;
    color: ${C.amber};
    font-family: 'JetBrains Mono', monospace;
    display: block;
  }
  .list-card-price.sale { color: ${C.coral}; }
  .list-card-original {
    font-size: 12px;
    color: ${C.muted};
    text-decoration: line-through;
    font-family: 'JetBrains Mono', monospace;
    display: block;
  }
  .list-card-view {
    font-size: 12px;
    font-weight: 700;
    background: ${C.indigoDim};
    color: ${C.indigoL};
    padding: 6px 12px;
    border-radius: 8px;
  }

  .list-card-skel {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 14px;
    overflow: hidden;
  }
  .list-card-skel.list-view { display: flex; }
  .list-card-skel.list-view .skel-img { width: 140px; min-height: 140px; flex-shrink: 0; }
  .skel-img {
    aspect-ratio: 1;
    background: ${C.elev};
    animation: shimmer 1.8s ease-in-out infinite;
    background: linear-gradient(90deg, ${C.surf} 25%, ${C.elev} 50%, ${C.surf} 75%);
    background-size: 400% 100%;
  }
  .skel-info { padding: 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .skel-line {
    height: 12px;
    border-radius: 6px;
    animation: shimmer 1.8s ease-in-out infinite;
    background: linear-gradient(90deg, ${C.surf} 25%, ${C.elev} 50%, ${C.surf} 75%);
    background-size: 400% 100%;
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .l-empty { text-align: center; padding: 60px 20px; }
  .l-empty-icon { font-size: 56px; margin-bottom: 16px; }
  .l-empty h3 { font-size: 20px; margin-bottom: 8px; }
  .l-empty p { color: ${C.muted}; margin-bottom: 20px; }

  .l-load-more-wrap { display: flex; justify-content: center; padding: 24px 0; }
  .l-load-more-btn {
    background: ${C.surf};
    border: 1.5px solid ${C.border};
    color: ${C.off};
    font-weight: 600;
    font-size: 14px;
    padding: 12px 28px;
    border-radius: 12px;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all .2s;
  }
  .l-load-more-btn:hover { border-color: ${C.emerald}; color: ${C.emerald}; }
  .l-loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    color: ${C.muted};
    font-size: 13px;
  }
  .l-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid ${C.border};
    border-top-color: ${C.emerald};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .l-header { padding: 10px 16px; }
    .l-search-bar { padding: 10px 16px; }
    .l-cat-scroll { padding: 0 16px; }
    .l-toolbar { padding: 10px 16px; }
    .l-products-area { padding: 12px 16px 40px; }
  }
  @media (max-width: 480px) {
    .list-card-img-wrap { width: 100px; min-height: 100px; }
    .list-card-content { padding: 10px; }
  }
`;