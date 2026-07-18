// src/app/vendor/dashboard/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyProfileDetails, getMyProducts } from '@/apis/vendorApi';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  void:    '#09090F',
  surf:    '#13131E',
  elev:    '#1C1C2E',
  indigo:  '#6366F1',
  indigoL: '#818CF8',
  indigoDim:'rgba(99,102,241,0.12)',
  amber:   '#F59E0B',
  emerald: '#10B981',
  emeraldDim:'rgba(16,185,129,0.12)',
  coral:   '#F43F5E',
  white:   '#F1F0FF',
  off:     '#A8A8B8',
  muted:   '#52525B',
  border:  '#27273A',
};

const fmtPrice = (p) => p == null ? '—' : `GH₵ ${Number(p).toLocaleString()}`;

// ─── Product Card ──────────────────────────────────────────────────────────────
function MiniProductCard({ product }) {
  const img = product.images?.[0] || product.image;
  const isAvailable = product.isAvailable && (product.countInStock ?? 0) > 0;

  return (
    <div className={`vd-prod-card ${!isAvailable ? 'sold-out' : ''}`}>
      <div className="vd-prod-img">
        {img ? <img src={img} alt={product.name} /> : <span>📦</span>}
        {!isAvailable && <div className="vd-prod-sold-overlay">Sold Out</div>}
        {product.negotiable && <span className="vd-prod-nego">Nego</span>}
      </div>
      <div className="vd-prod-body">
        <p className="vd-prod-name">{product.name}</p>
        {product.campus && <span className="vd-prod-campus">{product.campus}</span>}
        <p className="vd-prod-price">{fmtPrice(product.price)}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [profileRes, productsRes] = await Promise.all([
        getMyProfileDetails(),
        getMyProducts(),
      ]);

      if (profileRes?.status === 200 || profileRes?.data?.success) {
        setProfile(profileRes.data.data || profileRes.data);
      }

      if (productsRes?.status === 200 || productsRes?.data?.success) {
        const data = productsRes.data?.data || productsRes.data || [];
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Failed to load dashboard. Please try refreshing.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorData');
    router.push('/vendor/login');
  };

  const isVerified = profile?.isVerified;
  const activeCount = products.filter(p => p.isAvailable && (p.countInStock ?? 0) > 0).length;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  if (loading) {
    return (
      <div className="vd-page">
        <div className="vd-loading">
          <div className="vd-spinner" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{dashboardStyles}</style>
      <div className="vd-page">
        <div className="vd-dash">
          {/* Header */}
          <div className="vd-header">
            <div className="vd-header-inner">
              <div className="vd-header-left">
                <Link href="/" className="vd-header-back">← Home</Link>
                <div>
                  <p className="vd-header-greeting">{greeting}</p>
                  <h1 className="vd-header-name">{profile?.storeName || profile?.name || 'My Store'}</h1>
                </div>
              </div>
              <div className="vd-header-actions">
                <button className="vd-logout-btn" onClick={handleLogout} title="Logout">
                  🚪
                </button>
              </div>
            </div>

            {/* Profile card */}
            {profile && (
              <div className="vd-profile-card">
                <div className="vd-profile-avatar">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt={profile.name} />
                  ) : (
                    <span>{profile.name?.charAt(0)?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="vd-profile-info">
                  <p className="vd-profile-name">{profile.name}</p>
                  <p className="vd-profile-meta">
                    {profile.campus || 'Campus not set'}
                    {profile.location?.campusArea ? ` · ${profile.location.campusArea}` : ''}
                  </p>
                </div>
                <span className={`vd-badge ${isVerified ? 'verified' : 'pending'}`}>
                  {isVerified ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && <div className="vd-error">{error}</div>}

          {/* Stats */}
          <div className="vd-stats">
            <div className="vd-stat">
              <span className="vd-stat-value">{products.length}</span>
              <span className="vd-stat-label">Products</span>
              <span className="vd-stat-hint">{activeCount} active</span>
            </div>
            <div className="vd-stat">
              <span className="vd-stat-value">{profile?.rating?.toFixed(1) || '0.0'}</span>
              <span className="vd-stat-label">Rating</span>
              <span className="vd-stat-hint">{profile?.numReviews || 0} reviews</span>
            </div>
            <div className="vd-stat">
              <span className="vd-stat-value">{profile?.totalSales || 0}</span>
              <span className="vd-stat-label">Sales</span>
              <span className="vd-stat-hint">Total sold</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="vd-section">
            <h2 className="vd-section-title">Quick Actions</h2>
            <div className="vd-actions">
              <Link href="/vendor/upload" className="vd-action-card">
                <span className="vd-action-icon">📝</span>
                <span className="vd-action-label">Add Product</span>
                <span className="vd-action-hint">New listing</span>
              </Link>
              <button className="vd-action-card disabled" disabled>
                <span className="vd-action-icon">📊</span>
                <span className="vd-action-label">Analytics</span>
                <span className="vd-action-hint">App only</span>
              </button>
              <button className="vd-action-card disabled" disabled>
                <span className="vd-action-icon">💬</span>
                <span className="vd-action-label">Messages</span>
                <span className="vd-action-hint">App only</span>
              </button>
              <button className="vd-action-card disabled" disabled>
                <span className="vd-action-icon">📦</span>
                <span className="vd-action-label">Orders</span>
                <span className="vd-action-hint">App only</span>
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="vd-section">
            <div className="vd-section-header">
              <h2 className="vd-section-title">Your Listings</h2>
              {products.length > 6 && <Link href="/vendor/products" className="vd-see-all">See all →</Link>}
            </div>
            {products.length > 0 ? (
              <div className="vd-products-grid">
                {products.slice(0, 6).map(p => <MiniProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="vd-empty">
                <span className="vd-empty-icon">📦</span>
                <h3>No products yet</h3>
                <p>Start selling by adding your first listing</p>
                <Link href="/vendor/upload" className="vd-empty-btn">+ Add Product</Link>
              </div>
            )}
          </div>

          {/* ═══════════════ APP DOWNLOAD CTA ═══════════════ */}
          <div className="vd-app-cta">
            <div className="vd-app-cta-bg" />
            <div className="vd-app-cta-content">
              <div className="vd-app-cta-phone">
                <div className="vd-app-cta-phone-screen">
                  <span>📱</span>
                </div>
              </div>
              <div className="vd-app-cta-text">
                <h2>Get the Full Experience</h2>
                <p>
                  The CediMart app gives you everything you need to run your campus business:
                </p>
                <ul>
                  <li>🤖 AI product description generator from photos</li>
                  <li>💬 Real-time chat with buyers</li>
                  <li>📊 Sales analytics & performance tracking</li>
                  <li>🔔 Instant order notifications</li>
                  <li>📦 Order management dashboard</li>
                </ul>
                <div className="vd-app-cta-btns">
                  <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="vd-app-btn ios">
                    🍎 App Store
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="vd-app-btn android">
                    ▶ Google Play
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const dashboardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  .vd-page{min-height:100vh;background:${C.void};color:${C.white};font-family:'Plus Jakarta Sans',sans-serif}
  .vd-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:14px}
  .vd-spinner{width:40px;height:40px;border:3px solid ${C.border};border-top-color:${C.emerald};border-radius:50%;animation:spin .8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .vd-dash{max-width:900px;margin:0 auto;padding:clamp(20px,4vw,40px) clamp(16px,4vw,32px) 60px}

  /* Header */
  .vd-header{background:linear-gradient(135deg,#1B5E20,#2E7D32);border-radius:20px;padding:clamp(18px,3vw,28px);margin-bottom:20px}
  .vd-header-inner{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
  .vd-header-left{display:flex;flex-direction:column;gap:4px}
  .vd-header-back{color:rgba(255,255,255,.7);text-decoration:none;font-size:12px;font-weight:600}
  .vd-header-back:hover{color:#fff}
  .vd-header-greeting{font-size:11px;color:#A5D6A7;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
  .vd-header-name{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.3px}
  .vd-header-actions{display:flex;gap:8px}
  .vd-logout-btn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .vd-logout-btn:hover{background:rgba(255,255,255,.2)}

  .vd-profile-card{display:flex;align-items:center;gap:12px;background:rgba(0,0,0,.2);border-radius:14px;padding:12px 14px}
  .vd-profile-avatar{width:44px;height:44px;border-radius:50%;background:#E8F5E9;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#1B5E20;overflow:hidden;flex-shrink:0}
  .vd-profile-avatar img{width:100%;height:100%;object-fit:cover}
  .vd-profile-info{flex:1;min-width:0}
  .vd-profile-name{font-size:14px;font-weight:700;color:#fff}
  .vd-profile-meta{font-size:11px;color:#A5D6A7;margin-top:1px}
  .vd-badge{font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;white-space:nowrap;flex-shrink:0}
  .vd-badge.verified{background:#388E3C;color:#fff}
  .vd-badge.pending{background:#E65100;color:#fff}

  .vd-error{background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.2);color:${C.coral};font-size:12px;font-weight:600;padding:10px 14px;border-radius:10px;margin-bottom:16px}

  /* Stats */
  .vd-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
  @media(max-width:480px){.vd-stats{grid-template-columns:repeat(3,1fr);gap:8px}}
  .vd-stat{background:${C.surf};border:1px solid ${C.border};border-radius:14px;padding:14px;text-align:center}
  .vd-stat-value{display:block;font-size:clamp(18px,3vw,24px);font-weight:800;color:${C.amber};font-family:'JetBrains Mono',monospace}
  .vd-stat-label{display:block;font-size:10px;color:${C.muted};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
  .vd-stat-hint{display:block;font-size:10px;color:${C.muted};margin-top:1px}

  /* Sections */
  .vd-section{margin-bottom:24px}
  .vd-section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .vd-section-title{font-size:15px;font-weight:700;color:${C.white};margin-bottom:12px}
  .vd-see-all{font-size:12px;font-weight:600;color:${C.emerald};text-decoration:none}

  /* Actions */
  .vd-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  @media(max-width:600px){.vd-actions{grid-template-columns:repeat(2,1fr)}}
  .vd-action-card{display:flex;flex-direction:column;align-items:center;gap:6px;background:${C.surf};border:1px solid ${C.border};border-radius:14px;padding:16px 12px;text-decoration:none;cursor:pointer;transition:all .2s;text-align:center;font-family:'Plus Jakarta Sans',sans-serif}
  .vd-action-card:hover:not(.disabled){border-color:${C.emerald};transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.2)}
  .vd-action-card.disabled{opacity:.5;cursor:not-allowed;background:${C.elev}}
  .vd-action-icon{font-size:24px}
  .vd-action-label{font-size:12px;font-weight:700;color:${C.white}}
  .vd-action-hint{font-size:10px;color:${C.muted}}

  /* Products */
  .vd-products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
  @media(max-width:480px){.vd-products-grid{grid-template-columns:repeat(2,1fr);gap:8px}}
  .vd-prod-card{background:${C.surf};border:1px solid ${C.border};border-radius:12px;overflow:hidden;transition:all .2s}
  .vd-prod-card:hover{border-color:${C.emerald};box-shadow:0 4px 16px rgba(0,0,0,.2)}
  .vd-prod-card.sold-out{opacity:.6}
  .vd-prod-img{position:relative;height:140px;background:${C.elev};display:flex;align-items:center;justify-content:center;font-size:36px;overflow:hidden}
  .vd-prod-img img{width:100%;height:100%;object-fit:cover}
  .vd-prod-nego{position:absolute;top:6px;right:6px;background:${C.emerald};color:#fff;font-size:9px;font-weight:700;padding:3px 7px;border-radius:5px}
  .vd-prod-sold-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700}
  .vd-prod-body{padding:10px}
  .vd-prod-name{font-size:12px;font-weight:700;color:${C.white};line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:4px}
  .vd-prod-campus{display:inline-block;font-size:9px;font-weight:600;color:${C.emerald};background:${C.emeraldDim};padding:2px 6px;border-radius:4px;margin-bottom:6px;font-family:'JetBrains Mono',monospace}
  .vd-prod-price{font-size:14px;font-weight:800;color:${C.amber};font-family:'JetBrains Mono',monospace}

  .vd-empty{text-align:center;padding:40px 20px;color:${C.muted}}
  .vd-empty-icon{font-size:48px;display:block;margin-bottom:12px}
  .vd-empty h3{font-size:15px;font-weight:700;color:${C.off};margin-bottom:4px}
  .vd-empty p{font-size:12px;margin-bottom:16px}
  .vd-empty-btn{display:inline-block;background:linear-gradient(135deg,${C.emerald},#34D399);color:#000;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none;transition:all .2s}
  .vd-empty-btn:hover{filter:brightness(1.08)}

  /* ═══════════════ APP CTA ═══════════════ */
  .vd-app-cta{position:relative;background:linear-gradient(135deg,${C.indigo} 0%,#4F46E5 50%,${C.coral} 100%);border-radius:20px;overflow:hidden;margin-top:8px}
  .vd-app-cta-bg{position:absolute;inset:0;opacity:.04;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
  .vd-app-cta-content{display:flex;gap:clamp(20px,4vw,36px);align-items:center;padding:clamp(24px,4vw,36px);position:relative;z-index:1}
  @media(max-width:700px){.vd-app-cta-content{flex-direction:column;text-align:center}}
  .vd-app-cta-phone{flex-shrink:0}
  .vd-app-cta-phone-screen{width:100px;height:180px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:40px}
  .vd-app-cta-text{flex:1}
  .vd-app-cta-text h2{font-size:clamp(18px,3vw,24px);font-weight:800;color:#fff;margin-bottom:8px}
  .vd-app-cta-text p{font-size:13px;color:rgba(255,255,255,.7);margin-bottom:12px;line-height:1.5}
  .vd-app-cta-text ul{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:20px}
  .vd-app-cta-text ul li{font-size:12px;color:rgba(255,255,255,.85);font-weight:500}
  .vd-app-cta-btns{display:flex;gap:10px;flex-wrap:wrap}
  @media(max-width:700px){.vd-app-cta-btns{justify-content:center}}
  .vd-app-btn{padding:11px 20px;border-radius:12px;font-weight:700;font-size:13px;text-decoration:none;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
  .vd-app-btn.ios{background:#fff;color:#000}
  .vd-app-btn.android{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.2)}
  .vd-app-btn:hover{transform:translateY(-1px)}
`;