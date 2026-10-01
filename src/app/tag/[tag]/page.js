'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, RefreshCw, AlertCircle, Flame, XCircle, ArrowRight,
  Star, Zap, TrendingUp, Tag as TagIcon, Sparkles, Heart, Grid3x3,
} from 'lucide-react';
import { getProductsByTag } from '@/apis/productApi';
import './tag.css';

// ─────────────────────────────────────────────────────────────────────────────
// STATIC CONFIG — mirrors the mobile TagProductsScreen's TAG_CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const TAG_CONFIG = {
  'featured':         { label: 'Featured',          icon: Star,       accent: '#D97706', bgTint: 'rgba(217,119,6,.1)',   c1: '#EA580C', c2: '#F97316', emoji: '⭐' },
  'urgent-sale':      { label: 'Urgent Sales',       icon: Zap,        accent: '#DC2626', bgTint: 'rgba(220,38,38,.08)',  c1: '#991B1B', c2: '#DC2626', emoji: '⚡' },
  'popular':          { label: 'Popular',            icon: TrendingUp, accent: '#7E22CE', bgTint: 'rgba(126,34,206,.08)', c1: '#581C87', c2: '#7E22CE', emoji: '🔥' },
  'discounted':       { label: 'Discounted',         icon: TagIcon,    accent: '#0D9488', bgTint: 'rgba(13,148,136,.08)', c1: '#0F766E', c2: '#0D9488', emoji: '🏷️' },
  'new-arrival':      { label: 'New Arrivals',       icon: Sparkles,   accent: '#0284C7', bgTint: 'rgba(2,132,199,.08)',  c1: '#0369A1', c2: '#0284C7', emoji: '✨' },
  'student-favorite': { label: 'Student Favorites',  icon: Heart,      accent: '#BE185D', bgTint: 'rgba(190,24,93,.08)',  c1: '#9D174D', c2: '#BE185D', emoji: '🎓' },
};

const CONDITION_CONFIG = {
  'new':           { label: 'Brand New',   bg: '#ECFDF5', text: '#059669' },
  'like-new':      { label: 'Like New',    bg: '#F0F9FF', text: '#0284C7' },
  'excellent':     { label: 'Excellent',   bg: '#F0FDFA', text: '#0D9488' },
  'good':          { label: 'Good',        bg: '#FFF7ED', text: '#D97706' },
  'fair':          { label: 'Fair',        bg: '#FFF7ED', text: '#EA580C' },
  'slightly-used': { label: 'Slight Used', bg: '#F5F5F4', text: '#57534E' },
  'for-parts':     { label: 'For Parts',   bg: '#FEF2F2', text: '#DC2626' },
};

function extractProducts(res) {
  const d = res?.data;
  const data = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];
  return Array.isArray(data) ? data : [];
}

function defaultTagConfig(tag) {
  return { label: tag, icon: TagIcon, accent: '#0D9488', bgTint: 'rgba(13,148,136,.08)', c1: '#0F766E', c2: '#0D9488', emoji: '🏷️' };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ item, cfg }) {
  const imageUri = item.images?.[0];
  const condCfg = CONDITION_CONFIG[item.condition];
  const isAvail = item.isAvailable !== false && (item.countInStock ?? 0) > 0;
  const isLowStock = isAvail && (item.countInStock ?? 0) <= 3;

  const discountInfo = item.discountInfo;
  const hasActiveDiscount = discountInfo?.isOnSale &&
    (!discountInfo.discountStartDate || new Date(discountInfo.discountStartDate) <= Date.now()) &&
    (!discountInfo.discountEndDate || new Date(discountInfo.discountEndDate) >= Date.now());

  const currentPrice = Number(item.price);
  const originalPrice = discountInfo?.originalPrice;
  const discountPercentage = hasActiveDiscount
    ? (discountInfo?.discountPercentage ?? (originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0))
    : 0;

  const cardVars = { '--c2': cfg.accent, '--bg-tint': cfg.bgTint };

  return (
    <Link href={`/product/${item._id}`} className="tg-card-link">
      <div className="tg-card" style={cardVars}>
        <div className="tg-img-wrap">
          {imageUri ? (
            <img src={imageUri} alt={item.name} className="tg-img" loading="lazy" />
          ) : (
            <div className="tg-img-placeholder" style={{ background: cfg.bgTint }}>
              <span>{cfg.emoji}</span>
            </div>
          )}
          <div className="tg-img-scrim" />

          {/* Top-left stack */}
          <div className="tg-badges-left">
            {hasActiveDiscount && isAvail && (
              <span className="tg-badge tg-badge-discount">-{discountPercentage}%</span>
            )}
            {condCfg && (
              <span className="tg-badge" style={{ background: condCfg.bg, color: condCfg.text }}>{condCfg.label}</span>
            )}
          </div>

          {/* Top-right: negotiable */}
          {item.negotiable && (
            <div className="tg-badges-right">
              <span className="tg-badge tg-badge-nego">Nego</span>
            </div>
          )}

          {isLowStock && (
            <div className="tg-low-stock">
              <Flame size={11} strokeWidth={2.2} />
              <span>Only {item.countInStock} left</span>
            </div>
          )}

          {!isAvail && (
            <div className="tg-sold-overlay">
              <div className="tg-sold-badge">
                <XCircle size={22} strokeWidth={1.8} />
                <span>Sold Out</span>
              </div>
            </div>
          )}
        </div>

        <div className="tg-body-card">
          <p className="tg-name">{item.name}</p>

          {item.campus && (
            <span className="tg-campus-pill" style={{ '--bg-tint': cfg.bgTint, '--c2': cfg.accent }}>
              {item.campus}
            </span>
          )}

          <div className="tg-footer">
            {hasActiveDiscount ? (
              <div className="tg-price-stack">
                <div className="tg-price-row">
                  <span className="tg-price">GH₵ {currentPrice.toFixed(2)}</span>
                  <span className="tg-discount-pill">-{discountPercentage}%</span>
                </div>
                {originalPrice && <span className="tg-original-price">GH₵ {originalPrice.toFixed(2)}</span>}
              </div>
            ) : (
              <span className="tg-price">GH₵ {currentPrice.toFixed(2)}</span>
            )}

            <span className="tg-view-btn" style={cardVars}>
              <ArrowRight size={14} strokeWidth={2.4} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ cfg }) {
  return (
    <div className="tg-empty">
      <div className="tg-empty-icon" style={{ background: cfg.bgTint }}>
        <span>{cfg.emoji}</span>
      </div>
      <h2 className="tg-empty-title">No {cfg.label} listings</h2>
      <p className="tg-empty-sub">There are no products with this tag right now. Check back soon!</p>
      <Link href="/listings" className="tg-empty-btn" style={{ '--c2': cfg.accent }}>
        <Grid3x3 size={16} strokeWidth={2.2} />
        Browse All Listings
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETONS
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="tg-sk-card">
      <div className="tg-sk-img" />
      <div className="tg-sk-body">
        <div className="tg-sk-line" style={{ width: '90%' }} />
        <div className="tg-sk-line" style={{ width: '60%' }} />
        <div className="tg-sk-line" style={{ width: '40%', marginTop: 4 }} />
      </div>
    </div>
  );
}

function TagPageSkeleton() {
  return (
    <div className="tg-page">
      <div className="tg-hero" style={{ '--c1': '#0F766E', '--c2': '#0D9488' }}>
        <div className="tg-hero-top">
          <div className="tg-icon-btn" />
          <div className="tg-icon-btn" />
        </div>
        <div className="tg-hero-body">
          <div className="tg-hero-emoji" />
          <div>
            <div className="tg-sk-line" style={{ width: 140, height: 24, background: 'rgba(255,255,255,0.2)' }} />
            <div className="tg-sk-line" style={{ width: 80, height: 14, marginTop: 8, background: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
        <div className="tg-hero-curve" />
      </div>
      <div className="tg-body">
        <div className="tg-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
export default function TagProductsPage() {
  return (
    <Suspense fallback={<TagPageSkeleton />}>
      <TagProductsPageInner />
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INNER CLIENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function TagProductsPageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tag = decodeURIComponent(params?.tag || '');
  const sort = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cfg = TAG_CONFIG[tag] || defaultTagConfig(tag);
  const Icon = cfg.icon;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProductsByTag(tag, { limit: 60, sort });
      setProducts(extractProducts(res));
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong loading these listings.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [tag, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const heroVars = { '--c1': cfg.c1, '--c2': cfg.c2 };

  return (
    <div className="tg-page">
      <div className="tg-hero" style={heroVars}>
        <div className="tg-hero-top">
          <button className="tg-icon-btn" onClick={() => router.back()} aria-label="Go back">
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
          <button className="tg-icon-btn" onClick={fetchProducts} aria-label="Refresh" disabled={loading}>
            <RefreshCw size={17} strokeWidth={2.2} style={loading ? { animation: 'tgSpin 0.8s linear infinite' } : undefined} />
          </button>
        </div>

        <div className="tg-hero-body">
          <div className="tg-hero-emoji">
            <Icon size={26} strokeWidth={2} color="#fff" />
          </div>
          <div>
            <h1 className="tg-hero-title">{cfg.label}</h1>
            <p className="tg-hero-sub">
              {loading ? 'Loading…' : `${products.length} listing${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="tg-hero-curve" />
      </div>

      <div className="tg-body">
        {error && (
          <div className="tg-error-banner">
            <AlertCircle size={16} strokeWidth={2.2} />
            <span>{error}</span>
            <button className="tg-retry-btn" onClick={fetchProducts}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="tg-grid">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState cfg={cfg} />
        ) : (
          <div className="tg-grid">
            {products.map((item) => (
              <ProductCard key={item._id} item={item} cfg={cfg} />
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes tgSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}