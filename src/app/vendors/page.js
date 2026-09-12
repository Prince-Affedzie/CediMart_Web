// src/app/vendors/page.js
'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, MapPin, X, ChevronDown, ChevronRight, Star,
  Store, Shield, ShieldCheck, CheckCircle2, Sparkles,
  ShoppingBag, MessageCircle, Grid, ArrowUpDown, TrendingUp,
  Clock, Heart, Package, Filter,
  Cpu, Smartphone, Laptop, Gamepad2, Shirt, BookOpen, Bed,
  Tv, Armchair, Dumbbell, Watch, UtensilsCrossed, Wrench,
  GraduationCap, Camera, Palette, Hammer, Home, Ticket, Bike,
  Ellipsis, Layers, Store as StoreIcon,
} from 'lucide-react';
import { getVendors } from '@/apis/vendorApi';

import './vendors.css';

const PAGE_LIMIT = 16;
const SEARCH_DEBOUNCE_MS = 400;

// ─── Category meta (mirrors mobile DiscoverScreen) ──────────────────────────
const CATEGORY_META = {
  '':                          { label: 'All',              Icon: Grid },
  'electronics':                { label: 'Electronics',      Icon: Cpu },
  'phones and tablets':         { label: 'Phones & Tablets', Icon: Smartphone },
  'computers and laptops':      { label: 'Computers',        Icon: Laptop },
  'gaming':                     { label: 'Gaming',            Icon: Gamepad2 },
  'fashion':                    { label: 'Fashion',           Icon: Shirt },
  'books-course-materials':     { label: 'Books',             Icon: BookOpen },
  'hostel-items':               { label: 'Hostel Items',      Icon: Bed },
  'appliances':                 { label: 'Appliances',        Icon: Tv },
  'furniture':                  { label: 'Furniture',         Icon: Armchair },
  'beauty and grooming':        { label: 'Beauty',            Icon: Sparkles },
  'sports and fitness':         { label: 'Sports',            Icon: Dumbbell },
  'accessories':                { label: 'Accessories',       Icon: Watch },
  'food and drinks':            { label: 'Food & Drinks',     Icon: UtensilsCrossed },
  'services':                   { label: 'Services',          Icon: Wrench },
  'tutoring-education':         { label: 'Tutoring',          Icon: GraduationCap },
  'photography-media':          { label: 'Photography',       Icon: Camera },
  'graphic-design-printing':    { label: 'Design & Print',    Icon: Palette },
  'repair-services':            { label: 'Repairs',           Icon: Hammer },
  'events-catering':            { label: 'Events & Catering', Icon: UtensilsCrossed },
  'accommodation-housing':      { label: 'Housing',           Icon: Home },
  'tickets and events':         { label: 'Tickets',           Icon: Ticket },
  'transport and logistics':    { label: 'Transport',         Icon: Bike },
  'other':                      { label: 'Other',             Icon: Ellipsis },
};
const CATEGORIES = Object.keys(CATEGORY_META).map((key) => ({ key, ...CATEGORY_META[key] }));

const BUSINESS_TYPE_FILTERS = [
  { key: '',        label: 'All',      Icon: Layers },
  { key: 'product', label: 'Shops',    Icon: StoreIcon },
  { key: 'service', label: 'Services', Icon: Wrench },
];

const CAMPUSES = [
  { key: '',        label: 'All campuses' },
  { key: 'UG',      label: 'University of Ghana' },
  { key: 'KNUST',   label: 'KNUST' },
  { key: 'UCC',     label: 'Univ. of Cape Coast' },
  { key: 'UEW',     label: 'Univ. of Ed., Winneba' },
  { key: 'UPSA',    label: 'UPSA' },
  { key: 'GIMPA',   label: 'GIMPA' },
  { key: 'ASHESI',  label: 'Ashesi University' },
  { key: 'ATU',     label: 'Accra Technical Univ.' },
  { key: 'OTHER',   label: 'Other' },
];

const SORT_OPTIONS = [
  { key: 'createdAt',  order: 'desc', label: 'Newest first',    Icon: Clock },
  { key: 'rating',     order: 'desc', label: 'Top rated',       Icon: Star },
  { key: 'totalSales', order: 'desc', label: 'Most sales',      Icon: TrendingUp },
];

// Small scattered icon set used purely for the hero's decorative mosaic —
// picked to read as "campus marketplace" rather than generic ecommerce.
const HERO_MOSAIC_ICONS = [
  { Icon: BookOpen,        className: 'm1' },
  { Icon: Smartphone,      className: 'm2' },
  { Icon: UtensilsCrossed, className: 'm3' },
  { Icon: Shirt,           className: 'm4' },
  { Icon: Bike,            className: 'm5' },
];

const isRealImageUrl = (val) => !!val && /^https?:\/\//i.test(val);

// ─── Vendor Card ────────────────────────────────────────────────────────────
function VendorCard({ vendor }) {
  const hasAvatar = isRealImageUrl(vendor.profileImage);
  const displayName = vendor.storeName || vendor.name;
  const campusLabel = CAMPUSES.find((c) => c.key === vendor.campus)?.label || vendor.campus;
  const areaLabel = vendor.location?.campusArea;
  const locationLine = [areaLabel, campusLabel].filter(Boolean).join(', ') || 'Campus not set';
  const primaryCategory = vendor.categories?.[0];
  const categoryMeta = CATEGORY_META[primaryCategory] || CATEGORY_META.other;
  const PrimaryIcon = categoryMeta.Icon;
  const categoryLine = (vendor.categories || [])
    .slice(0, 2)
    .map((c) => CATEGORY_META[c]?.label)
    .filter(Boolean)
    .join(' & ') || categoryMeta.label;
  const isServiceOnly = vendor.businessType === 'service';
  const products = vendor.products || [];
  const shownProducts = products.slice(0, 3);
  const extraCount = Math.max(0, (vendor.productCount ?? products.length) - shownProducts.length);
  const totalSlots = shownProducts.length + (extraCount > 0 ? 1 : 0);

  return (
    <Link href={`/vendors/${vendor._id}`} className="vd-card">
      <div className="vd-card-top">
        {hasAvatar ? (
          <img src={vendor.profileImage} alt={displayName} className="vd-card-avatar" />
        ) : (
          <div
            className="vd-card-avatar vd-card-avatar-ph"
            style={{
              background: `color-mix(in srgb, ${categoryMeta.color || '#0D9488'} 12%, white)`,
              color: categoryMeta.color || '#0D9488',
            }}
          >
            {displayName?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}

        <div className="vd-card-info">
          <div className="vd-card-name-row">
            <h3 className="vd-card-name" title={displayName}>{displayName}</h3>
            {vendor.isVerified && (
              <span className="vd-card-verified-icon" title="Verified vendor">
                <CheckCircle2 size={14} strokeWidth={2.4} />
              </span>
            )}
          </div>
          <p className="vd-card-category" title={categoryLine}>
            <PrimaryIcon size={11} strokeWidth={2.2} />
            <span>{categoryLine}</span>
          </p>
          <div className="vd-card-meta">
            <span className="vd-card-meta-item vd-card-meta-rating">
              <Star size={11} fill="currentColor" strokeWidth={0} />
              <strong>{vendor.rating?.toFixed(1) || '0.0'}</strong>
              {!!vendor.reviewCount && <span className="vd-card-meta-count">({vendor.reviewCount})</span>}
            </span>
            <span className="vd-card-meta-dot">·</span>
            <span className="vd-card-meta-item vd-card-meta-location" title={locationLine}>
              <MapPin size={11} strokeWidth={2.2} />
              <span>{locationLine}</span>
            </span>
          </div>
        </div>

        <div className="vd-card-right">
          {vendor.isVerified && (
            <span className="vd-card-badge">
              <ShieldCheck size={11} strokeWidth={2.4} />
              Verified
            </span>
          )}
          <ChevronRight size={16} className="vd-card-chevron" strokeWidth={2.2} />
        </div>
      </div>

      {/* Product strip / service cue */}
      {isServiceOnly ? (
        <div className="vd-card-service-cue">
          <MessageCircle size={13} strokeWidth={2.2} />
          <span>
            {vendor.openingHours ? `Message to book · ${vendor.openingHours}` : 'Message to book'}
          </span>
        </div>
      ) : shownProducts.length > 0 ? (
        <div className="vd-card-thumbs">
          {shownProducts.map((p, i) =>
            isRealImageUrl(p.images?.[0] || p.image) ? (
              <div key={p._id || i} className="vd-card-thumb">
                <img src={p.images?.[0] || p.image} alt={p.name || 'Product'} loading="lazy" />
              </div>
            ) : (
              <div key={p._id || i} className="vd-card-thumb vd-card-thumb-ph">
                <Package size={18} strokeWidth={1.6} />
              </div>
            )
          )}
          {extraCount > 0 && (
            <div className="vd-card-thumb vd-card-thumb-more">
              <span>+{extraCount}</span>
            </div>
          )}
          {/* Fill remaining slots with subtle placeholders for consistent card height */}
          {totalSlots < 3 &&
            Array.from({ length: 3 - totalSlots }).map((_, i) => (
              <div key={`empty-${i}`} className="vd-card-thumb vd-card-thumb-empty" />
            ))}
        </div>
      ) : null}
    </Link>
  );
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonVendorCard() {
  return (
    <div className="vd-card vd-sk-card">
      <div className="vd-card-top">
        <div className="vd-sk-avatar" />
        <div className="vd-card-info">
          <div className="vd-sk-line" style={{ width: '65%', height: 14 }} />
          <div className="vd-sk-line" style={{ width: '45%', height: 11, marginTop: 8 }} />
          <div className="vd-sk-line" style={{ width: '55%', height: 11, marginTop: 8 }} />
        </div>
      </div>
      <div className="vd-card-thumbs">
        {[0, 1, 2].map((i) => (
          <div key={i} className="vd-sk-thumb" />
        ))}
      </div>
    </div>
  );
}

// ─── Loading fallback for the Suspense boundary ────────────────────────────
// Shown for the brief moment before useSearchParams can resolve on the client.
// Keeping the hero + stats strip static here means there's no layout jump
// once VendorsPageContent takes over.
function VendorsPageSkeleton() {
  return (
    <div className="vd-page">
      <VendorsHero />
      <VendorsStatsStrip stats={null} />
      <main className="vd-main">
        <div className="vd-grid">
          {[...Array(8)].map((_, i) => <SkeletonVendorCard key={i} />)}
        </div>
      </main>
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function VendorsHero() {
  return (
    <section className="vd-hero">
      <div className="vd-hero-inner">
        <div className="vd-hero-copy">
          <div className="vd-hero-badge">
            <Shield size={13} strokeWidth={2.4} />
            <span>Verified vendors</span>
          </div>
          <h1 className="vd-hero-title">
            Trusted shops, run by
            <br />
            students like you
          </h1>
          <p className="vd-hero-sub">
            Buy and book from vendors on your own campus — every one of them
            a fellow student.
          </p>
        </div>

        <div className="vd-hero-visual" aria-hidden="true">
          <div className="vd-hero-orb" />
          {HERO_MOSAIC_ICONS.map(({ Icon, className }, i) => (
            <div key={i} className={`vd-hero-chip ${className}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats strip (kept separate from the hero, per design direction) ──────
function VendorsStatsStrip({ stats }) {
  const items = [
    { label: 'Active vendors', value: stats?.totalVendors != null ? stats.totalVendors.toLocaleString() : null },
    { label: 'Categories', value: String(CATEGORIES.length - 1) },
    { label: 'Campuses', value: String(CAMPUSES.length - 1) },
  ];

  return (
    <section className="vd-stats-strip">
      <div className="vd-stats-inner">
        {items.map((item, i) => (
          <div className="vd-stat" key={item.label}>
            <span className="vd-stat-value">{item.value ?? '—'}</span>
            <span className="vd-stat-label">{item.label}</span>
            {i < items.length - 1 && <span className="vd-stat-divider" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function VendorsPage() {
  return (
    <Suspense fallback={<VendorsPageSkeleton />}>
      <VendorsPageContent />
    </Suspense>
  );
}

function VendorsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [hasMore, setHasMore] = useState(true);

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [businessType, setBusinessType] = useState(searchParams.get('type') || '');
  const [campus, setCampus] = useState(searchParams.get('campus') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === '1');
  const [sort, setSort] = useState(
    SORT_OPTIONS.find((s) => s.key === searchParams.get('sort')) || SORT_OPTIONS[0]
  );

  const [showBusinessSheet, setShowBusinessSheet] = useState(false);
  const [showCampusSheet, setShowCampusSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);

  // ── Sync to URL ─────────────────────────────────────────────────────────
  const syncURL = useCallback((overrides = {}) => {
    const next = { q: search, type: businessType, campus, category, verified: verifiedOnly ? '1' : '', sort: sort.key, page, ...overrides };
    const qs = new URLSearchParams();
    if (next.q) qs.set('q', next.q);
    if (next.type) qs.set('type', next.type);
    if (next.campus) qs.set('campus', next.campus);
    if (next.category) qs.set('category', next.category);
    if (next.verified === '1') qs.set('verified', '1');
    if (next.sort && next.sort !== 'createdAt') qs.set('sort', next.sort);
    if (next.page && next.page !== 1) qs.set('page', next.page);
    router.replace(`/vendors${qs.toString() ? `?${qs}` : ''}`, { scroll: false });
  }, [search, businessType, campus, category, verifiedOnly, sort, page, router]);

  // ── Debounced search ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch vendors ───────────────────────────────────────────────────────
  const fetchVendors = useCallback(async (pageNum = 1, { append = false } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await getVendors({
        search: search || undefined,
        campus: campus || undefined,
        category: category || undefined,
        businessType: businessType || undefined,
        isVerified: verifiedOnly ? true : undefined,
        sortBy: sort.key,
        order: sort.order,
        page: pageNum,
        limit: PAGE_LIMIT,
      });

      const body = res?.data || {};
      const newVendors = body.data || [];
      const pagination = body.pagination || {};

      setVendors((prev) => (append ? [...prev, ...newVendors] : newVendors));
      setHasMore(!!pagination.hasMore);
      setPage(pageNum);
      setStats(body.stats || null);
    } catch (err) {
      console.error('Vendors fetch error:', err?.response?.data?.error || err.message);
      if (!append) setVendors([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, campus, category, businessType, verifiedOnly, sort]);

  useEffect(() => { fetchVendors(1); syncURL({ page: 1 }); }, [search, campus, category, businessType, verifiedOnly, sort]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) fetchVendors(page + 1, { append: true });
  };

  const resetAllFilters = () => {
    setBusinessType('');
    setCampus('');
    setCategory('');
    setVerifiedOnly(false);
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const activeFilterCount = [campus, category, verifiedOnly, businessType].filter(Boolean).length;
  const selectedCampusLabel = CAMPUSES.find((c) => c.key === campus)?.label || 'Campus';
  const sectionLabel = businessType === 'service' ? 'Services' : businessType === 'product' ? 'Shops' : 'All vendors';

  return (
    <div className="vd-page">
      <VendorsHero />
      <VendorsStatsStrip stats={stats} />

      {/* ── Controls ── */}
      <div className="vd-controls">
        {/* Row 1: title + business type dropdown */}
        <div className="vd-controls-title-row">
          <div>
            <h2 className="vd-section-title">Discover vendors</h2>
            <p className="vd-section-sub">Shops and services across your campus</p>
          </div>
          <button
            className="vd-biz-dropdown"
            onClick={() => setShowBusinessSheet(true)}
            aria-label="Filter by business type"
          >
            {(() => {
              const active = BUSINESS_TYPE_FILTERS.find((f) => f.key === businessType);
              const ActiveIcon = active?.Icon;
              return (
                <>
                  {ActiveIcon && <ActiveIcon size={13} strokeWidth={2.4} />}
                  <span>{active?.label || 'All'}</span>
                  <ChevronDown size={14} strokeWidth={2.4} />
                </>
              );
            })()}
          </button>
        </div>

        {/* Row 2: search */}
        <div className="vd-search-bar">
          <Search size={17} strokeWidth={2.2} />
          <input
            className="vd-search-input"
            placeholder="Search vendors, tags, campus area…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search vendors"
          />
          {searchInput && (
            <button
              className="vd-search-clear"
              onClick={() => { setSearchInput(''); setSearch(''); }}
              aria-label="Clear search"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Row 3: category tiles */}
        <div className="vd-cat-strip">
          <div className="vd-cat-scroll">
            {CATEGORIES.map((item) => {
              const Icon = item.Icon;
              const isActive = category === item.key;
              return (
                <button
                  key={item.key || 'all'}
                  className={`vd-cat-tile ${isActive ? 'active' : ''}`}
                  onClick={() => { setCategory(item.key); setPage(1); }}
                >
                  <span className="vd-cat-tile-icon">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="vd-cat-tile-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: campus / verified / sort */}
        <div className="vd-filter-row">
          <button
            className={`vd-filter-pill ${campus ? 'active' : ''}`}
            onClick={() => setShowCampusSheet(true)}
          >
            <MapPin size={13} strokeWidth={2.2} />
            <span>{selectedCampusLabel}</span>
            <ChevronDown size={12} strokeWidth={2.5} />
          </button>

          <button
            className={`vd-filter-pill ${verifiedOnly ? 'active' : ''}`}
            onClick={() => { setVerifiedOnly((v) => !v); setPage(1); }}
          >
            <CheckCircle2 size={13} strokeWidth={2.2} />
            <span>Verified</span>
          </button>

          <button className="vd-sort-pill" onClick={() => setShowSortSheet(true)}>
            {(() => {
              const SortIcon = sort.Icon;
              return <SortIcon size={13} strokeWidth={2.2} />;
            })()}
            <span>{sort.label}</span>
            <ChevronDown size={12} strokeWidth={2.5} />
          </button>

          {activeFilterCount > 0 && (
            <button className="vd-clear-filters" onClick={resetAllFilters}>
              <X size={12} strokeWidth={2.6} />
              Clear {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        <div className="vd-result-bar">
          <span className="vd-result-label">{sectionLabel}</span>
          {!loading && (
            <span className="vd-result-count">
              {(stats?.totalVendors ?? vendors.length).toLocaleString()} vendor
              {(stats?.totalVendors ?? vendors.length) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Vendor grid ── */}
      <main className="vd-main">
        {loading ? (
          <div className="vd-grid">
            {[...Array(8)].map((_, i) => <SkeletonVendorCard key={i} />)}
          </div>
        ) : vendors.length === 0 ? (
          <div className="vd-empty">
            <div className="vd-empty-icon">
              <Store size={44} strokeWidth={1.5} />
            </div>
            <h3>No vendors found</h3>
            <p>Try adjusting your search or filters</p>
            {activeFilterCount > 0 || search ? (
              <button className="vd-empty-reset" onClick={resetAllFilters}>
                Reset filters
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="vd-grid">
              {vendors.map((v) => <VendorCard key={v._id} vendor={v} />)}
            </div>

            {hasMore && (
              <div className="vd-load-more-wrap">
                <button className="vd-load-more" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more vendors'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Business type sheet ── */}
      {showBusinessSheet && (
        <div className="vd-sheet-backdrop" onClick={() => setShowBusinessSheet(false)}>
          <div className="vd-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="vd-sheet-handle" />
            <h3 className="vd-sheet-title">Filter by type</h3>
            {BUSINESS_TYPE_FILTERS.map((opt) => {
              const Icon = opt.Icon;
              const isActive = businessType === opt.key;
              return (
                <button
                  key={opt.key || 'all'}
                  className={`vd-sheet-option ${isActive ? 'active' : ''}`}
                  onClick={() => { setBusinessType(opt.key); setShowBusinessSheet(false); setPage(1); }}
                >
                  <Icon size={17} strokeWidth={2.2} />
                  <span>{opt.label}</span>
                  {isActive && <CheckCircle2 size={18} strokeWidth={2.4} className="vd-sheet-check" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Campus sheet ── */}
      {showCampusSheet && (
        <div className="vd-sheet-backdrop" onClick={() => setShowCampusSheet(false)}>
          <div className="vd-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="vd-sheet-handle" />
            <h3 className="vd-sheet-title">Filter by campus</h3>
            <div className="vd-sheet-scroll">
              {CAMPUSES.map((opt) => {
                const isActive = campus === opt.key;
                return (
                  <button
                    key={opt.key || 'all'}
                    className={`vd-sheet-option ${isActive ? 'active' : ''}`}
                    onClick={() => { setCampus(opt.key); setShowCampusSheet(false); setPage(1); }}
                  >
                    <MapPin size={16} strokeWidth={2.2} />
                    <span>{opt.label}</span>
                    {isActive && <CheckCircle2 size={18} strokeWidth={2.4} className="vd-sheet-check" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Sort sheet ── */}
      {showSortSheet && (
        <div className="vd-sheet-backdrop" onClick={() => setShowSortSheet(false)}>
          <div className="vd-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="vd-sheet-handle" />
            <h3 className="vd-sheet-title">Sort by</h3>
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.Icon;
              const isActive = sort.key === opt.key;
              return (
                <button
                  key={opt.key}
                  className={`vd-sheet-option ${isActive ? 'active' : ''}`}
                  onClick={() => { setSort(opt); setShowSortSheet(false); setPage(1); }}
                >
                  <Icon size={17} strokeWidth={2.2} />
                  <span>{opt.label}</span>
                  {isActive && <CheckCircle2 size={18} strokeWidth={2.4} className="vd-sheet-check" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}