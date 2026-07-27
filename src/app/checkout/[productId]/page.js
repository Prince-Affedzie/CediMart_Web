// src/app/checkout/[productId]/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { initializePayment, verifyPayment } from '@/apis/paymentApi';
import { getProductById } from '@/apis/productApi';
import { order } from '@/apis/guestOrderApi';

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

const CAMPUS_OPTIONS = [
  { value: '', label: 'Select your campus' },
  { value: 'UG', label: 'University of Ghana' },
  { value: 'KNUST', label: 'KNUST' },
  { value: 'UCC', label: 'Univ. of Cape Coast' },
  { value: 'UPSA', label: 'UPSA' },
  { value: 'GIMPA', label: 'GIMPA' },
  { value: 'ASHESI', label: 'Ashesi University' },
  { value: 'ATU', label: 'Accra Technical Univ.' },
  { value: 'UEW', label: 'Univ. of Education' },
  { value: 'OTHER', label: 'Other Campus' },
];

// ─── Order Success Modal ───────────────────────────────────────────────────
function OrderSuccessModal({ isOpen, onClose, orderDetails }) {
  if (!isOpen) return null;

  const orderNumber = orderDetails?.orderNumber || orderDetails?._id?.slice(-8)?.toUpperCase() || orderDetails?.reference?.slice(0, 8)?.toUpperCase() || 'N/A';
  const totalPaid = orderDetails?.totalPrice || orderDetails?.price || 0;

  const getAppStoreUrl = () => {
    if (/android/i.test(navigator.userAgent)) {
      return 'https://play.google.com/store/apps/details?id=com.freshyfood.factory';
    }
    return 'https://apps.apple.com/us/app/cedimart/id6762318566';
  };

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="success-modal-close" onClick={onClose}>✕</button>

        {/* Success icon */}
        <div className="success-modal-icon-wrap">
          <div className="success-modal-icon-circle">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h2 className="success-modal-title">Order Confirmed! 🎉</h2>
        <p className="success-modal-subtitle">Your order has been placed successfully.</p>

        {/* Order card */}
        <div className="success-modal-order-card">
          <div className="success-modal-order-row">
            <span className="success-modal-order-label">Order Number</span>
            <span className="success-modal-order-value mono">#{orderNumber}</span>
          </div>
          {totalPaid > 0 && (
            <div className="success-modal-order-row">
              <span className="success-modal-order-label">Total Paid</span>
              <span className="success-modal-order-value price">GH₵ {Number(totalPaid).toFixed(2)}</span>
            </div>
          )}
          <div className="success-modal-order-row">
            <span className="success-modal-order-label">Status</span>
            <span className="success-modal-order-status">Pending</span>
          </div>
        </div>

        {/* Next steps */}
        <div className="success-modal-next-steps">
          <p><strong>📱 What happens next?</strong></p>
          <p>The seller will contact you at <strong>{orderDetails?.phone || 'your phone number'}</strong> to arrange delivery or meet-up.</p>
        </div>

        {/* App download CTA */}
        <div className="success-modal-app-cta">
          <p>🚀 Track orders, chat with sellers & get better deals on the app!</p>
          <div className="success-modal-app-btns">
            <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="success-modal-app-btn ios">
              🍎 App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="success-modal-app-btn android">
              ▶ Google Play
            </a>
          </div>
        </div>

        {/* Continue browsing */}
        <button className="success-modal-continue-btn" onClick={onClose}>
          Continue Browsing
        </button>
      </div>
    </div>
  );
}

// ─── Main Checkout Content ─────────────────────────────────────────────────
function CheckoutContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.productId;
  const referralCode = searchParams.get('ref') || null;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placingMessage, setPlacingMessage] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState('');
  const [campusArea, setCampusArea] = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const res = await getProductById(productId);
        if (res?.data?.success) {
          const productData = res.data?.data?.product || res.data?.data || res.data;
          setProduct(productData);
        } else {
          setGeneralError('Product not found or no longer available.');
        }
      } catch (err) {
        setGeneralError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const validateForm = () => {
    if (!name.trim()) { setGeneralError('Please enter your full name'); return false; }
    if (!phone.trim() || phone.length < 10) { setGeneralError('Please enter a valid phone number'); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setGeneralError('Please enter a valid email address'); return false; }
    if (!campus) { setGeneralError('Please select your campus'); return false; }
    if (!campusArea.trim()) { setGeneralError('Please enter your campus area or location'); return false; }
    return true;
  };

  const finalizeOrder = async (reference) => {
    setPlacingMessage('Verifying your payment...');
    try {
      const verifyRes = await verifyPayment(reference);
      const paymentVerified = verifyRes?.status === 200 && verifyRes?.data?.success === true;

      if (!paymentVerified) {
        setGeneralError('Payment verification failed. Reference: ' + reference);
        setPlacing(false);
        return;
      }

      setPlacingMessage('Creating your order...');
      const token = typeof window !== 'undefined' ? localStorage.getItem('cm_token') : null;

      const orderData = {
        orderItems: [{
          productId: productId || product._id,
          name: product.name,
          quantity: 1,
          unit: 'piece',
          price: product.price,
          product: productId || product._id,
        }],
        shippingAddress: {
          address: `${campusArea.trim()}${nearestLandmark.trim() ? ', ' + nearestLandmark.trim() : ''}`,
          city: campus,
          region: '',
          nearestLandmark: nearestLandmark.trim() || '',
          phone: phone.trim(),
        },
        deliverySchedule: { preferredDay: 'monday', preferredTime: 'afternoon' },
        paymentMethod: 'paystack',
        paymentReference: reference,
        paymentStatus: 'paid',
        ...(referralCode && { referralCode }),
      };

      const res = await order(orderData, token);

      if (res?.status === 200 || res?.success || res?.status === 201) {
        const createdOrder = res.data?.data || res.data;
        
        // Store order details for the modal
        setOrderDetails({
          ...createdOrder,
          phone: phone.trim(),
          reference,
        });
        
        // Show the success modal
        setShowSuccessModal(true);
        setPlacing(false);
        setPlacingMessage('');
      } else {
        setGeneralError(
          res?.data?.message ||
          'Payment was successful but order creation failed. Please contact support with reference: ' + reference
        );
        setPlacing(false);
      }
    } catch (err) {
      console.error('[ORDER] finalize error:', err);
      setGeneralError('An error occurred while creating your order. Please contact support with reference: ' + reference);
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setPlacing(true);
    setPlacingMessage('Opening secure payment...');
    setGeneralError('');

    try {
      const initRes = await initializePayment({ email: email.trim(), phone: phone.trim(), amount: product.price });
      const { access_code, reference } = initRes.data;

      if (!access_code) {
        throw new Error('Payment session could not be created. Please try again.');
      }

      const { default: PaystackPop } = await import('@paystack/inline-js');
      const popup = new PaystackPop();

      popup.resumeTransaction(access_code, {
        onSuccess: (transaction) => finalizeOrder(transaction?.reference || reference),
        onCancel: () => { setPlacing(false); setPlacingMessage(''); },
        onError: (error) => {
          setGeneralError(error?.message || 'Payment could not be completed.');
          setPlacing(false); setPlacingMessage('');
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to initialize payment.';
      setGeneralError(msg);
      setPlacing(false); setPlacingMessage('');
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    // Redirect to listings or home
    router.push('/listings');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #E2E8F0', borderTopColor: C.brand, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: C.t2, fontSize: 15 }}>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.t1, marginBottom: 8 }}>Product Not Found</h1>
          <p style={{ color: C.t2, marginBottom: 24 }}>This listing may have been removed.</p>
          <Link href="/listings" style={{ background: C.brand, color: '#fff', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* ── Page Styles ── */
        .checkout-page { min-height: 100vh; background: ${C.bg}; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; color: ${C.t1}; padding: 20px; }
        .checkout-container { max-width: 520px; margin: 0 auto; animation: slideUp .3s ease; }
        .checkout-header { text-align: center; margin-bottom: 28px; padding-top: 20px; }
        .checkout-header h1 { font-size: 26px; font-weight: 800; color: ${C.t1}; margin-bottom: 4px; }
        .checkout-header p { font-size: 14px; color: ${C.t2}; }
        .checkout-secure-badge { display: inline-flex; align-items: center; gap: 6px; background: ${C.brandBg}; border: 1px solid ${C.brandBorder}; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: ${C.brand}; margin-top: 10px; }

        .checkout-product-card { background: ${C.surface}; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px; margin-bottom: 24px; display: flex; gap: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .checkout-product-img { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; background: ${C.elev}; flex-shrink: 0; }
        .checkout-product-placeholder { width: 80px; height: 80px; border-radius: 10px; background: ${C.elev}; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; }
        .checkout-product-info { flex: 1; }
        .checkout-product-name { font-size: 14px; font-weight: 700; color: ${C.t1}; line-height: 1.3; margin-bottom: 4px; }
        .checkout-product-price { font-size: 22px; font-weight: 800; color: ${C.accent}; font-family: 'JetBrains Mono', monospace; }
        .checkout-product-original { font-size: 13px; color: ${C.t3}; text-decoration: line-through; font-family: 'JetBrains Mono', monospace; margin-left: 8px; }

        .checkout-form-card { background: ${C.surface}; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .checkout-section-title { font-size: 15px; font-weight: 700; color: ${C.t1}; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .checkout-field { margin-bottom: 16px; }
        .checkout-field-row { display: flex; gap: 12px; }
        .checkout-field-row .checkout-field { flex: 1; }
        .checkout-label { display: block; font-size: 12px; font-weight: 600; color: ${C.t2}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .3px; }
        .checkout-label span { color: ${C.danger}; }
        .checkout-input, .checkout-select { width: 100%; padding: 12px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; color: ${C.t1}; background: ${C.bg}; outline: none; transition: border-color .2s, box-shadow .2s; }
        .checkout-input:focus, .checkout-select:focus { border-color: ${C.brand}; box-shadow: 0 0 0 3px rgba(13,148,136,.08); }
        .checkout-input::placeholder { color: ${C.t3}; }
        .checkout-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; cursor: pointer; }
        .checkout-total-row { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; margin-top: 16px; border-top: 1px solid #E2E8F0; }
        .checkout-total-label { font-size: 14px; font-weight: 600; color: ${C.t2}; }
        .checkout-total-amount { font-size: 24px; font-weight: 800; color: ${C.accent}; font-family: 'JetBrains Mono', monospace; }
        .checkout-pay-btn { width: 100%; padding: 16px; background: ${C.brand}; color: #fff; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; margin-top: 20px; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .checkout-pay-btn:hover:not(:disabled) { background: ${C.brandD}; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(13,148,136,.25); }
        .checkout-pay-btn:disabled { background: ${C.brandBorder}; cursor: not-allowed; }
        .checkout-error { background: ${C.dangerBg}; border: 1px solid ${C.dangerBorder}; color: ${C.danger}; font-size: 13px; font-weight: 500; padding: 10px 14px; border-radius: 10px; margin-top: 16px; display: flex; align-items: center; gap: 6px; }
        .checkout-terms { text-align: center; font-size: 11px; color: ${C.t3}; margin-top: 12px; }
        .checkout-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }

        /* ── Success Modal ── */
        .success-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn .2s ease; }
        .success-modal { background: ${C.surface}; border-radius: 20px; padding: 32px 28px; max-width: 460px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; animation: scaleIn .3s ease; box-shadow: 0 20px 60px rgba(0,0,0,.15); }
        .success-modal-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 50%; background: ${C.elev}; border: 1px solid #E2E8F0; color: ${C.t2}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .success-modal-close:hover { background: #E2E8F0; }
        .success-modal-icon-wrap { display: flex; justify-content: center; margin-bottom: 16px; }
        .success-modal-icon-circle { width: 72px; height: 72px; border-radius: 50%; background: ${C.successBg}; border: 3px solid ${C.success}; display: flex; align-items: center; justify-content: center; }
        .success-modal-title { font-size: 22px; font-weight: 800; color: ${C.t1}; text-align: center; margin-bottom: 4px; }
        .success-modal-subtitle { font-size: 13px; color: ${C.t2}; text-align: center; margin-bottom: 20px; }
        .success-modal-order-card { background: ${C.bg}; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .success-modal-order-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .success-modal-order-label { font-size: 13px; color: ${C.t2}; }
        .success-modal-order-value { font-size: 13px; font-weight: 700; color: ${C.t1}; }
        .success-modal-order-value.mono { font-family: 'JetBrains Mono', monospace; }
        .success-modal-order-value.price { color: ${C.accent}; font-size: 16px; }
        .success-modal-order-status { font-size: 11px; font-weight: 700; color: ${C.accent}; background: ${C.accentBg}; padding: 3px 10px; border-radius: 12px; border: 1px solid ${C.accentBorder}; }
        .success-modal-next-steps { background: ${C.brandBg}; border: 1px solid ${C.brandBorder}; border-radius: 12px; padding: 14px; margin-bottom: 16px; font-size: 13px; color: ${C.t2}; line-height: 1.5; }
        .success-modal-next-steps strong { color: ${C.t1}; }
        .success-modal-app-cta { background: linear-gradient(135deg, ${C.brand}, ${C.brandD}); border-radius: 14px; padding: 18px; text-align: center; color: #fff; margin-bottom: 16px; }
        .success-modal-app-cta p { font-size: 13px; opacity: .9; margin-bottom: 12px; }
        .success-modal-app-btns { display: flex; gap: 8px; }
        .success-modal-app-btn { flex: 1; padding: 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; text-align: center; transition: transform .15s; }
        .success-modal-app-btn:hover { transform: translateY(-1px); }
        .success-modal-app-btn.ios { background: #fff; color: ${C.t1}; }
        .success-modal-app-btn.android { background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3); }
        .success-modal-continue-btn { width: 100%; padding: 14px; border-radius: 12px; border: 1.5px solid #E2E8F0; background: ${C.surface}; color: ${C.t1}; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .15s; }
        .success-modal-continue-btn:hover { border-color: ${C.brand}; color: ${C.brand}; background: ${C.brandBg}; }

        @media (max-width: 480px) {
          .checkout-page { padding: 12px; }
          .checkout-form-card { padding: 18px; }
          .checkout-field-row { flex-direction: column; gap: 0; }
          .checkout-header h1 { font-size: 22px; }
          .success-modal { padding: 24px 20px; }
          .success-modal-app-btns { flex-direction: column; }
        }
      `}</style>

      {/* ── Success Modal ── */}
      <OrderSuccessModal isOpen={showSuccessModal} onClose={handleCloseSuccess} orderDetails={orderDetails} />

      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Checkout</h1>
            <p>Complete your order securely</p>
            <div className="checkout-secure-badge">🔒 Secured by Paystack</div>
          </div>

          <div className="checkout-product-card">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="checkout-product-img" />
            ) : (
              <div className="checkout-product-placeholder">📦</div>
            )}
            <div className="checkout-product-info">
              <p className="checkout-product-name">{product.name}</p>
              <p className="checkout-product-price">GH₵ {product.price?.toFixed(2)}</p>
            </div>
          </div>

          <div className="checkout-form-card">
            <div className="checkout-section-title">📍 Delivery Details</div>

            <div className="checkout-field">
              <label className="checkout-label">Full Name <span>*</span></label>
              <input type="text" className="checkout-input" placeholder="e.g. Akua Mensah" value={name} onChange={(e) => { setName(e.target.value); setGeneralError(''); }} />
            </div>

            <div className="checkout-field-row">
              <div className="checkout-field">
                <label className="checkout-label">Phone Number <span>*</span></label>
                <input type="tel" className="checkout-input" placeholder="e.g. 0244123456" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setGeneralError(''); }} maxLength={10} />
              </div>
              <div className="checkout-field">
                <label className="checkout-label">Email <span>*</span></label>
                <input type="email" className="checkout-input" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setGeneralError(''); }} />
              </div>
            </div>

            <div className="checkout-field">
              <label className="checkout-label">Campus <span>*</span></label>
              <select className="checkout-select" value={campus} onChange={(e) => { setCampus(e.target.value); setGeneralError(''); }}>
                {CAMPUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div className="checkout-field">
              <label className="checkout-label">Campus Area / Location <span>*</span></label>
              <input type="text" className="checkout-input" placeholder="e.g. Main Campus, Mensah Sarbah Hall" value={campusArea} onChange={(e) => { setCampusArea(e.target.value); setGeneralError(''); }} />
            </div>

            <div className="checkout-field">
              <label className="checkout-label">Nearest Landmark (optional)</label>
              <input type="text" className="checkout-input" placeholder="e.g. Behind Total Filling Station" value={nearestLandmark} onChange={(e) => setNearestLandmark(e.target.value)} />
            </div>

            <div className="checkout-total-row">
              <span className="checkout-total-label">Total to pay</span>
              <span className="checkout-total-amount">GH₵ {product.price?.toFixed(2)}</span>
            </div>

            {generalError && <div className="checkout-error"><span>⚠️</span> {generalError}</div>}

            <button className="checkout-pay-btn" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? (
                <><span className="checkout-spinner" /> {placingMessage || 'Processing...'}</>
              ) : (
                <>🔒 Pay GH₵ {product.price?.toFixed(2)}</>
              )}
            </button>

            <p className="checkout-terms">A secure Paystack window will open on this page. Your payment is protected and encrypted.</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link href={`/p/${productId}`} style={{ color: C.t3, fontSize: 13, textDecoration: 'none' }}>← Back to product</Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page Export with Suspense ─────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #E2E8F0', borderTopColor: C.brand, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: C.t2, fontSize: 15 }}>Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}