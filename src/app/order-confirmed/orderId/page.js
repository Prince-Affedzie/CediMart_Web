// src/app/order-confirmed/[orderId]/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import icon from '@/app/icon.jpg';
import {getOrderById} from '@/apis/guestOrderApi'

// ─── Teal + Coral Design Tokens ────────────────────────────────────────────
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
  danger:       '#DC2626',
  dangerBg:     '#FEF2F2',
  dangerBorder: '#FECACA',
  info:         '#0284C7',
  infoBg:       '#F0F9FF',
  white:        '#FFFFFF',
  black:        '#000000',
};

function OrderConfirmedContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId;
  const reference = searchParams.get('reference') || orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details
  useEffect(() => {
    if (!orderId) return;
    
    const fetchOrder = async () => {
      try {
        //const token = localStorage.getItem('cm_token');
        const res = await getOrderById(orderId)  
        if (res.success || res.status ===200) {
          setOrder(res.data || res.data.data);
        } else {
          setOrder({
            _id: orderId,
            orderNumber: reference?.slice(0, 8)?.toUpperCase() || orderId?.slice(0, 8)?.toUpperCase(),
            status: 'Pending',
            totalPrice: 0,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        // Non-critical — order was placed, just can't show full details
        setOrder({
          _id: orderId,
          orderNumber: reference?.slice(0, 8)?.toUpperCase() || 'N/A',
          status: 'Pending',
          totalPrice: 0,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAppStoreUrl = () => {
    if (typeof window === 'undefined') return '#';
    if (/android/i.test(navigator.userAgent)) {
      return 'https://play.google.com/store/apps/details?id=com.freshyfood.factory';
    }
    return 'https://apps.apple.com/us/app/cedimart/id6762318566';
  };

  const orderNumber = order?.orderNumber || order?._id?.slice(-8)?.toUpperCase() || reference?.slice(0, 8)?.toUpperCase() || 'N/A';
  const orderDate = order?.createdAt ? formatDate(order.createdAt) : formatDate(new Date().toISOString());
  const orderTime = order?.createdAt ? formatTime(order.createdAt) : formatTime(new Date().toISOString());
  const orderStatus = order?.status || 'Pending';
  const orderTotal = order?.totalPrice || order?.total || 0;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #E2E8F0', borderTopColor: C.brand, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: C.t2, fontSize: 15 }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes checkDraw { to { stroke-dashoffset: 0; } }

        .order-confirmed-page {
          min-height: 100vh;
          background: ${C.bg};
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          color: ${C.t1};
          padding: 20px;
        }

        .order-confirmed-container {
          max-width: 520px;
          margin: 0 auto;
          animation: slideUp .4s ease;
        }

        /* Success Icon */
        .success-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
          animation: scaleIn .5s ease .1s both;
        }
        .success-icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${C.successBg};
          border: 3px solid ${C.success};
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .success-icon-check {
          width: 36px;
          height: 36px;
          color: ${C.success};
        }

        /* Header */
        .order-confirmed-header {
          text-align: center;
          margin-bottom: 28px;
          animation: slideUp .4s ease .15s both;
        }
        .order-confirmed-header h1 {
          font-size: 28px;
          font-weight: 800;
          color: ${C.t1};
          margin-bottom: 6px;
        }
        .order-confirmed-header p {
          font-size: 14px;
          color: ${C.t2};
          line-height: 1.5;
        }

        /* Order Card */
        .order-card {
          background: ${C.surface};
          border: 1px solid ${C.border || '#E2E8F0'};
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          animation: slideUp .4s ease .25s both;
        }

        .order-number-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid ${C.border || '#E2E8F0'};
        }
        .order-number-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: ${C.brandBg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .order-number {
          font-size: 16px;
          font-weight: 700;
          color: ${C.t1};
          font-family: 'JetBrains Mono', monospace;
        }
        .order-status-badge {
          margin-left: auto;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: ${C.accentBg};
          color: ${C.accent};
          border: 1px solid ${C.accentBorder};
        }

        .order-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        .order-detail-label {
          font-size: 13px;
          color: ${C.t2};
          font-weight: 500;
        }
        .order-detail-value {
          font-size: 13px;
          color: ${C.t1};
          font-weight: 600;
          text-align: right;
          max-width: 60%;
        }
        .order-detail-value.price {
          font-size: 20px;
          font-weight: 800;
          color: ${C.accent};
          font-family: 'JetBrains Mono', monospace;
        }

        .order-divider {
          height: 1px;
          background: ${C.border || '#E2E8F0'};
          margin: 12px 0;
        }

        /* Next Steps Card */
        .next-steps-card {
          background: ${C.surface};
          border: 1px solid ${C.border || '#E2E8F0'};
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          animation: slideUp .4s ease .35s both;
        }
        .next-steps-title {
          font-size: 14px;
          font-weight: 700;
          color: ${C.t1};
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .next-step-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          font-size: 13px;
          color: ${C.t2};
          line-height: 1.5;
        }
        .next-step-icon {
          width: 24px;
          height: 24px;
          border-radius: 12px;
          background: ${C.brandBg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* App Download CTA */
        .app-cta-card {
          background: linear-gradient(135deg, ${C.brand}, ${C.brandD});
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          margin-bottom: 20px;
          color: #fff;
          animation: slideUp .4s ease .45s both;
        }
        .app-cta-card h2 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .app-cta-card p {
          font-size: 13px;
          opacity: .85;
          line-height: 1.5;
          margin-bottom: 18px;
        }
        .app-store-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .app-store-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all .2s;
        }
        .app-store-btn.ios {
          background: ${C.white};
          color: ${C.t1};
        }
        .app-store-btn.android {
          background: rgba(255,255,255,.15);
          color: #fff;
          border: 1px solid rgba(255,255,255,.3);
        }
        .app-store-btn:hover {
          transform: translateY(-2px);
        }

        /* Continue Browsing */
        .continue-link {
          display: block;
          text-align: center;
          padding: 14px;
          color: ${C.brand};
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          transition: color .15s;
        }
        .continue-link:hover {
          color: ${C.brandD};
        }

        .check-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #E2E8F0;
          border-top-color: ${C.brand};
          border-radius: 50%;
          animation: spin .7s linear infinite;
          margin: 0 auto 20px;
        }

        @media (max-width: 480px) {
          .order-confirmed-page { padding: 12px; }
          .order-card { padding: 18px; }
          .app-cta-card { padding: 18px; }
          .app-store-buttons { flex-direction: column; }
          .order-confirmed-header h1 { font-size: 24px; }
        }
      `}</style>

      <div className="order-confirmed-page">
        <div className="order-confirmed-container">
          {/* Success Icon */}
          <div className="success-icon-wrap">
            <div className="success-icon-circle">
              <svg className="success-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="order-confirmed-header">
            <h1>Order Confirmed! 🎉</h1>
            <p>Your order has been placed successfully. The seller will be notified and will contact you soon.</p>
          </div>

          {/* Order Details Card */}
          <div className="order-card">
            <div className="order-number-row">
              <div className="order-number-icon">🧾</div>
              <span className="order-number">#{orderNumber}</span>
              <span className="order-status-badge">{orderStatus}</span>
            </div>

            <div className="order-detail-row">
              <span className="order-detail-label">Date</span>
              <span className="order-detail-value">{orderDate}</span>
            </div>

            <div className="order-detail-row">
              <span className="order-detail-label">Time</span>
              <span className="order-detail-value">{orderTime}</span>
            </div>

            <div className="order-divider" />

            {orderTotal > 0 && (
              <div className="order-detail-row">
                <span className="order-detail-label">Total Paid</span>
                <span className="order-detail-value price">GH₵ {Number(orderTotal).toFixed(2)}</span>
              </div>
            )}

            <div className="order-detail-row">
              <span className="order-detail-label">Payment Reference</span>
              <span className="order-detail-value" style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                {reference}
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="next-steps-card">
            <div className="next-steps-title">📋 What happens next?</div>
            <div className="next-step-item">
              <div className="next-step-icon">📱</div>
              <span>The seller will contact you at your phone number to confirm the order and arrange delivery.</span>
            </div>
            <div className="next-step-item">
              <div className="next-step-icon">📍</div>
              <span>You'll agree on a meet-up location on campus or arrange for delivery.</span>
            </div>
            <div className="next-step-item">
              <div className="next-step-icon">✅</div>
              <span>Once you receive the item, confirm delivery in the app to complete the transaction.</span>
            </div>
          </div>

          {/* App Download CTA */}
          <div className="app-cta-card">
            <h2>Track your order in the app! 📲</h2>
            <p>Download the CediMart app to track your orders, chat with sellers, get delivery updates, and discover more deals on campus.</p>
            <div className="app-store-buttons">
              <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="app-store-btn ios">
                🍎 Download on App Store
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="app-store-btn android">
                ▶ Get it on Google Play
              </a>
            </div>
          </div>

          {/* Continue Browsing */}
          <Link href="/listings" className="continue-link">
            ← Continue Browsing Listings
          </Link>
        </div>
      </div>
    </>
  );
}


// ─── Page Export with Suspense ─────────────────────────────────────────────
export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #E2E8F0', borderTopColor: C.brand, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: C.t2, fontSize: 15 }}>Loading order...</p>
        </div>
      </div>
    }>
      <OrderConfirmedContent />
    </Suspense>
  );
}