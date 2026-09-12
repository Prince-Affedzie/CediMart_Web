// src/app/vendors/[id]/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, Share2, Star, MapPin, School,
  Briefcase, Clock, AlertCircle, RefreshCw,
  Package,
  Cpu, Smartphone, Laptop, Gamepad2, Shirt, BookOpen, Bed,
  Tv, Armchair, Sparkles, Dumbbell, Watch, UtensilsCrossed,
  Wrench, GraduationCap, Camera, Palette, Hammer, Home, Ticket,
  Bike, Ellipsis,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getVendorById } from '@/apis/vendorApi';
import { shareVendorProfile } from '@/utils/shareUtils';

import './vendor-detail.css';

// ─── Constants ──────────────────────────────────────────────────────────────
const CAMPUS_LABELS = {
  UG: 'University of Ghana', KNUST: 'KNUST', UCC: 'University of Cape Coast',
  UEW: 'University of Education, Winneba', UPSA: 'UPSA', GIMPA: 'GIMPA',
  ASHESI: 'Ashesi University', ATU: 'Accra Technical University', OTHER: 'Other',
};

const BUSINESS_TYPE_LABELS = {
  'product': 'Products',
  'service': 'Services',
  'both': 'Products & Services',
};

const CATEGORY_META = {
  'electronics':                { label: 'Electronics',      Icon: Cpu,           color: '#2563EB' },
  'phones and tablets':         { label: 'Phones & Tablets', Icon: Smartphone,    color: '#7C3AED' },
  'computers and laptops':      { label: 'Computers',        Icon: Laptop,        color: '#0891B2' },
  'gaming':                     { label: 'Gaming',           Icon: Gamepad2,      color: '#DB2777' },
  'fashion':                    { label: 'Fashion',          Icon: Shirt,         color: '#DC2626' },
  'books-course-materials':     { label: 'Books',            Icon: BookOpen,      color: '#B45309' },
  'hostel-items':               { label: 'Hostel Items',     Icon: Bed,           color: '#0D9488' },
  'appliances':                 { label: 'Appliances',       Icon: Tv,            color: '#475569' },
  'furniture':                  { label: 'Furniture',        Icon: Armchair,      color: '#92400E' },
  'beauty and grooming':        { label: 'Beauty',           Icon: Sparkles,      color: '#EC4899' },
  'sports and fitness':         { label: 'Sports',           Icon: Dumbbell,      color: '#16A34A' },
  'accessories':                { label: 'Accessories',      Icon: Watch,         color: '#CA8A04' },
  'food and drinks':            { label: 'Food & Drinks',    Icon: UtensilsCrossed, color: '#EA580C' },
  'services':                   { label: 'Services',         Icon: Wrench,        color: '#0284C7' },
  'tutoring-education':         { label: 'Tutoring',         Icon: GraduationCap, color: '#4F46E5' },
  'photography-media':          { label: 'Photography',      Icon: Camera,        color: '#0EA5E9' },
  'graphic-design-printing':    { label: 'Design & Print',   Icon: Palette,       color: '#9333EA' },
  'repair-services':            { label: 'Repairs',          Icon: Hammer,        color: '#65A30D' },
  'events-catering':            { label: 'Events & Catering',Icon: UtensilsCrossed, color: '#F59E0B' },
  'accommodation-housing':      { label: 'Housing',          Icon: Home,          color: '#0F766E' },
  'other':                      { label: 'Other',            Icon: Ellipsis,      color: '#64748B' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const isValidImage = (url) =>
  url && typeof url === 'string' && !url.includes('default_banner') && !url.includes('default_profile');

const formatCount = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

const shade = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, (num >> 16) - amt);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const b = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
};

// Verified check — subtle, single mark, inline with the name
function VerifiedCheck({ size = 16 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────
function VendorDetailSkeleton() {
  return (
    <div className="vdt-page">
      <div className="vdt-skeleton-banner" />
      <div className="vdt-skeleton-body">
        <div className="vdt-skeleton-avatar" />
        <div className="vdt-skeleton-line" style={{ width: '55%', height: 18, marginTop: 20 }} />
        <div className="vdt-skeleton-line" style={{ width: '35%', height: 13, marginTop: 10 }} />
        <div className="vdt-skeleton-line" style={{ width: '70%', height: 13, marginTop: 10 }} />
        <div className="vdt-skeleton-stats">
          <div className="vdt-skeleton-stat" />
          <div className="vdt-skeleton-stat" />
        </div>
        <div className="vdt-skeleton-grid">
          <div className="vdt-skeleton-card" />
          <div className="vdt-skeleton-card" />
        </div>
      </div>
    </div>
  );
}

// ─── Product card ──────────────────────────────────────────────────────────
function VendorProductCard({ product }) {
  const imageUri = product.images?.[0];
  const isAvailable = product.isAvailable && (product.countInStock ?? 0) > 0;
  const catCfg = CATEGORY_META[product.category] || CATEGORY_META.other;
  const CatIcon = catCfg.Icon;

  const discount = product.discountInfo;
  const hasDiscount =
    discount?.isOnSale &&
    (!discount.discountStartDate || new Date(discount.discountStartDate) <= Date.now()) &&
    (!discount.discountEndDate || new Date(discount.discountEndDate) >= Date.now());
  const currentPrice = Number(product.price);
  const originalPrice = discount?.originalPrice;
  const discountPct = hasDiscount
    ? discount?.discountPercentage ??
      (originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0)
    : 0;

  return (
    <Link href={`/products/${product._id}`} className="vdt-product-card">
      <div className="vdt-product-img-wrap">
        {imageUri ? (
          <Image
            src={imageUri}
            alt={product.name || 'Product'}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="vdt-product-img"
          />
        ) : (
          <div
            className="vdt-product-img-ph"
            style={{ background: `${catCfg.color}1A`, color: catCfg.color }}
          >
            <CatIcon size={32} strokeWidth={1.6} />
          </div>
        )}
        {!isAvailable && <div className="vdt-product-oos">Sold Out</div>}
        {hasDiscount && isAvailable && (
          <span className="vdt-product-badge">-{discountPct}%</span>
        )}
      </div>
      <div className="vdt-product-body">
        <p className="vdt-product-name">{product.name}</p>
        <div className="vdt-product-foot">
          {hasDiscount ? (
            <div className="vdt-product-price-stack">
              <span className="vdt-product-price">GH₵ {currentPrice.toFixed(2)}</span>
              {originalPrice && (
                <span className="vdt-product-price-old">GH₵ {originalPrice.toFixed(2)}</span>
              )}
            </div>
          ) : (
            <span className="vdt-product-price">GH₵ {currentPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id;

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  const fetchVendor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVendorById(vendorId);
      if (res?.status === 200 && res?.data?.success) {
        setVendor(res.data.data);
      } else {
        setError('Vendor not found.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load vendor');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { fetchVendor(); }, [fetchVendor]);

  const handleShare = async () => {
    if (sharing || !vendor) return;
    setSharing(true);
    try {
      const result = await shareVendorProfile(vendor);
      if (result?.success) {
        toast?.success?.('Vendor shared successfully!');
      } else if (!result?.cancelled) {
        toast?.error?.('Failed to share profile');
      }
    } catch (err) {
      console.error('Share error:', err);
      toast?.error?.('Could not share profile');
    } finally {
      setSharing(false);
    }
  };

  if (loading) return <VendorDetailSkeleton />;

  if (error || !vendor) {
    return (
      <div className="vdt-page">
        <div className="vdt-error">
          <div className="vdt-error-icon">
            <AlertCircle size={44} strokeWidth={1.5} />
          </div>
          <h2>Couldn&apos;t load this store</h2>
          <p>{error || 'Vendor not found'}</p>
          <button className="vdt-error-retry" onClick={fetchVendor}>
            <RefreshCw size={14} strokeWidth={2.4} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Derived data ────────────────────────────────────────────────────────
  const products = vendor.products || [];
  const primaryCategory = vendor.categories?.[0];
  const categoryCfg = CATEGORY_META[primaryCategory] || CATEGORY_META.other;
  const bannerColor = categoryCfg.color || '#0D9488';
  const hasBanner = isValidImage(vendor.storeBanner);
  const hasAvatar = isValidImage(vendor.profileImage);
  const displayName = vendor.storeName || vendor.name;
  const hasRating = vendor.rating > 0 || vendor.numReviews > 0;
  const categories = vendor.categories || [];
  const campusLabel = CAMPUS_LABELS[vendor.campus] || vendor.campus;
  const businessLabel = BUSINESS_TYPE_LABELS[vendor.businessType] || vendor.businessType;
  const isBioLong = (vendor.bio || '').length > 180;

  return (
    <div className="vdt-page">
      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <section
        className="vdt-hero"
        style={{
          '--cat-color': bannerColor,
          '--cat-color-dark': shade(bannerColor, 25),
        }}
      >
        {hasBanner ? (
          <Image
            src={vendor.storeBanner}
            alt={displayName}
            fill
            priority
            sizes="100vw"
            className="vdt-hero-img"
          />
        ) : (
          <div className="vdt-hero-gradient" />
        )}
        <div className="vdt-hero-scrim-top" />
        <div className="vdt-hero-scrim-bottom" />

        <div className="vdt-hero-topbar">
          <button
            className="vdt-circle-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <button
            className="vdt-circle-btn"
            onClick={handleShare}
            disabled={sharing}
            aria-label="Share vendor"
          >
            <Share2 size={19} strokeWidth={2.2} />
          </button>
        </div>
      </section>

      {/* ── Profile Section ─────────────────────────────────────────── */}
      <div className="vdt-container">
        {/* Avatar sits alone, still overlapping the banner */}
        <div className="vdt-avatar-row">
          <div className="vdt-avatar-ring">
            {hasAvatar ? (
              <Image
                src={vendor.profileImage}
                alt={displayName}
                fill
                sizes="120px"
                className="vdt-avatar-img"
              />
            ) : (
              <div className="vdt-avatar-fallback">
                {displayName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>

        {/* Name + verification */}
        <div className="vdt-name-block">
          <div className="vdt-name-row">
            <h1 className="vdt-name">{vendor.name}</h1>
            {vendor.isVerified && (
              <span className="vdt-verified" title="Verified vendor">
                <VerifiedCheck size={16} />
              </span>
            )}
          </div>
          {vendor.storeName && <p className="vdt-store-name">{vendor.storeName}</p>}

          {/* Meta line — rating, campus, business type (no sales) */}
          <div className="vdt-meta-line">
            {vendor.campus && (
              <span className="vdt-meta-item">
                <School size={13} strokeWidth={2.2} />
                {campusLabel}
              </span>
            )}
            {hasRating && (
              <span className="vdt-meta-item">
                <Star size={13} fill="currentColor" strokeWidth={0} className="vdt-star" />
                {vendor.rating.toFixed(1)} ({vendor.numReviews || 0})
              </span>
            )}
            {vendor.businessType && (
              <span className="vdt-meta-item vdt-meta-brand">
                <Briefcase size={13} strokeWidth={2.2} />
                {businessLabel}
              </span>
            )}
          </div>

          {/* Stats — Products + Rating only */}
          <div className="vdt-stats">
            <div className="vdt-stat">
              <strong>{formatCount(products.length)}</strong>
              <span>Products</span>
            </div>
            <div className="vdt-stat-divider" />
            <div className="vdt-stat">
              <strong>{hasRating ? vendor.rating.toFixed(1) : '—'}</strong>
              <span>Rating</span>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="vdt-categories">
              {categories.slice(0, 6).map((cat) => {
                const cfg = CATEGORY_META[cat] || CATEGORY_META.other;
                const Icon = cfg.Icon;
                return (
                  <span
                    key={cat}
                    className="vdt-category-chip"
                    style={{ color: cfg.color, background: `${cfg.color}15` }}
                  >
                    <Icon size={11} strokeWidth={2.4} />
                    {cfg.label}
                  </span>
                );
              })}
              {categories.length > 6 && (
                <span className="vdt-category-chip vdt-category-more">
                  +{categories.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Opening hours */}
          {vendor.openingHours && (
            <p className="vdt-info-line">
              <Clock size={13} strokeWidth={2.2} className="vdt-info-icon-accent" />
              {vendor.openingHours}
            </p>
          )}

          {/* Location */}
          {vendor.location?.campusArea && (
            <p className="vdt-info-line">
              <MapPin size={13} strokeWidth={2.2} className="vdt-info-icon-muted" />
              {vendor.location.campusArea}
              {vendor.location.hostel ? ` · ${vendor.location.hostel}` : ''}
            </p>
          )}

          {/* Bio */}
          {vendor.bio && (
            <div className="vdt-bio-wrap">
              <p className={`vdt-bio ${!showFullBio && isBioLong ? 'vdt-bio-clamped' : ''}`}>
                {vendor.bio}
              </p>
              {isBioLong && (
                <button className="vdt-bio-toggle" onClick={() => setShowFullBio((v) => !v)}>
                  {showFullBio ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Products Section ───────────────────────────────────────── */}
      <section className="vdt-products-section">
        <div className="vdt-container">
          <header className="vdt-products-header">
            <div>
              <h2 className="vdt-products-title">Products</h2>
              <p className="vdt-products-sub">
                {products.length > 0
                  ? `${products.length} listing${products.length !== 1 ? 's' : ''} from this vendor`
                  : 'No products listed yet'}
              </p>
            </div>
          </header>

          {products.length === 0 ? (
            <div className="vdt-empty">
              <div className="vdt-empty-icon">
                <Package size={40} strokeWidth={1.5} />
              </div>
              <h3>No products yet</h3>
              <p>This vendor hasn&apos;t added any products.</p>
            </div>
          ) : (
            <div className="vdt-products-grid">
              {products.map((p) => (
                <VendorProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}