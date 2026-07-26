// src/components/GuestCheckout.jsx
'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

const C = {
  surf:    '#FFFFFF',
  elev:    '#F1F5F9',
  brand:   '#0D9488',
  brandL:  '#14B8A6',
  brandD:  '#0F766E',
  accent:  '#F97316',
  white:   '#0F172A',
  off:     '#475569',
  muted:   '#94A3B8',
  border:  '#E2E8F0',
};

export default function GuestCheckout({ product, isOpen, onClose }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || null;

  const handleLogin = () => {
    const refParam = referralCode ? `&ref=${referralCode}` : '';
    router.push(`/auth?next=/checkout/${product._id}${refParam}`);
  };

  const handleSignUp = () => {
    const refParam = referralCode ? `&ref=${referralCode}` : '';
    router.push(`/signup?next=/checkout/${product._id}${refParam}`);
  };

  const handleGuestContinue = () => {
    // Option: Let them checkout without account (guest flow)
    const refParam = referralCode ? `&ref=${referralCode}` : '';
    router.push(`/checkout/${product._id}?guest=true${refParam}`);
  };

  if (!isOpen) return null;

  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;

  return (
    <>
      <style>{authGateStyles}</style>
      <div className="gco-overlay" onClick={onClose}>
        <div className="gco-modal" onClick={e => e.stopPropagation()}>
          <button className="gco-close" onClick={onClose}>✕</button>

          {/* Product Summary */}
          <div className="gco-product-summary">
            <div className="gco-product-img-wrap">
              <img 
                src={product.images?.[0] || product.image || 'https://placehold.co/200/F1F5F9/94A3B8?text=📦'} 
                alt={product.name} 
              />
            </div>
            <div className="gco-product-info">
              <p className="gco-product-name">{product.name}</p>
              <div className="gco-product-price-row">
                <p className="gco-product-price">GH₵ {product.price?.toLocaleString()}</p>
                {isOnSale && product.discountInfo?.originalPrice && (
                  <p className="gco-product-original">GH₵ {product.discountInfo.originalPrice.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          <h2 className="gco-title">Ready to buy?</h2>
          <p className="gco-subtitle">Choose how you'd like to continue. Creating an account lets you track orders and earn rewards.</p>

          {/* Options */}
          <div className="gco-options">
            <button className="gco-option-btn" onClick={handleLogin}>
              <span className="gco-option-icon">🔑</span>
              <div className="gco-option-text">
                <strong>I have an account</strong>
                <span>Login with your phone number</span>
              </div>
              <span className="gco-option-arrow">→</span>
            </button>

            <button className="gco-option-btn" onClick={handleSignUp}>
              <span className="gco-option-icon">✨</span>
              <div className="gco-option-text">
                <strong>Create an account</strong>
                <span>Sign up in seconds — it's free</span>
              </div>
              <span className="gco-option-arrow">→</span>
            </button>

            <button className="gco-option-btn gco-guest" onClick={handleGuestContinue}>
              <span className="gco-option-icon">⚡</span>
              <div className="gco-option-text">
                <strong>Continue as guest</strong>
                <span>No account needed — quick checkout</span>
              </div>
              <span className="gco-option-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const authGateStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  .gco-overlay { 
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); 
    backdrop-filter: blur(4px); display: flex; align-items: center; 
    justify-content: center; z-index: 1000; padding: 20px; 
    animation: fadeIn .2s ease; 
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  
  .gco-modal { 
    background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 20px; 
    max-width: 440px; width: 100%; max-height: 90vh; overflow-y: auto; 
    position: relative; padding: clamp(24px,4vw,32px); 
    font-family: 'Plus Jakarta Sans', sans-serif; color: ${C.white}; 
    animation: slideUp .3s ease; box-shadow: 0 20px 60px rgba(0,0,0,.15);
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  
  .gco-close { 
    position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; 
    border-radius: 50%; background: ${C.elev}; border: 1px solid ${C.border}; 
    color: ${C.off}; font-size: 14px; cursor: pointer; 
    display: flex; align-items: center; justify-content: center; z-index: 2; transition: all .2s;
  }
  .gco-close:hover { color: ${C.white}; border-color: ${C.brand}; }

  /* Product Summary */
  .gco-product-summary { 
    display: flex; gap: 12px; background: ${C.elev}; border: 1px solid ${C.border}; 
    border-radius: 14px; padding: 12px; margin-bottom: 20px; 
  }
  .gco-product-img-wrap { width: 56px; height: 56px; border-radius: 10px; overflow: hidden; background: #F8FAFC; flex-shrink: 0; }
  .gco-product-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .gco-product-info { flex: 1; min-width: 0; }
  .gco-product-name { font-size: 13px; font-weight: 700; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .gco-product-price-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
  .gco-product-price { font-size: 16px; font-weight: 800; color: ${C.accent}; font-family: 'JetBrains Mono', monospace; }
  .gco-product-original { font-size: 11px; color: ${C.muted}; text-decoration: line-through; font-family: 'JetBrains Mono', monospace; }

  .gco-title { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
  .gco-subtitle { font-size: 13px; color: ${C.off}; margin-bottom: 18px; line-height: 1.5; }

  /* Options */
  .gco-options { display: flex; flex-direction: column; gap: 10px; }
  .gco-option-btn {
    display: flex; align-items: center; gap: 12px; width: 100%;
    padding: 16px; border-radius: 14px; border: 1.5px solid ${C.border};
    background: ${C.surf}; cursor: pointer; text-align: left;
    font-family: 'Plus Jakarta Sans', sans-serif; transition: all .2s;
  }
  .gco-option-btn:hover { border-color: ${C.brand}; background: #F0FDFA; }
  .gco-option-icon { font-size: 24px; flex-shrink: 0; }
  .gco-option-text { flex: 1; }
  .gco-option-text strong { display: block; font-size: 14px; color: ${C.white}; margin-bottom: 2px; }
  .gco-option-text span { font-size: 12px; color: ${C.off}; }
  .gco-option-arrow { font-size: 18px; color: ${C.muted}; flex-shrink: 0; }
  .gco-guest { border-style: dashed; }

  @media (max-width: 480px) {
    .gco-modal { padding: 20px; border-radius: 16px; }
  }
`;