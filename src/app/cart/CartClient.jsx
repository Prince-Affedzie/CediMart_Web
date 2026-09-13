// src/app/cart/CartClient.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Store,
  Bike,
  Info,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import './cart.css';

export default function CartClient() {
  const router = useRouter();
  // NOTE: no authLoading here — we only care whether the user is signed in
  // once the cart has finished loading. Any transient "not authenticated"
  // flash during refresh is handled by the natural re-render when
  // isAuthenticated flips to true.
  const { isAuthenticated } = useAuth();

  const {
    cartItems = [],
    cartTotal = 0,
    cartCount = 0,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  } = useCart();

  const [screenLoading, setScreenLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState({ msg: '', danger: false });

  // Guard so the initial load runs exactly once, even if `refreshCart`
  // changes identity across renders.
  const didInitRef = useRef(false);

  // ── Initial load ──────────────────────────────────────────────
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let active = true;
    (async () => {
      try {
        if (refreshCart) await refreshCart();
      } catch (err) {
        console.error('Error loading cart:', err);
      } finally {
        if (active) setScreenLoading(false);
      }
    })();

    return () => {
      active = false;
      didInitRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toast helper ──────────────────────────────────────────────
  const showToast = useCallback((msg, danger = false) => {
    setToast({ msg, danger });
    setTimeout(() => setToast({ msg: '', danger: false }), 2400);
  }, []);

  // ── Product normalizer ────────────────────────────────────────
  const getProductData = (item) => {
    const product = item.product || item;
    return {
      id: product._id || product.id || item.productId || item.id,
      name: product.name || item.name || 'Unnamed Product',
      price: product.price || item.price || 0,
      image:
        product.image ||
        product.images?.[0] ||
        item.image ||
        '/placeholder.png',
      unit: product.unit || item.unit || 'piece',
      stock: product.countInStock ?? product.stock ?? 100,
      quantity: item.quantity || 1,
    };
  };

  const calculateItemTotal = (item) => {
    const p = getProductData(item);
    return p.quantity * p.price;
  };

  // ── Handlers ──────────────────────────────────────────────────
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(productId);
    try {
      await updateQuantity(productId, newQuantity);
      await refreshCart?.();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update quantity');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    if (!window.confirm(`Remove "${productName}" from cart?`)) return;
    setRemovingItemId(productId);
    try {
      await removeFromCart(productId);
      await refreshCart?.();
      showToast('Item removed');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove item');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;
    if (!window.confirm('Remove all items from your cart?')) return;
    try {
      setScreenLoading(true);
      await clearCart();
      await refreshCart?.();
      showToast('Cart cleared');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to clear cart');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setScreenLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setErrorMsg('Your cart is empty. Add some items first!');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
      return;
    }
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      router.push('/order');
    }, 800);
  };

  // ── LOADING STATE ─────────────────────────────────────────────
  if (screenLoading) {
    return (
      <div className="ct-page">
        <div className="ct-shell">
          <div className="ct-nav">
            <button
              className="ct-nav-btn"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ChevronLeft size={22} strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <div className="ct-loading">
          <div className="ct-loading-icon">
            <Loader2 size={34} strokeWidth={2.4} className="ct-spin" />
          </div>
          <p className="ct-loading-title">Loading your cart</p>
          <p className="ct-loading-sub">Fetching items and latest prices…</p>
        </div>
      </div>
    );
  }

  // ── NOT AUTHENTICATED ─────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="ct-page">
        {toast.msg && (
          <div className={`ct-toast ${toast.danger ? 'ct-toast-danger' : ''}`}>
            {toast.msg}
          </div>
        )}
        <div className="ct-shell">
          <div className="ct-nav">
            <button
              className="ct-nav-btn"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ChevronLeft size={22} strokeWidth={2.4} />
            </button>
            <span className="ct-nav-center">
              <span className="ct-nav-title">My Cart</span>
            </span>
            <span className="ct-nav-spacer" />
          </div>
        </div>

        <div className="ct-empty-wrap">
          <div className="ct-prompt-card">
            <div className="ct-prompt-icon">
              <ShoppingCart size={48} strokeWidth={1.6} />
            </div>
            <h1 className="ct-prompt-title">See your cart</h1>
            <p className="ct-prompt-sub">
              Login or create an account to view your saved items, track
              orders, and enjoy secure checkout.
            </p>

            <Link
              href="/login?redirect=/cart"
              className="ct-btn ct-btn-primary"
            >
              <LogIn size={18} strokeWidth={2.4} />
              Login
            </Link>
            <Link
              href="/signup?redirect=/cart"
              className="ct-btn ct-btn-outline"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY CART ────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="ct-page">
        {toast.msg && (
          <div className={`ct-toast ${toast.danger ? 'ct-toast-danger' : ''}`}>
            {toast.msg}
          </div>
        )}
        <div className="ct-shell">
          <div className="ct-nav">
            <button
              className="ct-nav-btn"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ChevronLeft size={22} strokeWidth={2.4} />
            </button>
            <span className="ct-nav-center">
              <span className="ct-nav-title">My Cart</span>
            </span>
            <span className="ct-nav-spacer" />
          </div>
        </div>

        <div className="ct-empty-wrap">
          <div className="ct-prompt-card">
            <div className="ct-prompt-icon">
              <ShoppingCart size={44} strokeWidth={1.6} />
            </div>
            <h1 className="ct-prompt-title">Your cart is empty</h1>
            <p className="ct-prompt-sub">
              You haven&apos;t added any fresh products yet. Start browsing!
            </p>
            <Link href="/listings" className="ct-btn ct-btn-primary">
              <Store size={18} strokeWidth={2.4} />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN CART ─────────────────────────────────────────────────
  return (
    <div className="ct-page">
      {/* Toast */}
      {toast.msg && (
        <div className={`ct-toast ${toast.danger ? 'ct-toast-danger' : ''}`}>
          {toast.msg}
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="ct-error-banner" role="alert">
          <AlertCircle size={16} strokeWidth={2.4} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="ct-shell">
        {/* Nav */}
        <div className="ct-nav">
          <button
            className="ct-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>

          <span className="ct-nav-center">
            <span className="ct-nav-title">My Cart</span>
            {cartCount > 0 && (
              <span className="ct-nav-badge">{cartCount}</span>
            )}
          </span>

          <button
            className="ct-nav-btn ct-nav-btn-danger"
            onClick={handleClearCart}
            aria-label="Clear cart"
            title="Clear cart"
          >
            <Trash2 size={17} strokeWidth={2.2} />
          </button>
        </div>

        {/* Header */}
        <div className="ct-header">
          <h1 className="ct-title">Your Cart</h1>
          <p className="ct-subtitle">
            Review your items and proceed to checkout.
          </p>
        </div>

        {/* Items */}
        <div className="ct-items-block">
          {cartItems.map((item, index) => {
            const p = getProductData(item);
            const isUpdating = updatingItemId === p.id;
            const isRemoving = removingItemId === p.id;
            const lineTotal = calculateItemTotal(item).toFixed(2);
            const detailHref = `/product/${p.id}`;

            return (
              <div key={`${p.id}-${index}`} className="ct-cart-card">
                <Link
                  href={detailHref}
                  className="ct-item-image-link"
                  aria-label={p.name}
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={88}
                    height={88}
                    className="ct-item-image"
                    unoptimized
                  />
                </Link>

                <div className="ct-item-body">
                  <Link href={detailHref} className="ct-item-name-link">
                    <h3 className="ct-item-name">{p.name}</h3>
                  </Link>
                  <p className="ct-item-unit-price">
                    GH₵ {p.price.toFixed(2)} / {p.unit}
                  </p>

                  <div className="ct-item-footer">
                    <div className="ct-stepper">
                      <button
                        type="button"
                        className="ct-step-btn"
                        onClick={() =>
                          handleUpdateQuantity(p.id, p.quantity - 1)
                        }
                        disabled={
                          p.quantity <= 1 || isUpdating || screenLoading
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} strokeWidth={2.4} />
                      </button>

                      <div className="ct-step-count">
                        {isUpdating ? (
                          <Loader2
                            size={14}
                            strokeWidth={2.6}
                            className="ct-spin"
                          />
                        ) : (
                          p.quantity
                        )}
                      </div>

                      <button
                        type="button"
                        className="ct-step-btn"
                        onClick={() =>
                          handleUpdateQuantity(p.id, p.quantity + 1)
                        }
                        disabled={
                          p.quantity >= p.stock || isUpdating || screenLoading
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} strokeWidth={2.4} />
                      </button>
                    </div>

                    <span className="ct-line-total">GH₵ {lineTotal}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="ct-remove-btn"
                  onClick={() => handleRemoveItem(p.id, p.name)}
                  disabled={isRemoving || screenLoading}
                  aria-label={`Remove ${p.name}`}
                >
                  {isRemoving ? (
                    <Loader2 size={16} strokeWidth={2.6} className="ct-spin" />
                  ) : (
                    <Trash2 size={17} strokeWidth={2.2} />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Delivery info */}
        <div className="ct-delivery-card">
          <div className="ct-delivery-header">
            <span className="ct-delivery-icon">
              <Bike size={18} strokeWidth={2.2} />
            </span>
            <h2 className="ct-delivery-title">Delivery Info</h2>
          </div>
          <div className="ct-delivery-list">
            {[
              'Delivery fee (GH₵ 10–70) paid to rider on delivery',
              'Same-day delivery available',
              'Flexible delivery scheduling at checkout',
            ].map((txt, i) => (
              <div key={i} className="ct-delivery-item">
                <span className="ct-delivery-dot" />
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout bar */}
      <div className="ct-checkout-bar">
        <div className="ct-checkout-inner">
          <div className="ct-checkout-summary">
            <div className="ct-checkout-left">
              <span className="ct-checkout-item-count">
                {cartCount} item{cartCount !== 1 ? 's' : ''}
              </span>
              <span className="ct-checkout-sep" />
              <span className="ct-checkout-delivery">
                <Bike size={12} strokeWidth={2.4} />
                GH₵ 20–80 delivery
              </span>
            </div>
            <span className="ct-checkout-total">
              GH₵ {cartTotal.toFixed(2)}
            </span>
          </div>

          <div className="ct-checkout-note">
            <Info size={12} strokeWidth={2.4} />
            <span>
              Delivery fee paid separately to rider — not included above
            </span>
          </div>

          <button
            type="button"
            className="ct-checkout-btn"
            onClick={handleCheckout}
            disabled={checkoutLoading || cartItems.length === 0}
          >
            {checkoutLoading ? (
              <>
                <Loader2 size={16} strokeWidth={2.6} className="ct-spin" />
                Processing…
              </>
            ) : (
              <>
                <Lock size={16} strokeWidth={2.4} />
                Checkout · GH₵ {cartTotal.toFixed(2)}
                <ArrowRight size={18} strokeWidth={2.4} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Processing modal */}
      {checkoutLoading && (
        <div className="ct-modal-overlay" role="dialog" aria-modal="true">
          <div className="ct-modal-card">
            <Loader2 size={36} strokeWidth={2.4} className="ct-spin" />
            <h3 className="ct-modal-title">Preparing your order</h3>
            <p className="ct-modal-sub">Please wait a moment…</p>
          </div>
        </div>
      )}
    </div>
  );
}