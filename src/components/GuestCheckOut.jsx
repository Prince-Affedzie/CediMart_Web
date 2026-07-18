// src/components/GuestCheckout.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { sendOTPVendor, verifyOTP } from "@/apis/authApi"
import {order} from '@/apis/guestOrderApi'


const C = {
  void:    '#09090F',
  surf:    '#13131E',
  elev:    '#1C1C2E',
  indigo:  '#6366F1',
  indigoL: '#818CF8',
  emerald: '#10B981',
  amber:   '#F59E0B',
  coral:   '#F43F5E',
  white:   '#F1F0FF',
  off:     '#A8A8B8',
  muted:   '#52525B',
  border:  '#27273A',
};

const STEPS = [
  { key: 'phone', label: 'Verify Phone' },
  { key: 'details', label: 'Your Details' },
  { key: 'done', label: 'Confirmed' },
];

export default function GuestCheckout({ product, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const otpTimerRef = useRef(null);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);

  // Form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    return () => { if (otpTimerRef.current) clearInterval(otpTimerRef.current); };
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setError('');
      setOtpSent(false);
      setOtpVerified(false);
      setOrderId(null);
      setPhone('');
      setOtp('');
      setName('');
      setCampus('');
      setLocation('');
    }
  }, [isOpen]);

  // ── OTP Timer ───────────────────────────────────────────────────────────────
  const startOtpTimer = () => {
    setOtpTimeLeft(120);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    otpTimerRef.current = setInterval(() => {
      setOtpTimeLeft(prev => {
        if (prev <= 1) { clearInterval(otpTimerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Phone OTP ────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) { setError('Enter a valid phone number'); return; }
    setLoading(true); setError('');
    try {
      const response = await sendOTPVendor(phone);
      if (response?.data?.success || response?.status === 200) {
        setOtpSent(true);
        startOtpTimer();
      } else {
        setError('Failed to send OTP. Try again.');
      }
    } catch { 
      setError('Failed to send OTP. Check your connection and try again.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) { setError('Enter the verification code'); return; }
    setLoading(true); setError('');
    try {
      const response = await verifyOTP(phone, otp);
      if (response?.data?.success || response?.status === 200) {
        setOtpVerified(true);
        setStep(1);
        setError('');
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch { 
      setError('Verification failed. Please try again.'); 
    } finally { 
      setLoading(false); 
    }
  };

  // ── Submit Order ─────────────────────────────────────────────────────────────
  const handleSubmitOrder = async () => {
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!campus) { setError('Please select your campus'); return; }
    if (!location.trim()) { setError('Please enter your location or address'); return; }
    
    setLoading(true); setError('');
    try {
      const orderData = {
        productId: product._id,
        productName: product.name,
        price: product.price,
        customerName: name.trim(),
        phone,
        campus,
        location: location.trim(),
      };

      const response = await order(orderData);
      
      // Success
      if (response?.data?.success || response?.status === 200) {
        const order = response.data?.data || response.data;
        setOrderId(order.orderId);
        setStep(2);
    
        onSuccess?.({
          orderId: order.orderId,
          productName: product.name,
          price: product.price,
          customerName: name.trim(),
          phone,
          campus,
          location: location.trim(),
          status: order.status || 'pending',
          createdAt: order.createdAt || new Date().toISOString(),
        });
        return;
      }
      
      // If we got here, something went wrong — extract the server's message
      const serverMsg = response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else {
        setError('Unable to place your order right now. Please try again.');
      }
      
    } catch (err) {
      console.error('Order submission error:', err);
      
      // Extract error message from the response if available
      const responseData = err?.response?.data;
      const serverMessage = responseData?.message;
      const statusCode = err?.response?.status;

      // Map specific HTTP status codes to user-friendly messages
      if (serverMessage) {
        // Use the server's own message if available (best UX)
        setError(serverMessage);
      } else if (statusCode === 400) {
        setError('Some information is missing or incorrect. Please check your details and try again.');
      } else if (statusCode === 404) {
        setError('This product is no longer available. It may have been sold or removed.');
      } else if (statusCode === 409) {
        setError('You already placed an order for this item. The seller will contact you at ' + phone + '.');
      } else if (statusCode === 429) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else if (statusCode >= 500) {
        setError('Our server is having trouble. Please try again in a few minutes.');
      } else if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network')) {
        setError('Network connection lost. Please check your internet and try again.');
      } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Something unexpected happened. Please try again or contact support.');
      }
    } finally { 
      setLoading(false); 
    }
  };

  if (!isOpen) return null;

  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const displayPrice = product.price;
  const originalPrice = isOnSale ? product.discountInfo.originalPrice : null;

  return (
    <>
      <style>{checkoutStyles}</style>
      <div className="gco-overlay" onClick={onClose}>
        <div className="gco-modal" onClick={e => e.stopPropagation()}>
          {/* Close button */}
          <button className="gco-close" onClick={onClose}>✕</button>

          {/* Steps indicator */}
          {step < 2 && (
            <div className="gco-steps">
              {STEPS.filter(s => s.key !== 'done').map((s, i) => (
                <div key={s.key} className={`gco-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                  <div className="gco-step-circle">{i < step ? '✓' : i + 1}</div>
                  <span className="gco-step-label">{s.label}</span>
                  {i < 1 && <div className="gco-step-line" />}
                </div>
              ))}
            </div>
          )}

          {/* ══════════════════════ STEP 0: Phone Verification ══════════════════════ */}
          {step === 0 && (
            <div className="gco-body">
              {/* Product summary */}
              <div className="gco-product-summary">
                <div className="gco-product-img-wrap">
                  <img 
                    src={product.images?.[0] || product.image || 'https://placehold.co/200/13131E/52525B?text=📦'} 
                    alt={product.name} 
                  />
                </div>
                <div className="gco-product-info">
                  <p className="gco-product-name">{product.name}</p>
                  <div className="gco-product-price-row">
                    <p className="gco-product-price">GH₵ {displayPrice.toLocaleString()}</p>
                    {isOnSale && originalPrice && (
                      <p className="gco-product-original">GH₵ {originalPrice.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="gco-title">Verify your phone number</h2>
              <p className="gco-subtitle">We'll send a verification code via SMS to confirm it's really you. No account needed.</p>

              {!otpSent ? (
                <>
                  <div className="gco-input-group">
                    <label className="gco-label">Phone Number</label>
                    <div className="gco-phone-input">
                      <span className="gco-phone-prefix">+233</span>
                      <input 
                        type="tel" 
                        className="gco-input" 
                        placeholder="50 123 4567" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                        maxLength={10} 
                        autoFocus
                      />
                    </div>
                  </div>
                  <button className="gco-btn primary" onClick={handleSendOtp} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </>
              ) : !otpVerified ? (
                <>
                  <p className="gco-otp-sent">
                    📱 Code sent to <strong>{phone}</strong>
                  </p>
                  <div className="gco-input-group">
                    <label className="gco-label">Enter verification code</label>
                    <input 
                      type="text" 
                      className="gco-input gco-otp-input" 
                      placeholder="000000" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      maxLength={6} 
                      autoFocus 
                    />
                  </div>
                  {otpTimeLeft > 0 && (
                    <p className="gco-otp-timer">Resend code in {formatTime(otpTimeLeft)}</p>
                  )}
                  {otpTimeLeft === 0 && (
                    <button className="gco-link-btn" onClick={handleSendOtp} disabled={loading}>
                      Resend code
                    </button>
                  )}
                  <button className="gco-btn primary" onClick={handleVerifyOtp} disabled={loading || otp.length < 4}>
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </>
              ) : null}

              {error && <div className="gco-error">⚠️ {error}</div>}
            </div>
          )}

          {/* ══════════════════════ STEP 1: Buyer Details ══════════════════════ */}
          {step === 1 && (
            <div className="gco-body">
              <h2 className="gco-title">Your details</h2>
              <p className="gco-subtitle">The seller will use this information to arrange delivery or meet-up with you.</p>

              <div className="gco-input-group">
                <label className="gco-label">Full Name <span className="gco-required">*</span></label>
                <input 
                  type="text" 
                  className="gco-input" 
                  placeholder="e.g. Akua Mensah" 
                  value={name} 
                  onChange={e => { setName(e.target.value); setError(''); }} 
                  autoFocus
                />
              </div>

              <div className="gco-input-group">
                <label className="gco-label">Campus <span className="gco-required">*</span></label>
                <select 
                  className="gco-input gco-select" 
                  value={campus} 
                  onChange={e => { setCampus(e.target.value); setError(''); }}
                >
                  <option value="">Select your campus</option>
                  {['UG','KNUST','UCC','UPSA','GIMPA','ASHESI','ATU','UEW','OTHER'].map(c => (
                    <option key={c} value={c}>
                      {c === 'UG' ? 'University of Ghana' :
                       c === 'KNUST' ? 'KNUST' :
                       c === 'UCC' ? 'Univ. of Cape Coast' :
                       c === 'UPSA' ? 'UPSA' :
                       c === 'GIMPA' ? 'GIMPA' :
                       c === 'ASHESI' ? 'Ashesi University' :
                       c === 'ATU' ? 'Accra Technical Univ.' :
                       c === 'UEW' ? 'Univ. of Education' : 'Other Campus'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gco-input-group">
                <label className="gco-label">
                  Address / Location <span className="gco-required">*</span>
                </label>
                <input 
                  type="text" 
                  className="gco-input" 
                  placeholder="e.g. Mensah Sarbah Hall, Room 12 or Balme Library area" 
                  value={location} 
                  onChange={e => { setLocation(e.target.value); setError(''); }}
                />
              </div>

              {/* Summary */}
              <div className="gco-summary-card">
                <div className="gco-summary-row">
                  <span>Item</span>
                  <span>{product.name}</span>
                </div>
                <div className="gco-summary-row">
                  <span>Price</span>
                  <span className="gco-summary-price">GH₵ {displayPrice.toLocaleString()}</span>
                </div>
                <div className="gco-summary-row">
                  <span>Phone</span>
                  <span>{phone}</span>
                </div>
              </div>

              <div className="gco-nav-btns">
                <button className="gco-btn secondary" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button className="gco-btn primary" onClick={handleSubmitOrder} disabled={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
              {error && <div className="gco-error">⚠️ {error}</div>}
            </div>
          )}

          {/* ══════════════════════ STEP 2: Confirmation ══════════════════════ */}
          {step === 2 && (
            <div className="gco-body gco-success">
              <div className="gco-success-icon">✅</div>
              <h2 className="gco-title">Order Placed!</h2>  
              <div className="gco-order-card">
                <div className="gco-order-id">Order #{orderId}</div>
                <div className="gco-order-detail"><span>Item</span><span>{product.name}</span></div>
                <div className="gco-order-detail"><span>Price</span><span>GH₵ {displayPrice.toLocaleString()}</span></div>
                <div className="gco-order-detail"><span>Buyer</span><span>{name}</span></div>
                <div className="gco-order-detail"><span>Phone</span><span>{phone}</span></div>
                <div className="gco-order-detail"><span>Campus</span><span>{campus}</span></div>
                <div className="gco-order-detail"><span>Location</span><span>{location}</span></div>
              </div>

              <div className="gco-next-steps">
                <p><strong>📱 What happens next?</strong></p>
                <p>A payment link will be sent to you shortly to complete payment.</p>
                
              </div>

              <div className="gco-app-cta">
                <p>🚀 Want to track orders, chat with sellers, and get better deals?</p>
                <div className="gco-app-btns">
                  <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="gco-app-btn ios">
                    🍎 App Store
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="gco-app-btn android">
                    ▶ Google Play
                  </a>
                </div>
              </div>

              <button className="gco-btn primary" onClick={onClose}>
                Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const checkoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  .gco-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn .2s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  
  .gco-modal { 
    background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 24px; 
    max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; 
    position: relative; padding: clamp(24px,4vw,36px); 
    font-family: 'Plus Jakarta Sans', sans-serif; color: ${C.white}; 
    animation: slideUp .3s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  
  .gco-close { 
    position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; 
    border-radius: 50%; background: ${C.elev}; border: 1px solid ${C.border}; 
    color: ${C.off}; font-size: 16px; cursor: pointer; 
    display: flex; align-items: center; justify-content: center; z-index: 2; transition: all .2s;
  }
  .gco-close:hover { color: ${C.white}; border-color: ${C.indigoL}; }

  /* Steps */
  .gco-steps { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid ${C.border}; }
  .gco-step { display: flex; align-items: center; }
  .gco-step-circle { 
    width: 32px; height: 32px; border-radius: 50%; background: ${C.elev}; 
    border: 2px solid ${C.border}; display: flex; align-items: center; justify-content: center; 
    font-size: 13px; font-weight: 700; color: ${C.muted}; flex-shrink: 0; transition: all .3s;
  }
  .gco-step.active .gco-step-circle { background: ${C.indigo}; border-color: ${C.indigoL}; color: #fff; }
  .gco-step.done .gco-step-circle { background: ${C.emerald}; border-color: ${C.emerald}; color: #fff; }
  .gco-step-label { font-size: 12px; color: ${C.muted}; font-weight: 600; margin-left: 10px; white-space: nowrap; }
  .gco-step.active .gco-step-label { color: ${C.white}; }
  .gco-step-line { width: 48px; height: 2px; background: ${C.border}; margin: 0 14px; transition: background .3s; }
  .gco-step.done .gco-step-line { background: ${C.emerald}; }

  /* Body */
  .gco-title { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
  .gco-subtitle { font-size: 13px; color: ${C.off}; margin-bottom: 18px; line-height: 1.5; }

  /* Product Summary */
  .gco-product-summary { 
    display: flex; gap: 12px; background: ${C.elev}; border: 1px solid ${C.border}; 
    border-radius: 14px; padding: 12px; margin-bottom: 20px; 
  }
  .gco-product-img-wrap { width: 64px; height: 64px; border-radius: 10px; overflow: hidden; background: ${C.void}; flex-shrink: 0; }
  .gco-product-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .gco-product-info { flex: 1; min-width: 0; }
  .gco-product-name { font-size: 13px; font-weight: 700; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .gco-product-price-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
  .gco-product-price { font-size: 17px; font-weight: 800; color: ${C.amber}; font-family: 'JetBrains Mono', monospace; }
  .gco-product-original { font-size: 12px; color: ${C.muted}; text-decoration: line-through; font-family: 'JetBrains Mono', monospace; }

  /* Inputs */
  .gco-input-group { margin-bottom: 14px; }
  .gco-label { display: block; font-size: 12px; font-weight: 600; color: ${C.off}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
  .gco-required { color: ${C.coral}; }
  .gco-input { 
    width: 100%; background: ${C.elev}; border: 1.5px solid ${C.border}; border-radius: 12px; 
    padding: 12px 14px; color: ${C.white}; font-size: 14px; 
    font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all .2s; 
  }
  .gco-input:focus { border-color: ${C.indigoL}; box-shadow: 0 0 0 3px ${C.indigoDim}; }
  .gco-input::placeholder { color: ${C.muted}; }
  .gco-select { 
    appearance: none; 
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2352525B' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); 
    background-repeat: no-repeat; background-position: right 14px center; 
    padding-right: 36px; cursor: pointer; 
  }
  .gco-field-hint { font-size: 11px; color: ${C.muted}; margin-top: 5px; }
  
  .gco-phone-input { display: flex; align-items: center; }
  .gco-phone-prefix { 
    background: ${C.void}; border: 1.5px solid ${C.border}; border-right: none; 
    border-radius: 12px 0 0 12px; padding: 12px 14px; font-size: 14px; 
    font-weight: 600; color: ${C.off}; white-space: nowrap; 
  }
  .gco-phone-input .gco-input { border-radius: 0 12px 12px 0; }
  
  .gco-otp-input { text-align: center; font-size: 24px !important; font-weight: 700; letter-spacing: 10px; }
  .gco-otp-sent { font-size: 13px; color: ${C.emerald}; margin-bottom: 14px; }
  .gco-otp-sent strong { color: ${C.white}; }
  .gco-otp-timer { font-size: 12px; color: ${C.muted}; margin-bottom: 10px; }

  /* Summary Card */
  .gco-summary-card { background: ${C.elev}; border: 1px solid ${C.border}; border-radius: 12px; padding: 14px; margin: 16px 0; }
  .gco-summary-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; color: ${C.off}; }
  .gco-summary-row span:last-child { color: ${C.white}; font-weight: 500; text-align: right; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gco-summary-price { color: ${C.amber} !important; font-weight: 700 !important; font-family: 'JetBrains Mono', monospace; }

  /* Buttons */
  .gco-btn { 
    width: 100%; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 14px; 
    border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; 
    transition: all .22s; margin-top: 8px; 
  }
  .gco-btn.primary { 
    background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL}); color: #fff; 
    box-shadow: 0 6px 20px ${C.indigoDim}; 
  }
  .gco-btn.primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
  .gco-btn.primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .gco-btn.secondary { background: ${C.elev}; color: ${C.off}; border: 1.5px solid ${C.border}; }
  .gco-btn.secondary:hover { border-color: ${C.indigoL}; color: ${C.white}; }
  .gco-link-btn { 
    background: none; border: none; color: ${C.indigoL}; font-size: 13px; 
    font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; 
    margin-bottom: 10px; text-decoration: underline; 
  }
  .gco-link-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  
  .gco-nav-btns { display: flex; gap: 10px; margin-top: 8px; }
  .gco-nav-btns .gco-btn.secondary { width: auto; padding: 14px 20px; flex-shrink: 0; }
  .gco-nav-btns .gco-btn.primary { flex: 1; }

  /* Error */
  .gco-error { 
    background: ${C.coralDim}; border: 1px solid rgba(244,63,94,.3); 
    color: ${C.coral}; font-size: 12px; font-weight: 600; 
    padding: 10px 14px; border-radius: 10px; margin-top: 10px; 
  }

  /* Success */
  .gco-success { text-align: center; }
  .gco-success-icon { font-size: 56px; margin-bottom: 12px; }
  
  .gco-order-card { 
    background: ${C.elev}; border: 1px solid ${C.border}; border-radius: 14px; 
    padding: 16px; margin: 20px 0; text-align: left; 
  }
  .gco-order-id { 
    font-size: 13px; font-weight: 700; color: ${C.emerald}; 
    font-family: 'JetBrains Mono', monospace; margin-bottom: 10px; padding-bottom: 10px;
    border-bottom: 1px solid ${C.border};
  }
  .gco-order-detail { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; color: ${C.off}; }
  .gco-order-detail span:last-child { color: ${C.white}; font-weight: 600; }
  
  .gco-next-steps { 
    background: ${C.elev}; border: 1px solid ${C.border}; border-radius: 14px; 
    padding: 14px 16px; margin-bottom: 20px; text-align: left; 
    font-size: 13px; color: ${C.off}; line-height: 1.6; 
  }
  .gco-next-steps strong { color: ${C.white}; }
  
  .gco-app-cta { 
    background: linear-gradient(135deg, ${C.indigoDim}, ${C.emeraldDim}); 
    border: 1px solid ${C.border}; border-radius: 14px; padding: 16px; margin-bottom: 16px; 
  }
  .gco-app-cta p { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
  .gco-app-btns { display: flex; gap: 8px; }
  .gco-app-btn { 
    flex: 1; padding: 10px; border-radius: 10px; font-size: 12px; font-weight: 700; 
    text-align: center; text-decoration: none; transition: all .2s; 
  }
  .gco-app-btn.ios { background: #fff; color: #000; }
  .gco-app-btn.android { background: rgba(255,255,255,.1); color: #fff; border: 1px solid rgba(255,255,255,.2); }
  .gco-app-btn:hover { transform: translateY(-1px); }

  @media (max-width: 480px) {
    .gco-modal { padding: 20px; border-radius: 20px; }
    .gco-steps { padding-bottom: 14px; }
    .gco-step-label { font-size: 11px; margin-left: 6px; }
    .gco-step-line { width: 28px; margin: 0 8px; }
    .gco-app-btns { flex-direction: column; }
  }
`;