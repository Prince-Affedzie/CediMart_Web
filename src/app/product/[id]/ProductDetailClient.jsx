// src/app/product/[id]/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  Handshake,
  Package,
  PackageX,
  ShoppingCart,
  MessageCircle,
  Heart,
  Share2,
  Star,
  StarHalf,
  Store,
  ShieldCheck,
  Eye,
  Loader2,
  Check,
  X,
  Info,
  Home,
  School,
  Layers,
  Bookmark,
  Grid3X3,
} from 'lucide-react';
import { getProductById, getProductsByCategory } from '@/apis/productApi';
import { addToFavorites, removeFromFavorites } from '@/apis/userActionsApi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import GuestCheckout from '@/components/GuestCheckOut';
import { shareProduct } from '@/utils/shareProduct';
import './product-detail.css';

// ─── Design Tokens (aligned with mobile app C palette) ─────────────────────────
const C = {
  bg:           '#F8FAFC',
  surface:      '#FFFFFF',
  elev:         '#F1F5F9',
  t1:           '#0F172A',
  t2:           '#475569',
  t3:           '#94A3B8',
  brand:        '#0D9488',
  brandL:       '#14B8A6',
  brandD:       '#0F766E',
  brandBg:      '#F0FDFA',
  brandBorder:  '#99F6E4',
  accent:       '#F97316',
  accentBg:     '#FFF7ED',
  accentBorder: '#FED7AA',
  success:      '#059669',
  successBg:    '#ECFDF5',
  successBorder:'#A7F3D0',
  danger:       '#DC2626',
  dangerBg:     '#FEF2F2',
  dangerBorder: '#FECACA',
  info:         '#0284C7',
  infoBg:       '#F0F9FF',
  infoBorder:   '#BAE6FD',
  white:        '#FFFFFF',
};

// ─── Config maps (mirrors mobile) ──────────────────────────────────────────────
const CONDITION_CONFIG = {
  'new':           { label: 'New',           bg: C.successBg,  color: C.success, icon: Star },
  'like-new':      { label: 'Like New',      bg: C.successBg,  color: C.success, icon: Star },
  'excellent':     { label: 'Excellent',     bg: C.brandBg,    color: C.brand,   icon: Check },
  'good':          { label: 'Good',          bg: C.accentBg,   color: '#D97706', icon: Check },
  'fair':          { label: 'Fair',          bg: '#FFF7ED',    color: '#EA580C', icon: Info },
  'slightly-used': { label: 'Slightly Used', bg: '#FFF7ED',    color: '#EA580C', icon: Info },
  'for-parts':     { label: 'For Parts',     bg: C.dangerBg,   color: C.danger,  icon: PackageX },
};

const TAG_CONFIG = {
  'featured':         { label: 'Featured',         bg: C.accentBg,  color: '#D97706' },
  'urgent-sale':      { label: 'Urgent Sale',      bg: C.dangerBg,  color: C.danger },
  'popular':          { label: 'Popular',          bg: '#F3E8FF',   color: '#7E22CE' },
  'discounted':       { label: 'Discounted',       bg: C.successBg, color: C.success },
  'new-arrival':      { label: 'New Arrival',      bg: C.brandBg,   color: C.brand },
  'student-favorite': { label: 'Student Favorite', bg: '#FFF7ED',   color: '#EA580C' },
};

const CAMPUS_LABELS = {
  UG: 'University of Ghana',
  KNUST: 'KNUST',
  UCC: 'University of Cape Coast',
  UEW: 'University of Education, Winneba',
  UPSA: 'UPSA',
  GIMPA: 'GIMPA',
  ASHESI: 'Ashesi University',
  ATU: 'Accra Technical University',
  OTHER: 'Other',
};

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/F1F5F9/94A3B8?text=No+Image';

const fmtPrice = (p) =>
  p == null
    ? '—'
    : `GH₵ ${Number(p).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

const safeStr = (val) => {
  if (!val) return null;
  if (typeof val === 'object') return val.campusArea || val.name || val.hostel || null;
  return String(val);
};

// ─── App deep link constants ───────────────────────────────────────────────────
const APP_STORE_URL = 'https://apps.apple.com/us/app/cedimart/id6762318566';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.freshyfood.factory';

function buildAppUrl(productId, action, referralCode) {
  const params = new URLSearchParams();
  if (action === 'contact') params.set('action', 'chat');
  if (referralCode) params.set('ref', referralCode);
  const qs = params.toString();
  return `cedimart://product/${productId}${qs ? `?${qs}` : ''}`;
}

// ─── App Prompt Modal ──────────────────────────────────────────────────────────
function AppPromptModal({ isOpen, onClose, action, productId, referralCode }) {
  if (!isOpen) return null;

  const actionText =
    action === 'buy'
      ? 'purchase this item and enjoy secure in-app payments'
      : 'chat with sellers and negotiate prices';

  const handleOpenApp = () => {
    const appUrl = buildAppUrl(productId, action, referralCode);
    window.location.href = appUrl;
    setTimeout(() => {
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        window.location.href = APP_STORE_URL;
      } else if (/Android/.test(navigator.userAgent)) {
        window.location.href = PLAY_STORE_URL;
      }
    }, 1500);
  };

  return (
    <div className="pdm-overlay" onClick={onClose}>
      <div className="pdm-content" onClick={(e) => e.stopPropagation()}>
        <button className="pdm-close" onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2.4} />
        </button>
        <div className="pdm-icon-wrap pdm-icon-accent">
          <ShoppingCart size={32} strokeWidth={2} />
        </div>

        <h2 className="pdm-title">Get the CediMart App</h2>
        <p className="pdm-text">
          To {actionText}, download the CediMart app. Available on iOS and Android — free forever.
        </p>
        <div className="pdm-features">
          <div className="pdm-feature">
            <ShieldCheck size={16} strokeWidth={2.4} /> Verified Sellers
          </div>
          <div className="pdm-feature">
            <MessageCircle size={16} strokeWidth={2.4} /> In-app Chat
          </div>
          <div className="pdm-feature">
            <Heart size={16} strokeWidth={2.4} /> Earn Rewards
          </div>
          <div className="pdm-feature">
            <MapPin size={16} strokeWidth={2.4} /> Campus Filtering
          </div>
        </div>
        <div className="pdm-buttons">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pdm-btn pdm-btn-primary"
          >
            Download on App Store
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pdm-btn pdm-btn-secondary"
          >
            Get it on Google Play
          </a>
        </div>
        <button className="pdm-continue" onClick={onClose}>
          Continue browsing on web →
        </button>
      </div>
    </div>
  );
}

// ─── Star Row ──────────────────────────────────────────────────────────────────
function StarRow({ rating = 0, count = 0, size = 16 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="pd-star-row" style={{ gap: size * 0.12 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= full) {
          return <Star key={i} size={size} strokeWidth={0} fill={C.accent} color={C.accent} />;
        }
        if (half && i === full + 1) {
          return <StarHalf key={i} size={size} strokeWidth={0} fill={C.accent} color={C.accent} />;
        }
        return (
          <Star
            key={i}
            size={size}
            strokeWidth={1.6}
            fill="none"
            color={C.accent}
            opacity={0.4}
          />
        );
      })}
      {count > 0 && (
        <span className="pd-star-label" style={{ fontSize: size - 3 }}>
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}

// ─── Collapsible Section ───────────────────────────────────────────────────────
function CollapsibleSection({ title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`pd-section${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="pd-section-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="pd-section-header-left">
          <span className="pd-section-title">{title}</span>
          {badge != null && <span className="pd-section-badge">{badge}</span>}
        </span>
        <ChevronDown
          size={20}
          strokeWidth={2.4}
          className="pd-section-chevron"
        />
      </button>
      {open && <div className="pd-section-body">{children}</div>}
    </div>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, isLast }) {
  return (
    <div className={`pd-info-row${isLast ? ' is-last' : ''}`}>
      <span className="pd-info-row-left">
        <Icon size={15} strokeWidth={2.2} color={C.t3} />
        <span className="pd-info-row-label">{label}</span>
      </span>
      <span className="pd-info-row-value">{value || '—'}</span>
    </div>
  );
}

// ─── Variation Selector ────────────────────────────────────────────────────────
function VariationSelector({ variations, selected, onSelect }) {
  if (!variations?.length) return null;
  return (
    <div className="pd-var-selector">
      {variations.map((variation, vIdx) => (
        <div key={vIdx} className="pd-var-group">
          <p className="pd-var-label">
            {variation.type || 'Option'}
            {selected[variation.type] ? `: ${selected[variation.type]}` : ''}
          </p>
          <div className="pd-var-options">
            {variation.options?.map((opt, oIdx) => {
              const isActive = selected[variation.type] === opt.name;
              const oos = (opt.countInStock ?? 0) <= 0;
              return (
                <button
                  key={oIdx}
                  type="button"
                  className={`pd-var-pill${isActive ? ' is-active' : ''}${oos ? ' is-oos' : ''}`}
                  onClick={() => !oos && onSelect(variation.type, opt.name)}
                  disabled={oos}
                >
                  {opt.name}
                  {oos && <span className="pd-var-oos-tag">Sold out</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Image Carousel ────────────────────────────────────────────────────────────
// Owns the gallery viewport plus everything that overlays it: the sale badge
// (top-left), the share + favorite cluster (top-right), the image counter
// (bottom-left), and the prev/next arrows.
function ImageCarousel({
  images,
  productName,
  isOnSale,
  discountPct,
  isFavorite,
  favoriteLoading,
  onToggleFavorite,
  onShare,
}) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipe = 50;
  const goTo = useCallback(
    (i) => {
      if (i >= 0 && i < images.length) setCurrent(i);
    },
    [images.length]
  );
  const goNext = useCallback(
    () => setCurrent((p) => (p + 1) % images.length),
    [images.length]
  );
  const goPrev = useCallback(
    () => setCurrent((p) => (p - 1 + images.length) % images.length),
    [images.length]
  );

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  };
  const onTouchMove = (e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    setDragOffset(touchStart - e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    if (d > minSwipe) goNext();
    else if (d < -minSwipe) goPrev();
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  // Share + favorite, sitting together in the top-right corner.
  const topActions = (
    <div className="pd-carousel-actions">
      <button
        type="button"
        className="pd-carousel-action"
        onClick={onShare}
        aria-label="Share product"
        title="Share product"
      >
        <Share2 size={18} strokeWidth={2.2} />
      </button>
      <button
        type="button"
        className={`pd-carousel-action pd-carousel-fav${isFavorite ? ' is-favorite' : ''}`}
        onClick={onToggleFavorite}
        disabled={favoriteLoading}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {favoriteLoading ? (
          <Loader2 size={18} strokeWidth={2.4} className="pd-spin" />
        ) : (
          <Heart
            size={18}
            strokeWidth={2.2}
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        )}
      </button>
    </div>
  );

  if (!images.length) {
    return (
      <div className="pd-carousel">
        {topActions}
        <div className="pd-carousel-slide">
          <div className="pd-carousel-placeholder">
            <Package size={64} strokeWidth={1.4} color={C.t3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pd-carousel"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {isOnSale && <span className="pd-sale-badge">-{discountPct}% OFF</span>}
      {topActions}
      <div className="pd-carousel-counter">
        {current + 1} / {images.length}
      </div>
      {images.length > 1 && (
        <>
          <button
            className="pd-carousel-arrow left"
            onClick={goPrev}
            aria-label="Previous image"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
          <button
            className="pd-carousel-arrow right"
            onClick={goNext}
            aria-label="Next image"
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
        </>
      )}
      <div
        className="pd-carousel-track"
        style={{
          transform: `translateX(calc(-${current * 100}% - ${
            isDragging ? dragOffset : 0
          }px))`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {images.map((img, i) => (
          <div key={i} className="pd-carousel-slide">
            <div className="pd-carousel-img-wrap">
              <img
                src={img}
                alt={`${productName} - ${i + 1}`}
                className="pd-carousel-img"
                draggable="false"
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="pd-carousel-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`pd-carousel-dot${i === current ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="sk-wrapper">
      <div className="sk-gallery">
        <div className="sk-main-img" />
      </div>
      <div className="sk-details">
        <div className="sk-line" style={{ width: '30%', height: 12 }} />
        <div className="sk-line" style={{ width: '80%', height: 24, marginTop: 12 }} />
        <div className="sk-line" style={{ width: '40%', height: 28, marginTop: 12 }} />
        <div className="sk-line" style={{ width: '100%', height: 14, marginTop: 20 }} />
        <div className="sk-line" style={{ width: '100%', height: 14, marginTop: 8 }} />
        <div className="sk-line" style={{ width: '60%', height: 14, marginTop: 8 }} />
        <div
          className="sk-line"
          style={{ width: '200px', height: 44, marginTop: 24, borderRadius: 12 }}
        />
      </div>
    </div>
  );
}

// ─── Related Product Card ──────────────────────────────────────────────────────
function RelatedProductCard({ product }) {
  const img = product.images?.[0] || product.image || null;
  return (
    <Link href={`/product/${product._id}`} className="related-card">
      <div className="related-img-wrap">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="related-img"
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
        ) : (
          <div className="related-img-placeholder">
            <Package size={36} strokeWidth={1.4} color={C.t3} />
          </div>
        )}
      </div>
      <div className="related-info">
        <p className="related-name">{product.name}</p>
        <p className="related-price">{fmtPrice(product.price)}</p>
        {product.campus && (
          <span className="related-campus">
            {typeof product.campus === 'object' ? product.campus.name : product.campus}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Sticky "Add to Cart" bar ──────────────────────────────────────────────────
// Rendered OUTSIDE .pd-page (see parent return) so position: fixed anchors to
// the viewport rather than the overflow-x-clipped page wrapper.
function StickyCartBar({ inStock, lineTotal, quantity, addingToCart, onAddToCart }) {
  return (
    <div className="pd-sticky-bar">
      <div className="pd-sticky-inner">
        <div className="pd-sticky-info">
          <span className="pd-sticky-price">{fmtPrice(lineTotal)}</span>
          <span className="pd-sticky-qty">Qty {quantity}</span>
        </div>
        <button
          type="button"
          className="pd-sticky-btn"
          onClick={onAddToCart}
          disabled={!inStock || addingToCart}
        >
          {addingToCart ? (
            <>
              <Loader2 size={18} strokeWidth={2.4} className="pd-spin" />
              Adding…
            </>
          ) : inStock ? (
            <>
              <ShoppingCart size={18} strokeWidth={2.4} />
              Add to Cart
            </>
          ) : (
            'Sold Out'
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Floating "Chat Seller" launcher ───────────────────────────────────────────
// Also rendered outside .pd-page for the same reason as the sticky bar.
function ChatFab({ onClick }) {
  return (
    <button
      type="button"
      className="pd-chat-fab"
      onClick={onClick}
      aria-label="Chat with seller"
      title="Chat with seller"
    >
      <MessageCircle size={22} strokeWidth={2.2} />
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductDetailClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id } = params;
  const referralCode = searchParams.get('ref') || null;

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('buy');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [toast, setToast] = useState({ msg: '', danger: false });

  // Persist referral code
  useEffect(() => {
    if (referralCode && typeof document !== 'undefined') {
      document.cookie = `cm_ref=${referralCode}; max-age=2592000; path=/; samesite=lax`;
    }
  }, [referralCode]);

  // Mobile flag
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        const data =
          res?.data?.data?.product || res?.data?.product || res?.data || null;
        setProduct(data);
        if (data?.variations?.length) {
          const defaults = {};
          data.variations.forEach((v) => {
            const firstInStock =
              v.options?.find((o) => (o.countInStock ?? 0) > 0) || v.options?.[0];
            if (firstInStock) defaults[v.type] = firstInStock.name;
          });
          setSelectedVariations(defaults);
        }
        if (data?.category) {
          try {
            const rel = await getProductsByCategory(data.category, {
              limit: 8,
              sort: 'newest',
            });
            const relData =
              rel?.data?.data?.products ||
              rel?.data?.data ||
              rel?.data?.products ||
              [];
            setRelatedProducts(
              Array.isArray(relData)
                ? relData.filter((p) => p._id !== id).slice(0, 8)
                : []
            );
          } catch (err) {
            console.error('Related fetch failed:', err);
          }
        }
      } catch (err) {
        console.error('Product fetch failed:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Favorites default (best-effort)
  useEffect(() => {
    if (!isAuthenticated || !product) {
      setIsFavorite(false);
      return;
    }
    setIsFavorite(false);
  }, [isAuthenticated, product]);

  const showToast = useCallback((msg, danger = false) => {
    setToast({ msg, danger });
    setTimeout(() => setToast({ msg: '', danger: false }), 2400);
  }, []);

  const handleAction = (action) => {
    setModalAction(action);
    setModalOpen(true);
  };


  const handleShareProduct = async () => {
  const result = await shareProduct(product);

  if (!result.ok) {
    showToast('Could not share this product', true);
    return;
  }

  if (result.method === 'clipboard') {
    showToast('Link copied — paste it anywhere to share');
  }
  // native-file and native-text don't need a toast — the OS sheet
  // itself is the confirmation.
};

  const handleFavoriteToggle = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    setFavoriteLoading(true);
    try {
      const pid = product._id || product.id;
      const res = isFavorite
        ? await removeFromFavorites(pid)
        : await addToFavorites(pid);
      if (res?.status === 200 || res?.success) {
        setIsFavorite((f) => !f);
        showToast(isFavorite ? 'Removed from favorites' : 'Saved to favorites');
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      showToast('Could not update favorites', true);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    if ((product.countInStock ?? 0) <= 0) {
      showToast('This item is out of stock', true);
      return;
    }
    setAddingToCart(true);
    try {
      const pid = product._id || product.id;
      await addToCart(pid, quantity);
      showToast(`Added ${quantity} × ${product.name} to cart`);
    } catch (err) {
      console.error('Add to cart failed:', err);
      showToast(err?.message || 'Failed to add to cart', true);
    } finally {
      setAddingToCart(false);
    }
  };

  const increaseQty = () => {
    const max = product?.countInStock ?? 99;
    setQuantity((q) => Math.min(q + 1, max));
  };
  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));

  const handleVariationSelect = (type, name) =>
    setSelectedVariations((prev) => ({ ...prev, [type]: name }));

  // ── LOADING ──
  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <ProductSkeleton />
        </div>
      </div>
    );
  }

  // ── NOT FOUND ──
  if (!product) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <div className="pd-not-found">
            <div className="pd-not-found-icon">
              <PackageX size={56} strokeWidth={1.4} color={C.t3} />
            </div>
            <h2>Listing not found</h2>
            <p>This listing may have been removed or doesn&apos;t exist.</p>
            <Link href="/" className="pd-back-btn">
              <ChevronLeft size={16} strokeWidth={2.4} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Derived data ──
  const images = product.images?.length
    ? product.images
    : [product.image || PLACEHOLDER_IMAGE];
  const cond = CONDITION_CONFIG[product.condition] || CONDITION_CONFIG['good'];
  const isOnSale =
    product.discountInfo?.isOnSale &&
    product.discountInfo?.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round(
        ((product.discountInfo.originalPrice - product.price) /
          product.discountInfo.originalPrice) *
          100
      )
    : null;
  const campusStr = safeStr(product.campus);
  const specs =
    product.specifications instanceof Map
      ? Object.fromEntries(product.specifications)
      : product.specifications || {};
  const stockCount = product.countInStock ?? 0;
  const inStock = stockCount > 0;
  const isLowStock = inStock && stockCount <= 3;
  const lineTotal = (Number(product.price || 0) * quantity).toFixed(2);
  const vendorId = product.vendor?._id || product.vendor?.id;

  const infoItems = [
    { icon: Grid3X3, label: 'Category', value: product.category?.replace(/-/g, ' ') },
    product.subcategory && {
      icon: Layers,
      label: 'Subcategory',
      value: product.subcategory?.replace(/-/g, ' '),
    },
    {
      icon: School,
      label: 'Campus',
      value: CAMPUS_LABELS[product.campus] || product.campus,
    },
    { icon: MapPin, label: 'Area', value: product.location?.campusArea },
    product.location?.hostel && {
      icon: Home,
      label: 'Hostel / Hall',
      value: product.location.hostel,
    },
    product.brand && { icon: Bookmark, label: 'Brand', value: product.brand },
  ].filter(Boolean);

  return (
    <>
      <AppPromptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
        productId={id}
        referralCode={referralCode}
      />

      <div className="pd-page">
        {/* Toast */}
        {toast.msg && (
          <div className={`pd-toast${toast.danger ? ' pd-toast-danger' : ''}`}>
            {toast.msg}
          </div>
        )}

        {/* Top bar */}
        <div className="pd-topbar">
          <div className="pd-topbar-inner">
            <button
              className="pd-topbar-back"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ChevronLeft size={20} strokeWidth={2.4} />
              <span>Back</span>
            </button>
            <Link href="/listings" className="pd-topbar-link">
              All Listings
            </Link>
            {referralCode && (
              <div className="pd-ref-banner">
                <Heart size={12} strokeWidth={2.4} />
                <span>Recommended by a friend — they earn when you buy</span>
              </div>
            )}
          </div>
        </div>

        <div className="pd-container">
          <div className="pd-grid">
            {/* ── Gallery ── */}
            <div className="pd-gallery">
              <ImageCarousel
                images={images}
                productName={product.name}
                isOnSale={isOnSale}
                discountPct={discountPct}
                isFavorite={isFavorite}
                favoriteLoading={favoriteLoading}
                onToggleFavorite={handleFavoriteToggle}
                onShare={handleShareProduct}
              />
            </div>

            {/* ── Details panel ── */}
            <div className="pd-panel">
              {/* Breadcrumb */}
              <div className="pd-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/listings">Listings</Link>
                <span>/</span>
                <span className="pd-breadcrumb-current">{product.name}</span>
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="pd-tags-row">
                  {product.tags.map((tag) => {
                    const cfg = TAG_CONFIG[tag] || {
                      label: tag,
                      bg: C.brandBg,
                      color: C.brand,
                    };
                    return (
                      <span
                        key={tag}
                        className="pd-tag"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Title + condition */}
              <div className="pd-title-row">
                <h1 className="pd-title">{product.name}</h1>
                {cond && (
                  <span
                    className="pd-condition"
                    style={{ background: cond.bg, color: cond.color }}
                  >
                    {cond.label}
                  </span>
                )}
              </div>

              {/* Brand + rating + views */}
              {product.brand && <p className="pd-brand">by {product.brand}</p>}
              {(product.numReviews ?? 0) > 0 && (
                <div className="pd-rating-block">
                  <StarRow
                    rating={product.rating || 0}
                    count={product.numReviews || 0}
                    size={15}
                  />
                </div>
              )}
              {((product.views ?? 0) > 0 || (product.favorites ?? 0) > 0) && (
                <div className="pd-caption-row">
                  {(product.views ?? 0) > 0 && (
                    <span className="pd-caption-item">
                      <Eye size={12} strokeWidth={2.2} /> {product.views} views
                    </span>
                  )}
                  {(product.favorites ?? 0) > 0 && (
                    <span className="pd-caption-item">
                      <Heart size={12} strokeWidth={2.2} /> {product.favorites} saved
                    </span>
                  )}
                </div>
              )}

              {/* Price block */}
              <div className="pd-price-section">
                {isOnSale ? (
                  <>
                    <span className="pd-original-price">
                      {fmtPrice(product.discountInfo.originalPrice)}
                    </span>
                    <div className="pd-price-row">
                      <span className="pd-price sale">{fmtPrice(product.price)}</span>
                      <span className="pd-save-badge">-{discountPct}%</span>
                    </div>
                  </>
                ) : (
                  <div className="pd-price-row">
                    <span className="pd-price">{fmtPrice(product.price)}</span>
                    {product.negotiable && (
                      <span className="pd-nego-chip">
                        <Handshake size={11} strokeWidth={2.4} /> Negotiable
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Availability banner */}
              <div
                className={`pd-avail-banner${
                  !inStock ? ' is-oos' : isLowStock ? ' is-low' : ''
                }`}
              >
                <span
                  className="pd-avail-dot"
                  style={{
                    background: !inStock
                      ? C.danger
                      : isLowStock
                      ? C.accent
                      : C.success,
                  }}
                />
                <span
                  className="pd-avail-text"
                  style={{
                    color: !inStock
                      ? C.danger
                      : isLowStock
                      ? '#D97706'
                      : C.success,
                  }}
                >
                  {!inStock
                    ? 'Currently unavailable'
                    : isLowStock
                    ? `Only ${stockCount} left — grab it fast!`
                    : `${stockCount} in stock`}
                </span>
              </div>

              {/* Variations */}
              <VariationSelector
                variations={product.variations}
                selected={selectedVariations}
                onSelect={handleVariationSelect}
              />

              {/* Quantity */}
              {inStock && (
                <div className="pd-qty-row">
                  <span className="pd-qty-label">Quantity</span>
                  <div className="pd-qty-stepper">
                    <button
                      type="button"
                      className="pd-qty-btn"
                      onClick={decreaseQty}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="pd-qty-value">{quantity}</span>
                    <button
                      type="button"
                      className="pd-qty-btn"
                      onClick={increaseQty}
                      disabled={quantity >= stockCount}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="pd-qty-total">{fmtPrice(lineTotal)}</span>
                </div>
              )}

              {/* ── Collapsible: Product Details ── */}
              <CollapsibleSection title="Product Details" defaultOpen>
                <div className="pd-info-rows">
                  {infoItems.map((item, i) => (
                    <InfoRow
                      key={i}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                      isLast={i === infoItems.length - 1}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              {/* ── Collapsible: Specifications ── */}
              {Object.keys(specs).length > 0 && (
                <CollapsibleSection title="Specifications" defaultOpen>
                  <div className="pd-specs-list">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="pd-spec-item">
                        <span className="pd-spec-key">{key}</span>
                        <span className="pd-spec-val">{value}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* ── Collapsible: Description ── */}
              {product.description && (
                <CollapsibleSection title="Description" defaultOpen>
                  <p className="pd-desc-text">{product.description}</p>
                </CollapsibleSection>
              )}

              {/* ── Collapsible: Seller ── */}
              {product.vendor && (
                <CollapsibleSection title="Seller" defaultOpen>
                  <div className="pd-seller-card">
                    <div className="pd-seller-avatar">
                      {product.vendor.avatar ? (
                        <img
                          src={product.vendor.avatar}
                          alt={product.vendor.name}
                          className="pd-seller-avatar-img"
                        />
                      ) : (
                        <span className="pd-seller-avatar-text">
                          {(product.vendor?.name || 'S').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="pd-seller-info">
                      <p className="pd-seller-name">
                        {product.vendor?.name || 'Student Seller'}
                      </p>
                      {campusStr && (
                        <p className="pd-seller-sub">
                          <School size={11} strokeWidth={2.2} /> {campusStr}
                        </p>
                      )}
                      {product.vendor?.rating !== undefined && (
                        <span className="pd-seller-rating">
                          <Star
                            size={12}
                            strokeWidth={0}
                            fill={C.accent}
                            color={C.accent}
                          />
                          {(product.vendor.rating || 0).toFixed(1)}
                        </span>
                      )}
                    </div>
                    {vendorId && (
                      <Link
                        href={`/vendors/${vendorId}`}
                        className="pd-view-shop-btn"
                      >
                        <Store size={14} strokeWidth={2.4} />
                        View Shop
                      </Link>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* ── Collapsible: Reviews ── */}
              {product.reviews?.length > 0 && (
                <CollapsibleSection
                  title="Reviews"
                  badge={product.reviews.length}
                  defaultOpen={product.reviews.length <= 3}
                >
                  <div className="pd-reviews">
                    {product.reviews.map((review, idx) => (
                      <div key={review._id || idx} className="pd-review-card">
                        <div className="pd-review-head">
                          <div className="pd-review-avatar">
                            {(review.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="pd-review-meta">
                            <span className="pd-review-name">
                              {review.name || 'Anonymous'}
                            </span>
                            <StarRow rating={review.rating || 0} size={11} />
                          </div>
                          {review.createdAt && (
                            <span className="pd-review-date">
                              {new Date(review.createdAt).toLocaleDateString(
                                'en-GB',
                                { day: 'numeric', month: 'short', year: 'numeric' }
                              )}
                            </span>
                          )}
                        </div>
                        {review.comment && (
                          <p className="pd-review-comment">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}
            </div>
          </div>

          {/* Related */}
          {relatedProducts.length > 0 && (
            <div className="pd-related-section">
              <h2 className="pd-related-title">
                More in {product.category?.replace(/-/g, ' ') || 'this category'}
              </h2>
              <div className="pd-related-grid">
                {relatedProducts
                  .slice(0,6)
                  .map((rp) => (
                    <RelatedProductCard key={rp._id} product={rp} />
                  ))}
              </div>
              <div className="pd-view-all-wrap">
                <Link href="/listings" className="pd-view-all-btn">
                  View all listings →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatFab onClick={() => handleAction('contact')} />
      <StickyCartBar
        inStock={inStock}
        lineTotal={lineTotal}
        quantity={quantity}
        addingToCart={addingToCart}
        onAddToCart={handleAddToCart}
      />

      <GuestCheckout
        product={product}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        referralCode={referralCode}
      />
    </>
  );
}