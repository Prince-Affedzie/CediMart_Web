// src/app/product/[id]/page.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProductById, getProductsByCategory } from '@/apis/productApi';
import GuestCheckout from '@/components/GuestCheckOut';

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

const CONDITION_MAP = {
  'new':           { label: 'New',        bg: '#10B98118', color: '#10B981' },
  'like-new':      { label: 'Like New',   bg: '#10B98118', color: '#10B981' },
  'excellent':     { label: 'Excellent',  bg: '#6366F118', color: '#818CF8' },
  'good':          { label: 'Good',       bg: '#F59E0B18', color: '#F59E0B' },
  'fair':          { label: 'Fair',       bg: '#F43F5E18', color: '#F87171' },
  'slightly-used': { label: 'Used',       bg: '#F43F5E18', color: '#F87171' },
  'for-parts':     { label: 'Parts',      bg: '#71717A18', color: '#71717A' },
};

const fmtPrice = (p) =>
  p == null ? '—' : `GH₵\u00A0${Number(p).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;

const safeStr = (val) => {
  if (!val) return null;
  if (typeof val === 'object') return val.campusArea || val.name || val.hostel || null;
  return String(val);
};

// ─── Download App Modal ────────────────────────────────────────────────────────
function DownloadAppModal({ isOpen, onClose, action }) {
  if (!isOpen) return null;
  const actionText = action === 'buy' 
    ? 'purchase this item and enjoy secure in-app payments' 
    : action === 'contact'
      ? 'chat with sellers and negotiate prices' 
      : 'save products to your wishlist and get price alerts';
  const actionEmoji = action === 'buy' ? '🛒' : action === 'contact' ? '💬' : '♡';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-icon">{actionEmoji}</div>
        <h2 className="modal-title">Download the CediMart App</h2>
        <p className="modal-text">To {actionText}, download the CediMart app for the full experience. Available on iOS and Android — free forever.</p>
        <div className="modal-features">
          <div className="modal-feature"><span>🛡️</span> Verified Sellers</div>
          <div className="modal-feature"><span>💬</span> In-app Chat</div>
          <div className="modal-feature"><span>🔔</span> Price Alerts</div>
          <div className="modal-feature"><span>📍</span> Campus Filtering</div>
        </div>
        <div className="modal-buttons">
          <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="modal-btn primary">🍎 Download on App Store</a>
          <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="modal-btn secondary">▶ Get it on Google Play</a>
        </div>
        <button className="modal-continue" onClick={onClose}>Continue browsing on web →</button>
      </div>
    </div>
  );
}

// ─── Image Carousel ────────────────────────────────────────────────────────────
function ImageCarousel({ images, productName, isOnSale, discountPct }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef(null);

  const minSwipeDistance = 50;

  const goTo = useCallback((index) => {
    if (index >= 0 && index < images.length) {
      setCurrent(index);
    }
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const diff = touchStart - currentTouch;
    setDragOffset(diff);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
    
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  if (!images.length) {
    return (
      <div className="pd-carousel">
        <div className="pd-carousel-track">
          <div className="pd-carousel-slide">
            <div className="pd-carousel-img-wrap">
              <div className="pd-carousel-placeholder">📦</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="pd-carousel" 
      ref={carouselRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Sale badge */}
      {isOnSale && <span className="pd-sale-badge">-{discountPct}% OFF</span>}

      {/* Image counter */}
      <div className="pd-carousel-counter">
        {current + 1} / {images.length}
      </div>

      {/* Arrow buttons (hidden on mobile) */}
      {images.length > 1 && (
        <>
          <button className="pd-carousel-arrow left" onClick={goPrev} aria-label="Previous image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="pd-carousel-arrow right" onClick={goNext} aria-label="Next image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      {/* Slides track */}
      <div 
        className="pd-carousel-track"
        style={{ 
          transform: `translateX(calc(-${current * 100}% - ${isDragging ? dragOffset : 0}px))`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
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
                onError={e => { e.target.src = 'https://placehold.co/600x600/13131E/52525B?text=No+Image'; }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="pd-carousel-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`pd-carousel-dot ${i === current ? 'active' : ''}`}
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
      <div className="sk-gallery"><div className="sk-main-img" /></div>
      <div className="sk-details">
        <div className="sk-line" style={{ width: '30%', height: 12 }} />
        <div className="sk-line" style={{ width: '80%', height: 24, marginTop: 12 }} />
        <div className="sk-line" style={{ width: '40%', height: 28, marginTop: 12 }} />
        <div className="sk-line" style={{ width: '100%', height: 14, marginTop: 20 }} />
        <div className="sk-line" style={{ width: '100%', height: 14, marginTop: 8 }} />
        <div className="sk-line" style={{ width: '60%', height: 14, marginTop: 8 }} />
        <div className="sk-line" style={{ width: '200px', height: 44, marginTop: 24, borderRadius: 12 }} />
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
        {img ? <img src={img} alt={product.name} className="related-img" onError={e => { e.target.src = 'https://placehold.co/400x300/13131E/52525B?text=No+Image'; }} /> : <div className="related-img-placeholder">📦</div>}
      </div>
      <div className="related-info">
        <p className="related-name">{product.name}</p>
        <p className="related-price">{fmtPrice(product.price)}</p>
        {product.campus && <span className="related-campus">{typeof product.campus === 'object' ? product.campus.name : product.campus}</span>}
      </div>
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('contact');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        const data = res?.data?.data?.product || res?.data?.product || res?.data || null;
        setProduct(data);
        if (data?.category) {
          try {
            const relatedRes = await getProductsByCategory(data.category, { limit: 8, sort: 'newest' });
            const relatedData = relatedRes?.data?.data?.products || relatedRes?.data?.data || relatedRes?.data?.products || [];
            setRelatedProducts(Array.isArray(relatedData) ? relatedData.filter(p => p._id !== id).slice(0, 8) : []);
          } catch (err) { console.error('Failed to fetch related products:', err); }
        }
      } catch (err) { console.error('Failed to fetch product:', err); setProduct(null); }
      finally { setLoading(false); }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAction = (action) => { setModalAction(action); setModalOpen(true); };

  if (loading) return <><style>{productStyles}</style><style>{modalStyles}</style><div className="pd-page"><div className="pd-container"><ProductSkeleton /></div></div></>;
  if (!product) return <><style>{productStyles}</style><div className="pd-page"><div className="pd-container"><div className="pd-not-found"><div className="pd-not-found-icon">🔍</div><h2>Product Not Found</h2><p>This listing may have been removed or doesn't exist.</p><Link href="/" className="pd-back-btn">← Back to Home</Link></div></div></div></>;

  const images = product.images?.length > 0 ? product.images : [product.image || 'https://placehold.co/600x600/13131E/52525B?text=No+Image'];
  const cond = CONDITION_MAP[product.condition] || null;
  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const discountPct = isOnSale ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100) : null;
  const campusStr = safeStr(product.campus);
  const locationStr = safeStr(product.location);
  const specs = product.specifications instanceof Map ? Object.fromEntries(product.specifications) : product.specifications || {};

  return (
    <>
      <style>{productStyles}</style>
      <style>{modalStyles}</style>
      <DownloadAppModal isOpen={modalOpen} onClose={() => setModalOpen(false)} action={modalAction} />

      <div className="pd-page">
        <div className="pd-nav">
          <div className="pd-nav-inner">
            <Link href="/" className="pd-nav-back">← Back</Link>
            <Link href="/listings" className="pd-nav-link">All Listings</Link>
          </div>
        </div>

        <div className="pd-container">
          <div className="pd-grid">
            {/* ── Image Carousel ── */}
            <div className="pd-gallery">
              <ImageCarousel 
                images={images} 
                productName={product.name}
                isOnSale={isOnSale}
                discountPct={discountPct}
              />
            </div>

            {/* ── Product Details ── */}
            <div className="pd-details">
              <div className="pd-breadcrumb">
                <Link href="/">Home</Link><span>/</span>
                <Link href="/listings">Listings</Link><span>/</span>
                <span className="pd-breadcrumb-current">{product.name}</span>
              </div>

              <div className="pd-title-row">
                <h1 className="pd-title">{product.name}</h1>
                {cond && <span className="pd-condition" style={{ background: cond.bg, color: cond.color }}>{cond.label}</span>}
              </div>

              <div className="pd-meta-inline">
                {campusStr && <span>📍 {campusStr}</span>}
                {product.category && <span>📂 {product.category.replace(/-/g, ' ')}</span>}
                {product.brand && <span>🏷️ {product.brand}</span>}
                {product.negotiable && <span className="pd-meta-nego">💰 Negotiable</span>}
                <span className={`pd-meta-stock ${(product.countInStock || 0) > 0 ? 'in' : 'out'}`}>
                  {(product.countInStock || 0) > 0 ? `✓ ${product.countInStock} in stock` : '✕ Out of stock'}
                </span>
              </div>

              <div className="pd-price-section">
                {isOnSale ? (
                  <>
                    <span className="pd-original-price">{fmtPrice(product.discountInfo.originalPrice)}</span>
                    <div className="pd-price-row">
                      <span className="pd-price sale">{fmtPrice(product.price)}</span>
                      <span className="pd-save-badge">Save {discountPct}%</span>
                    </div>
                  </>
                ) : (
                  <span className="pd-price">{fmtPrice(product.price)}</span>
                )}
              </div>

              <div className="pd-actions">
                <button className="pd-buy-btn" onClick={() => setCheckoutOpen(true)}>🛒 Buy Now</button>
                <button className="pd-contact-btn-sm" onClick={() => handleAction('contact')}>💬 Chat Seller</button>
                <button className="pd-save-btn" onClick={() => handleAction('save')}>♡</button>
              </div>

              {product.description && (
                <div className="pd-description">
                  <h3>Description</h3>
                  <p>{product.description}</p>
                </div>
              )}

              {Object.keys(specs).length > 0 && (
                <div className="pd-specs">
                  <h3>Specifications</h3>
                  <div className="pd-specs-list">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="pd-spec-item">
                        <span className="pd-spec-key">{key}</span>
                        <span className="pd-spec-val">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {locationStr && (
                <div className="pd-location">
                  <span className="pd-location-icon">📍</span>
                  <span>{locationStr}</span>
                  {product.location?.hostel && <span className="pd-location-hostel"> · {product.location.hostel}</span>}
                </div>
              )}

              {product.vendor && (
                <div className="pd-seller-card">
                  <div className="pd-seller-avatar">{product.vendor?.name?.charAt(0) || 'S'}</div>
                  <div className="pd-seller-info">
                    <p className="pd-seller-name">{product.vendor?.name || 'Seller'}</p>
                    <p className="pd-seller-stats">{product.vendor?.listingsCount ? `${product.vendor.listingsCount} active listings` : 'Verified Student Seller'}</p>
                  </div>
                  <span className="pd-verified-badge">✓ Verified</span>
                </div>
              )}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="pd-related-section">
              <h2 className="pd-related-title">More in {product.category?.replace(/-/g, ' ') || 'this category'}</h2>
              <div className="pd-related-grid">
                {relatedProducts.slice(0, isMobile ? 4 : 6).map((rp) => <RelatedProductCard key={rp._id} product={rp} />)}
              </div>
              <div className="pd-view-all-wrap">
                <Link href="/listings" className="pd-view-all-btn">View all listings →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <GuestCheckout 
        product={product}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={(order) => { console.log('Order placed:', order); }}
      />
    </>
  );
}

// ─── Modal Styles ──────────────────────────────────────────────────────────────
const modalStyles = `
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn .2s ease; }
  .modal-content { background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 24px; padding: clamp(28px,4vw,40px); max-width: 480px; width: 100%; text-align: center; position: relative; animation: slideUp .3s ease; max-height: 90vh; overflow-y: auto; }
  .modal-close { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; background: ${C.elev}; border: 1px solid ${C.border}; color: ${C.off}; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
  .modal-close:hover { color: ${C.white}; border-color: ${C.indigoL}; }
  .modal-icon { font-size: 56px; margin-bottom: 16px; }
  .modal-title { font-size: clamp(20px,3vw,26px); font-weight: 800; margin-bottom: 10px; letter-spacing: -.5px; }
  .modal-text { font-size: 14px; color: ${C.off}; line-height: 1.6; margin-bottom: 24px; }
  .modal-features { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 28px; }
  .modal-feature { display: flex; align-items: center; gap: 8px; background: ${C.elev}; border: 1px solid ${C.border}; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-weight: 600; color: ${C.off}; }
  .modal-feature span { font-size: 18px; }
  .modal-buttons { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .modal-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; border-radius: 14px; font-weight: 700; font-size: 14px; text-decoration: none; transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .modal-btn.primary { background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL}); color: #fff; box-shadow: 0 8px 24px ${C.indigoDim}; }
  .modal-btn.primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
  .modal-btn.secondary { background: ${C.elev}; color: ${C.white}; border: 1.5px solid ${C.border}; }
  .modal-btn.secondary:hover { border-color: ${C.indigoL}; background: ${C.indigoDim}; }
  .modal-continue { background: none; border: none; color: ${C.muted}; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: color .2s; }
  .modal-continue:hover { color: ${C.white}; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @media(max-width:480px){ .modal-features{grid-template-columns:1fr} .modal-content{padding:24px 20px} }
`;

// ─── Product Styles ────────────────────────────────────────────────────────────
const productStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  .pd-page{min-height:100vh;background:${C.void};color:${C.white};font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden}
  .pd-nav{background:${C.surf};border-bottom:1px solid ${C.border};padding:12px 24px}
  .pd-nav-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;gap:20px}
  .pd-nav-back{color:${C.off};text-decoration:none;font-size:14px;font-weight:600;transition:color .2s}
  .pd-nav-back:hover{color:${C.white}}
  .pd-nav-link{color:${C.muted};text-decoration:none;font-size:13px;transition:color .2s}
  .pd-nav-link:hover{color:${C.indigoL}}
  .pd-container{max-width:1280px;margin:0 auto;padding:clamp(24px,4vw,48px) clamp(16px,4vw,32px);overflow-x:hidden}
  .pd-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,5vw,64px);align-items:start}
  @media(max-width:768px){.pd-grid{grid-template-columns:1fr;gap:24px}}
  .pd-gallery{position:sticky;top:80px}
  @media(max-width:768px){.pd-gallery{position:relative;top:0}}

  /* ══════════════════════ IMAGE CAROUSEL ══════════════════════ */
  .pd-carousel {
    position: relative;
    background: ${C.elev};
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid ${C.border};
    aspect-ratio: 1;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
  }
  .pd-carousel-track {
    display: flex;
    height: 100%;
    will-change: transform;
  }
  .pd-carousel-slide {
    min-width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pd-carousel-img-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .pd-carousel-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
  }
  .pd-carousel-placeholder {
    font-size: 64px;
    opacity: 0.5;
  }
  .pd-carousel-counter {
    position: absolute;
    top: 14px;
    right: 14px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 20px;
    z-index: 2;
    font-family: 'JetBrains Mono', monospace;
  }
  .pd-carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all .2s;
    backdrop-filter: blur(4px);
  }
  .pd-carousel-arrow:hover {
    background: rgba(0,0,0,0.75);
    border-color: rgba(255,255,255,0.3);
  }
  .pd-carousel-arrow.left { left: 12px; }
  .pd-carousel-arrow.right { right: 12px; }
  .pd-carousel-dots {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 2;
  }
  .pd-carousel-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all .25s;
  }
  .pd-carousel-dot.active {
    background: #fff;
    transform: scale(1.3);
    box-shadow: 0 0 8px rgba(255,255,255,0.4);
  }
  @media (max-width: 768px) {
    .pd-carousel-arrow { display: none; }
    .pd-carousel { border-radius: 16px; }
  }

  .pd-sale-badge{position:absolute;top:14px;left:14px;background:${C.coral};color:#fff;font-size:13px;font-weight:800;padding:6px 14px;border-radius:10px;z-index:3}
  .pd-details{display:flex;flex-direction:column;gap:14px}
  .pd-breadcrumb{display:flex;align-items:center;gap:8px;font-size:12px;color:${C.muted};flex-wrap:wrap}
  .pd-breadcrumb a{color:${C.off};text-decoration:none}
  .pd-breadcrumb a:hover{color:${C.indigoL}}
  .pd-breadcrumb-current{color:${C.white};font-weight:600}
  .pd-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .pd-title{font-size:clamp(22px,3vw,28px);font-weight:800;line-height:1.2;letter-spacing:-.5px;flex:1;min-width:200px}
  .pd-condition{font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;white-space:nowrap}
  .pd-meta-inline{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:12.5px;color:${C.off}}
  .pd-meta-inline span{display:inline-flex;align-items:center;gap:4px}
  .pd-meta-nego{color:${C.amber};font-weight:600}
  .pd-meta-stock{font-weight:600}
  .pd-meta-stock.in{color:${C.emerald}}
  .pd-meta-stock.out{color:${C.coral}}
  .pd-price-section{padding:12px 0;border-top:1px solid ${C.border};border-bottom:1px solid ${C.border}}
  .pd-price{font-size:clamp(28px,4vw,36px);font-weight:900;color:${C.amber};font-family:'JetBrains Mono',monospace}
  .pd-price.sale{color:${C.coral}}
  .pd-original-price{font-size:15px;color:${C.muted};text-decoration:line-through;font-family:'JetBrains Mono',monospace;display:block;margin-bottom:2px}
  .pd-price-row{display:flex;align-items:center;gap:12px}
  .pd-save-badge{font-size:11px;font-weight:700;background:${C.coralDim};color:${C.coral};padding:3px 8px;border-radius:6px}
  .pd-actions{display:flex;gap:10px;align-items:center}
  .pd-buy-btn{flex:1;background:linear-gradient(135deg,${C.emerald},#34D399);color:#000;font-weight:700;font-size:15px;padding:14px 20px;border-radius:14px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;box-shadow:0 6px 20px rgba(16,185,129,.25);transition:all .22s;white-space:nowrap}
  .pd-buy-btn:hover{filter:brightness(1.08);transform:translateY(-2px)}
  .pd-contact-btn-sm{background:${C.surf};border:1.5px solid ${C.border};color:${C.white};font-weight:600;font-size:13px;padding:14px 16px;border-radius:14px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;white-space:nowrap}
  .pd-contact-btn-sm:hover{border-color:${C.indigoL};background:${C.elev}}
  .pd-save-btn{width:48px;height:48px;background:${C.surf};border:1px solid ${C.border};color:${C.coral};font-size:18px;border-radius:14px;cursor:pointer;transition:all .2s;flex-shrink:0}
  .pd-save-btn:hover{border-color:${C.coral};background:${C.coralDim}}
  .pd-description h3{font-size:14px;font-weight:700;margin-bottom:6px}
  .pd-description p{font-size:14px;color:${C.off};line-height:1.7}
  .pd-specs{margin-top:4px}
  .pd-specs h3{font-size:14px;font-weight:700;margin-bottom:8px}
  .pd-specs-list{display:flex;flex-direction:column;gap:6px}
  .pd-spec-item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid ${C.border}60}
  .pd-spec-item:last-child{border-bottom:none}
  .pd-spec-key{font-size:13px;color:${C.muted};text-transform:capitalize}
  .pd-spec-val{font-size:13px;font-weight:600;color:${C.white}}
  .pd-location{display:flex;align-items:center;gap:6px;font-size:13px;color:${C.off};background:${C.surf};border:1px solid ${C.border};border-radius:10px;padding:10px 14px}
  .pd-location-icon{font-size:15px}
  .pd-location-hostel{color:${C.muted}}
  .pd-seller-card{display:flex;align-items:center;gap:12px;background:${C.surf};border:1px solid ${C.border};border-radius:14px;padding:12px 14px}
  .pd-seller-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${C.indigo},${C.indigoL});display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;flex-shrink:0}
  .pd-seller-info{flex:1}
  .pd-seller-name{font-size:13px;font-weight:700}
  .pd-seller-stats{font-size:11px;color:${C.muted};margin-top:1px}
  .pd-verified-badge{font-size:10px;font-weight:700;color:${C.emerald};background:${C.emeraldDim};padding:4px 8px;border-radius:6px;white-space:nowrap}
  .pd-related-section{margin-top:clamp(48px,6vw,80px);padding-top:clamp(32px,4vw,48px);border-top:1px solid ${C.border}}
  .pd-related-title{font-size:clamp(20px,3vw,26px);font-weight:800;margin-bottom:24px;letter-spacing:-.5px}
  .pd-related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
  @media(max-width:480px){.pd-related-grid{grid-template-columns:repeat(2,1fr);gap:10px}}
  .related-card{background:${C.surf};border:1px solid ${C.border};border-radius:14px;overflow:hidden;text-decoration:none;transition:all .2s;display:flex;flex-direction:column}
  .related-card:hover{border-color:${C.indigoL};transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.35)}
  .related-img-wrap{width:100%;aspect-ratio:1;background:${C.elev};display:flex;align-items:center;justify-content:center;overflow:hidden}
  .related-img{width:100%;height:100%;object-fit:contain;padding:12px}
  .related-img-placeholder{font-size:36px}
  .related-info{padding:10px 12px 12px;display:flex;flex-direction:column;gap:4px}
  .related-name{font-size:13px;font-weight:700;color:${C.white};line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .related-price{font-size:14px;font-weight:800;color:${C.amber};font-family:'JetBrains Mono',monospace}
  .related-campus{font-size:10px;font-weight:600;color:${C.indigoL};background:${C.indigoDim};padding:2px 6px;border-radius:4px;align-self:flex-start}
  .pd-view-all-wrap{display:flex;justify-content:center;margin-top:28px}
  .pd-view-all-btn{border:1.5px solid ${C.border};color:${C.off};font-weight:600;font-size:14px;padding:11px 26px;border-radius:12px;text-decoration:none;transition:all .22s}
  .pd-view-all-btn:hover{border-color:${C.indigoL};color:${C.indigoL}}
  .pd-not-found{text-align:center;padding:80px 20px}
  .pd-not-found-icon{font-size:64px;margin-bottom:16px}
  .pd-not-found h2{font-size:24px;margin-bottom:8px}
  .pd-not-found p{color:${C.muted};margin-bottom:24px}
  .pd-back-btn{display:inline-flex;background:linear-gradient(135deg,${C.indigo},${C.indigoL});color:#fff;font-weight:700;padding:12px 24px;border-radius:12px;text-decoration:none;transition:all .22s}
  .pd-back-btn:hover{filter:brightness(1.1);transform:translateY(-2px)}
  .sk-wrapper{display:grid;grid-template-columns:1fr 1fr;gap:48px}
  @media(max-width:768px){.sk-wrapper{grid-template-columns:1fr}}
  .sk-gallery{display:flex;flex-direction:column;gap:12px}
  .sk-main-img{aspect-ratio:1;background:${C.surf};border-radius:20px;animation:shimmer 1.8s ease-in-out infinite;background:linear-gradient(90deg,${C.surf} 25%,${C.elev} 50%,${C.surf} 75%);background-size:400% 100%}
  .sk-details{display:flex;flex-direction:column}
  .sk-line{border-radius:8px;background:${C.surf};animation:shimmer 1.8s ease-in-out infinite;background:linear-gradient(90deg,${C.surf} 25%,${C.elev} 50%,${C.surf} 75%);background-size:400% 100%}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @media(max-width:768px){.pd-nav{padding:10px 16px}.pd-actions{flex-wrap:wrap}.pd-buy-btn{min-width:100%}.pd-contact-btn-sm{flex:1}}
`;