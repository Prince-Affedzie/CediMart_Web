// src/app/product/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProductById, getProductsByCategory } from '@/apis/productApi';

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

// ─── Download App Modal ────────────────────────────────────────────────────────
function DownloadAppModal({ isOpen, onClose, action }) {
  if (!isOpen) return null;

  const actionText = action === 'contact' 
    ? 'chat with sellers and negotiate prices' 
    : 'save products to your wishlist and get price alerts';

  const actionEmoji = action === 'contact' ? '💬' : '♡';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-icon">{actionEmoji}</div>
        <h2 className="modal-title">Download the CediMart App</h2>
        <p className="modal-text">
          To {actionText}, download the CediMart app for the full experience. 
          Available on iOS and Android — free forever.
        </p>

        <div className="modal-features">
          <div className="modal-feature">
            <span>🛡️</span> Verified Sellers
          </div>
          <div className="modal-feature">
            <span>💬</span> In-app Chat
          </div>
          <div className="modal-feature">
            <span>🔔</span> Price Alerts
          </div>
          <div className="modal-feature">
            <span>📍</span> Campus Filtering
          </div>
        </div>

        <div className="modal-buttons">
          <a 
            href="https://apps.apple.com/us/app/cedimart/id6762318566" 
            target="_blank" 
            rel="noopener noreferrer"
            className="modal-btn primary"
          >
            🍎 Download on App Store
          </a>
          <a 
            href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" 
            target="_blank" 
            rel="noopener noreferrer"
            className="modal-btn secondary"
          >
            ▶ Get it on Google Play
          </a>
        </div>

        <button className="modal-continue" onClick={onClose}>
          Continue browsing on web →
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="sk-wrapper">
      <div className="sk-gallery">
        <div className="sk-main-img" />
        <div className="sk-thumbs">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sk-thumb" />
          ))}
        </div>
      </div>
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

// ─── Related product card ──────────────────────────────────────────────────────
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
            onError={e => { e.target.src = 'https://placehold.co/400x300/13131E/52525B?text=No+Image'; }}
          />
        ) : (
          <div className="related-img-placeholder">📦</div>
        )}
      </div>
      <div className="related-info">
        <p className="related-name">{product.name}</p>
        <p className="related-price">{fmtPrice(product.price)}</p>
        {product.campus && <span className="related-campus">{product.campus}</span>}
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('contact');

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
        console.log(res)
        const data = res?.data?.data?.product || res?.data?.product || res?.data || null;
        setProduct(data);
        
        if (data?.category) {
          try {
            const relatedRes = await getProductsByCategory(data.category, { limit: 8, sort: 'newest' });
            const relatedData = relatedRes?.data?.data?.products || 
                               relatedRes?.data?.data || 
                               relatedRes?.data?.products || 
                               [];
            setRelatedProducts(
              Array.isArray(relatedData) 
                ? relatedData.filter(p => p._id !== id).slice(0, 8)
                : []
            );
          } catch (err) {
            console.error('Failed to fetch related products:', err);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleContactSeller = () => {
    setModalAction('contact');
    setModalOpen(true);
  };

  const handleSaveProduct = () => {
    setModalAction('save');
    setModalOpen(true);
  };

  if (loading) {
    return (
      <>
        <style>{productStyles}</style>
        <style>{modalStyles}</style>
        <div className="pd-page">
          <div className="pd-container">
            <ProductSkeleton />
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <style>{productStyles}</style>
        <div className="pd-page">
          <div className="pd-container">
            <div className="pd-not-found">
              <div className="pd-not-found-icon">🔍</div>
              <h2>Product Not Found</h2>
              <p>This listing may have been removed or doesn't exist.</p>
              <Link href="/" className="pd-back-btn">← Back to Home</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const images = product.images?.length > 0 
    ? product.images 
    : [product.image || 'https://placehold.co/600x600/13131E/52525B?text=No+Image'];
  
  const cond = CONDITION_MAP[product.condition] || null;
  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100)
    : null;

  return (
    <>
      <style>{productStyles}</style>
      <style>{modalStyles}</style>

      {/* Download App Modal */}
      <DownloadAppModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        action={modalAction} 
      />

      <div className="pd-page">
        <div className="pd-nav">
          <div className="pd-nav-inner">
            <Link href="/" className="pd-nav-back">← Back</Link>
            <Link href="/listings" className="pd-nav-link">All Listings</Link>
          </div>
        </div>

        <div className="pd-container">
          <div className="pd-grid">
            <div className="pd-gallery">
              <div className="pd-main-img-wrap">
                {isOnSale && (
                  <span className="pd-sale-badge">-{discountPct}% OFF</span>
                )}
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  className="pd-main-img"
                  onError={e => { e.target.src = 'https://placehold.co/600x600/13131E/52525B?text=No+Image'; }}
                />
              </div>
              
              {images.length > 1 && (
                <div className="pd-thumb-strip">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`pd-thumb ${i === selectedImage ? 'active' : ''}`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} - ${i + 1}`}
                        onError={e => { e.target.src = 'https://placehold.co/100x100/13131E/52525B?text=No+Image'; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pd-details">
              <div className="pd-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/listings">Listings</Link>
                <span>/</span>
                <span className="pd-breadcrumb-current">{product.name}</span>
              </div>

              <div className="pd-title-row">
                <h1 className="pd-title">{product.name}</h1>
                {cond && (
                  <span className="pd-condition" style={{ background: cond.bg, color: cond.color }}>
                    {cond.label}
                  </span>
                )}
              </div>

              <div className="pd-meta-row">
                {product.campus && (
                  <span className="pd-campus-badge">📍 {product.campus}</span>
                )}
                {product.category && (
                  <span className="pd-category-badge">
                    {product.category.replace(/-/g, ' ')}
                  </span>
                )}
                {product.negotiable && (
                  <span className="pd-nego-badge">💰 Price Negotiable</span>
                )}
              </div>

              <div className="pd-price-section">
                {isOnSale ? (
                  <>
                    <span className="pd-original-price">
                      {fmtPrice(product.discountInfo.originalPrice)}
                    </span>
                    <div className="pd-price-row">
                      <span className="pd-price sale">{fmtPrice(product.price)}</span>
                      <span className="pd-save-badge">Save {discountPct}%</span>
                    </div>
                  </>
                ) : (
                  <span className="pd-price">{fmtPrice(product.price)}</span>
                )}
              </div>

              {product.description && (
                <div className="pd-description">
                  <h3>Description</h3>
                  <p>{product.description}</p>
                </div>
              )}

              <div className="pd-info-grid">
                {product.brand && (
                  <div className="pd-info-item">
                    <span className="pd-info-label">Brand</span>
                    <span className="pd-info-value">{product.brand}</span>
                  </div>
                )}
                {product.condition && (
                  <div className="pd-info-item">
                    <span className="pd-info-label">Condition</span>
                    <span className="pd-info-value">{cond?.label || product.condition}</span>
                  </div>
                )}
                {product.campus && (
                  <div className="pd-info-item">
                    <span className="pd-info-label">Campus</span>
                    <span className="pd-info-value">{product.campus}</span>
                  </div>
                )}
                {product.location && (
                  <div className="pd-info-item">
                    <span className="pd-info-label">Location</span>
                    <span className="pd-info-value">{product.location}</span>
                  </div>
                )}
              </div>

              <div className="pd-actions">
                <button className="pd-contact-btn" onClick={handleContactSeller}>
                  💬 Contact Seller
                </button>
                <button className="pd-wishlist-btn" onClick={handleSaveProduct}>
                  ♡ Save
                </button>
              </div>

              {product.vendor && (
                <div className="pd-seller-card">
                  <div className="pd-seller-avatar">
                    {product.vendor?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="pd-seller-info">
                    <p className="pd-seller-name">
                      {product.vendor?.name || 'Seller'}
                    </p>
                    <p className="pd-seller-stats">
                      {product.vendor?.listingsCount 
                        ? `${product.vendor.listingsCount} active listings` 
                        : 'Verified Student Seller'}
                    </p>
                  </div>
                  <span className="pd-verified-badge">✓ Verified</span>
                </div>
              )}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="pd-related-section">
              <h2 className="pd-related-title">
                More in {product.category?.replace(/-/g, ' ') || 'this category'}
              </h2>
              <div className="pd-related-grid">
                {relatedProducts.slice(0, isMobile ? 4 : 6).map((rp) => (
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
    </>
  );
}

// ─── Modal Styles ──────────────────────────────────────────────────────────────
const modalStyles = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  .modal-content {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 24px;
    padding: clamp(28px,4vw,40px);
    max-width: 480px;
    width: 100%;
    text-align: center;
    position: relative;
    animation: slideUp 0.3s ease;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${C.elev};
    border: 1px solid ${C.border};
    color: ${C.off};
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .2s;
  }
  .modal-close:hover {
    color: ${C.white};
    border-color: ${C.indigoL};
  }

  .modal-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }

  .modal-title {
    font-size: clamp(20px,3vw,26px);
    font-weight: 800;
    margin-bottom: 10px;
    letter-spacing: -0.5px;
  }

  .modal-text {
    font-size: 14px;
    color: ${C.off};
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .modal-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 28px;
  }

  .modal-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    color: ${C.off};
  }
  .modal-feature span {
    font-size: 18px;
  }

  .modal-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .modal-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
    transition: all .2s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .modal-btn.primary {
    background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL});
    color: #fff;
    box-shadow: 0 8px 24px ${C.indigoDim};
  }
  .modal-btn.primary:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  .modal-btn.secondary {
    background: ${C.elev};
    color: ${C.white};
    border: 1.5px solid ${C.border};
  }
  .modal-btn.secondary:hover {
    border-color: ${C.indigoL};
    background: ${C.indigoDim};
  }

  .modal-continue {
    background: none;
    border: none;
    color: ${C.muted};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: color .2s;
  }
  .modal-continue:hover {
    color: ${C.white};
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @media (max-width: 480px) {
    .modal-features {
      grid-template-columns: 1fr;
    }
    .modal-content {
      padding: 24px 20px;
    }
  }
`;

// ─── Product Styles ────────────────────────────────────────────────────────────
const productStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pd-page {
    min-height: 100vh;
    background: ${C.void};
    color: ${C.white};
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .pd-nav {
    background: ${C.surf};
    border-bottom: 1px solid ${C.border};
    padding: 12px 24px;
  }
  .pd-nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .pd-nav-back {
    color: ${C.off};
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: color .2s;
  }
  .pd-nav-back:hover { color: ${C.white}; }
  .pd-nav-link {
    color: ${C.muted};
    text-decoration: none;
    font-size: 13px;
    transition: color .2s;
  }
  .pd-nav-link:hover { color: ${C.indigoL}; }

  .pd-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(24px,4vw,48px) clamp(16px,4vw,32px);
  }

  .pd-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(32px,5vw,64px);
    align-items: start;
  }
  @media (max-width: 768px) {
    .pd-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  .pd-gallery {
    position: sticky;
    top: 80px;
  }
  @media (max-width: 768px) {
    .pd-gallery {
      position: relative;
      top: 0;
    }
  }
  .pd-main-img-wrap {
    position: relative;
    background: ${C.elev};
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid ${C.border};
    aspect-ratio: 1;
  }
  .pd-main-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 16px;
  }
  .pd-sale-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: ${C.coral};
    color: #fff;
    font-size: 13px;
    font-weight: 800;
    padding: 6px 14px;
    border-radius: 10px;
    z-index: 2;
  }
  .pd-thumb-strip {
    display: flex;
    gap: 10px;
    margin-top: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .pd-thumb {
    width: 72px;
    height: 72px;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid ${C.border};
    cursor: pointer;
    flex-shrink: 0;
    transition: all .2s;
    background: ${C.elev};
    padding: 0;
  }
  .pd-thumb.active {
    border-color: ${C.indigoL};
    box-shadow: 0 0 0 2px ${C.indigoDim};
  }
  .pd-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pd-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .pd-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: ${C.muted};
    flex-wrap: wrap;
  }
  .pd-breadcrumb a {
    color: ${C.off};
    text-decoration: none;
  }
  .pd-breadcrumb a:hover { color: ${C.indigoL}; }
  .pd-breadcrumb-current {
    color: ${C.white};
    font-weight: 600;
  }
  .pd-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pd-title {
    font-size: clamp(22px,3vw,32px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.5px;
    flex: 1;
    min-width: 200px;
  }
  .pd-condition {
    font-size: 12px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 8px;
    white-space: nowrap;
  }
  .pd-meta-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pd-campus-badge,
  .pd-category-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 8px;
    background: ${C.indigoDim};
    color: ${C.indigoL};
  }
  .pd-nego-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 8px;
    background: ${C.amberDim};
    color: ${C.amber};
    border: 1px solid rgba(245,158,11,.25);
  }
  .pd-price-section {
    padding: 16px 0;
    border-top: 1px solid ${C.border};
    border-bottom: 1px solid ${C.border};
  }
  .pd-price {
    font-size: clamp(28px,4vw,40px);
    font-weight: 900;
    color: ${C.amber};
    font-family: 'JetBrains Mono', monospace;
  }
  .pd-price.sale {
    color: ${C.coral};
  }
  .pd-original-price {
    font-size: 16px;
    color: ${C.muted};
    text-decoration: line-through;
    font-family: 'JetBrains Mono', monospace;
    display: block;
    margin-bottom: 4px;
  }
  .pd-price-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pd-save-badge {
    font-size: 12px;
    font-weight: 700;
    background: ${C.coralDim};
    color: ${C.coral};
    padding: 4px 10px;
    border-radius: 8px;
  }
  .pd-description h3 {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .pd-description p {
    font-size: 14px;
    color: ${C.off};
    line-height: 1.7;
  }
  .pd-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (max-width: 480px) {
    .pd-info-grid {
      grid-template-columns: 1fr;
    }
  }
  .pd-info-item {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 12px 16px;
  }
  .pd-info-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: ${C.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .pd-info-value {
    font-size: 14px;
    font-weight: 600;
    color: ${C.white};
  }
  .pd-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
  .pd-contact-btn {
    flex: 1;
    background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL});
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    padding: 14px 24px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 8px 28px ${C.indigoDim};
    transition: all .22s;
  }
  .pd-contact-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
  .pd-wishlist-btn {
    width: 52px;
    background: ${C.surf};
    border: 1px solid ${C.border};
    color: ${C.coral};
    font-size: 18px;
    border-radius: 14px;
    cursor: pointer;
    transition: all .2s;
  }
  .pd-wishlist-btn:hover {
    border-color: ${C.coral};
    background: ${C.coralDim};
  }
  .pd-seller-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 16px;
    margin-top: 8px;
  }
  .pd-seller-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL});
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }
  .pd-seller-info {
    flex: 1;
  }
  .pd-seller-name {
    font-size: 15px;
    font-weight: 700;
  }
  .pd-seller-stats {
    font-size: 12px;
    color: ${C.muted};
    margin-top: 2px;
  }
  .pd-verified-badge {
    font-size: 11px;
    font-weight: 700;
    color: ${C.emerald};
    background: ${C.emeraldDim};
    padding: 5px 10px;
    border-radius: 8px;
    white-space: nowrap;
  }

  .pd-related-section {
    margin-top: clamp(48px,6vw,80px);
    padding-top: clamp(32px,4vw,48px);
    border-top: 1px solid ${C.border};
  }
  .pd-related-title {
    font-size: clamp(20px,3vw,28px);
    font-weight: 800;
    margin-bottom: 24px;
    letter-spacing: -0.5px;
  }
  .pd-related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
  }
  @media (max-width: 480px) {
    .pd-related-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }
  .related-card {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 14px;
    overflow: hidden;
    text-decoration: none;
    transition: all .2s;
    display: flex;
    flex-direction: column;
  }
  .related-card:hover {
    border-color: ${C.indigoL};
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,.35);
  }
  .related-img-wrap {
    width: 100%;
    aspect-ratio: 1;
    background: ${C.elev};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .related-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 12px;
  }
  .related-img-placeholder {
    font-size: 36px;
  }
  .related-info {
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .related-name {
    font-size: 13px;
    font-weight: 700;
    color: ${C.white};
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .related-price {
    font-size: 15px;
    font-weight: 800;
    color: ${C.amber};
    font-family: 'JetBrains Mono', monospace;
  }
  .related-campus {
    font-size: 10px;
    font-weight: 600;
    color: ${C.indigoL};
    background: ${C.indigoDim};
    padding: 2px 7px;
    border-radius: 6px;
    align-self: flex-start;
    font-family: 'JetBrains Mono', monospace;
  }
  .pd-view-all-wrap {
    display: flex;
    justify-content: center;
    margin-top: 28px;
  }
  .pd-view-all-btn {
    border: 1.5px solid ${C.border};
    color: ${C.off};
    font-weight: 600;
    font-size: 14px;
    padding: 11px 26px;
    border-radius: 12px;
    text-decoration: none;
    transition: all .22s;
  }
  .pd-view-all-btn:hover {
    border-color: ${C.indigoL};
    color: ${C.indigoL};
  }

  .pd-not-found {
    text-align: center;
    padding: 80px 20px;
  }
  .pd-not-found-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  .pd-not-found h2 {
    font-size: 24px;
    margin-bottom: 8px;
  }
  .pd-not-found p {
    color: ${C.muted};
    margin-bottom: 24px;
  }
  .pd-back-btn {
    display: inline-flex;
    background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL});
    color: #fff;
    font-weight: 700;
    padding: 12px 24px;
    border-radius: 12px;
    text-decoration: none;
    transition: all .22s;
  }
  .pd-back-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  .sk-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }
  @media (max-width: 768px) {
    .sk-wrapper {
      grid-template-columns: 1fr;
    }
  }
  .sk-gallery {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .sk-main-img {
    aspect-ratio: 1;
    background: ${C.surf};
    border-radius: 20px;
    animation: shimmer 1.8s ease-in-out infinite;
    background: linear-gradient(90deg, ${C.surf} 25%, ${C.elev} 50%, ${C.surf} 75%);
    background-size: 400% 100%;
  }
  .sk-thumbs {
    display: flex;
    gap: 10px;
  }
  .sk-thumb {
    width: 72px;
    height: 72px;
    border-radius: 12px;
    background: ${C.surf};
    animation: shimmer 1.8s ease-in-out infinite;
    background: linear-gradient(90deg, ${C.surf} 25%, ${C.elev} 50%, ${C.surf} 75%);
    background-size: 400% 100%;
  }
  .sk-details {
    display: flex;
    flex-direction: column;
  }
  .sk-line {
    border-radius: 8px;
    background: ${C.surf};
    animation: shimmer 1.8s ease-in-out infinite;
    background: linear-gradient(90deg, ${C.surf} 25%, ${C.elev} 50%, ${C.surf} 75%);
    background-size: 400% 100%;
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @media (max-width: 768px) {
    .pd-nav { padding: 10px 16px; }
    .pd-actions { flex-direction: column; }
    .pd-wishlist-btn { width: 100%; }
  }
`;