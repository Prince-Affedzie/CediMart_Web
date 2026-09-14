// src/app/checkout/CheckoutClient.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Mail,
  Receipt,
  Calendar,
  Plus,
  Check,
  CheckCircle2,
  Circle,
  XCircle,
  Info,
  ShieldCheck,
  Sun,
  CloudSun,
  Moon,
  Loader2,
  Lock,
  Store,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { order as createOrderApi } from '@/apis/orderApi';
import { verifyPayment } from '@/apis/paymentApi';
//import { clearReferralCode } from '@/utils/referralStorage';
import './checkout.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const DELIVERY_DAYS = [
  { id: 'monday',    label: 'Mon' },
  { id: 'tuesday',   label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday',  label: 'Thu' },
  { id: 'friday',    label: 'Fri' },
  { id: 'saturday',  label: 'Sat' },
  { id: 'sunday',    label: 'Sun' },
];

const DELIVERY_TIMES = [
  { id: 'morning',   label: 'Morning',   sub: '8AM – 12PM',  icon: Sun },
  { id: 'afternoon', label: 'Afternoon', sub: '12PM – 4PM',  icon: CloudSun },
  { id: 'evening',   label: 'Evening',   sub: '4PM – 8PM',   icon: Moon },
];

const DAY_IDS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, filled, required, action }) {
  return (
    <div className="ck-section-head">
      <span className={`ck-section-icon${filled ? ' is-filled' : ''}`}>
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <span className="ck-section-title">{title}</span>

      {filled ? (
        <span className="ck-done-badge">
          <CheckCircle2 size={14} strokeWidth={2.4} />
          Done
        </span>
      ) : required ? (
        <span className="ck-req-badge">REQUIRED</span>
      ) : null}

      {action && (
        <button
          type="button"
          className="ck-section-action"
          onClick={action.onPress}
        >
          {action.icon && <action.icon size={13} strokeWidth={2.4} />}
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({
  label,
  required,
  placeholder,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
}) {
  return (
    <label className="ck-input-group">
      <span className="ck-input-label">
        {label}
        {required && <span className="ck-asterisk"> *</span>}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="ck-input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const {
    cartItems = [],
    cartTotal = 0,
    clearCart,
    refreshCart,
    loading: cartLoading,
  } = useCart();

  const referralCode = searchParams.get('ref') || null;

  const [placingOrder, setPlacingOrder] = useState(false);
  const [screenReady, setScreenReady] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    region: '',
    nearestLandmark: '',
    phone: '',
  });

  const [paymentEmail, setPaymentEmail] = useState('');
  const [paymentEmailError, setPaymentEmailError] = useState('');

  const [deliveryDay, setDeliveryDay] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('afternoon');

  const [toast, setToast] = useState({ msg: '', danger: false });

  const didInitRef = useRef(false);

  // ── Initialize ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    (async () => {
      try {
        await refreshCart?.();
      } catch (err) {
        console.error('Cart refresh failed:', err);
      }

      // Default delivery day = tomorrow
      const today = new Date().getDay();
      setDeliveryDay(DAY_IDS[(today + 1) % 7]);

      // Default phone from user
      setNewAddress((prev) => ({
        ...prev,
        phone: user?.phone || '',
      }));

      // Seed payment email from user
      if (user?.email) setPaymentEmail(user.email);

      setScreenReady(true);
    })();

    return () => {
      didInitRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate addresses from user
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      setAddresses(user.addresses);
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddress(def);
    }
  }, [user]);

  // If we have a referral code in the URL, keep it (already in cookie from product page).
  // Otherwise read from cookie as a fallback.

  const showToast = useCallback((msg, danger = false) => {
    setToast({ msg, danger });
    setTimeout(() => setToast({ msg: '', danger: false }), 3000);
  }, []);

  // ── Derived state ───────────────────────────────────────────────────────
  const total = cartTotal || 0;
  const emailValid = paymentEmail && validateEmail(paymentEmail);
  const readyToPay = !!selectedAddress && emailValid;

  // ── Address handlers ────────────────────────────────────────────────────
  const handleAddAddress = () => {
    if (!newAddress.address || !newAddress.city || !newAddress.phone) {
      showToast('Please fill address, city and phone.', true);
      return;
    }
    const addr = { ...newAddress, isDefault: addresses.length === 0 };
    setAddresses((prev) => [...prev, addr]);
    setSelectedAddress(addr);
    setShowAddAddress(false);
    setNewAddress({
      address: '',
      city: '',
      region: '',
      nearestLandmark: '',
      phone: user?.phone || '',
    });
  };

  // ── Cart item normalizer ────────────────────────────────────────────────
  const prepareOrderItems = () =>
    cartItems.map((item) => ({
      productId: item.product?._id || item.productId || item.id,
      name: item.product?.name || item.name,
      quantity: item.quantity || 1,
      unit: item.product?.unit || 'piece',
      price: item.product?.price || item.price,
      product: item.product?._id || item.productId || item.id,
    }));

  const prepareOrderData = (paymentReference, paymentStatus) => ({
    orderItems: prepareOrderItems(),
    shippingAddress: {
      address: selectedAddress.address,
      city: selectedAddress.city,
      region: selectedAddress.region || '',
      nearestLandmark: selectedAddress.nearestLandmark || '',
      phone: selectedAddress.phone || user?.phone,
    },
    deliverySchedule: {
      preferredDay: deliveryDay,
      preferredTime: deliveryTime,
    },
    paymentMethod: 'paystack',
    paymentReference,
    paymentStatus,
    ...(referralCode && { referralCode }),
  });

  // ── Form validation ─────────────────────────────────────────────────────
  const validateForm = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty.', true);
      return false;
    }
    if (!selectedAddress) {
      showToast('Please select or add a delivery address.', true);
      return false;
    }
    if (!deliveryDay || !deliveryTime) {
      showToast('Please choose a delivery day and time.', true);
      return false;
    }
    if (!paymentEmail.trim()) {
      setPaymentEmailError('Email is required for payment');
      return false;
    }
    if (!validateEmail(paymentEmail)) {
      setPaymentEmailError('Please enter a valid email address');
      return false;
    }
    const outOfStock = cartItems.filter((item) => {
      const stock =
        item.product?.countInStock ?? item.product?.stock ?? 0;
      return stock < (item.quantity || 1);
    });
    if (outOfStock.length > 0) {
      const names = outOfStock.map((i) => i.product?.name || i.name).join(', ');
      showToast(`Not enough stock for: ${names}`, true);
      return false;
    }
    return true;
  };

  // ── Paystack popup (web) ────────────────────────────────────────────────
  const openPaystackPopup = () =>
    new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.PaystackPop) {
        console.error('Paystack inline script not loaded');
        resolve({ success: false, error: 'Payment system not ready' });
        return;
      }

      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) {
        resolve({ success: false, error: 'Paystack key missing' });
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: paymentEmail.trim(),
        amount: Math.round(total * 100), // pesewas
        currency: 'GHS',
        metadata: {
          custom_fields: [
            {
              display_name: 'Phone',
              variable_name: 'phone',
              value: user?.phone || selectedAddress?.phone || '',
            },
          ],
        },
        callback: (response) => {
          resolve({ success: true, reference: response.reference });
        },
        onClose: () => {
          resolve({ success: false, cancelled: true });
        },
      });

      handler.openIframe();
    });

  // ── Create order after payment ──────────────────────────────────────────
  const createOrderAfterPayment = async (paymentReference, paymentStatus) => {
    const orderData = prepareOrderData(paymentReference, paymentStatus);
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? window.localStorage.getItem('@cedimart_token')
        : null);

    const res = await createOrderApi(orderData, authToken);

    if (res.status === 200 || res.status === 201) {
      await clearCart?.();
      await refreshCart?.();

      const orderNumber =
        res.data?.data?.orderNumber ||
        res.data?.data?._id ||
        res.data?.orderNumber ||
        'N/A';

      showToast(`Order #${orderNumber} placed successfully!`);
      setTimeout(() => {
        const orderId =
          res.data?.data?._id || res.data?.data?.id || res.data?.orderId;
        router.push(orderId ? `/order/${orderId}` : '/orders');
      }, 1200);
    } else {
      throw new Error(
        res.data?.message ||
          "Your payment was processed but we couldn't create your order."
      );
    }
  };

  // ── Place order ─────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setPlacingOrder(true);
    try {
      if (!isAuthenticated) {
        router.push('/login?redirect=/checkout');
        return;
      }

      const paymentResult = await openPaystackPopup();

      if (!paymentResult.success) {
        if (paymentResult.cancelled) {
          return;
        }
        showToast(paymentResult.error || 'Payment failed. Please try again.', true);
        return;
      }

      // Verify server-side (best-effort)
      let paymentVerified = false;
      try {
        const verifyRes = await verifyPayment(paymentResult.reference);
        paymentVerified =
          verifyRes?.status === 200 && verifyRes?.data?.success === true;
      } catch (err) {
        console.warn('Payment verification error (non-blocking):', err?.message);
      }

      await createOrderAfterPayment(
        paymentResult.reference,
        paymentVerified ? 'paid' : 'pending'
      );
    } catch (err) {
      console.error('Order placement error:', err);

      const status = err.response?.status;
      if (status === 400) {
        if (err.response?.data?.outOfStockItems) {
          const names = err.response.data.outOfStockItems
            .map((i) => i.name)
            .join(', ');
          showToast(`Items unavailable: ${names}`, true);
        } else {
          showToast(
            err.response?.data?.message || 'Invalid order. Please check your items.',
            true
          );
        }
      } else if (status === 401) {
        router.push('/login?redirect=/checkout');
      } else if (status === 409) {
        showToast(
          'This order may have already been placed. Check your orders.',
          true
        );
      } else if (!err.response) {
        showToast('Network error. Please check your connection.', true);
      } else {
        showToast(
          err.response?.data?.message ||
            'Failed to process your order. Please try again.',
          true
        );
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (authLoading || cartLoading || !screenReady) {
    return (
      <div className="ck-page">
        <div className="ck-loading">
          <div className="ck-loading-icon">
            <Loader2 size={34} strokeWidth={2.4} className="ck-spin" />
          </div>
          <p className="ck-loading-title">Preparing Checkout</p>
          <p className="ck-loading-sub">Getting everything ready for you…</p>
        </div>
      </div>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="ck-page">
        <div className="ck-shell">
          <div className="ck-nav">
            <button
              className="ck-nav-btn"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ChevronLeft size={22} strokeWidth={2.4} />
            </button>
            <span className="ck-nav-title">Checkout</span>
            <span className="ck-nav-spacer" />
          </div>
        </div>
        <div className="ck-empty">
          <div className="ck-prompt-card">
            <div className="ck-prompt-icon">
              <Store size={44} strokeWidth={1.6} />
            </div>
            <h1 className="ck-prompt-title">Your cart is empty</h1>
            <p className="ck-prompt-sub">
              Add some items to your cart to get started with checkout.
            </p>
            <Link href="/listings" className="ck-btn ck-btn-primary">
              <Store size={18} strokeWidth={2.4} />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout ───────────────────────────────────────────────────────
  return (
    <div className="ck-page">
      {/* Toast */}
      {toast.msg && (
        <div className={`ck-toast${toast.danger ? ' is-danger' : ''}`}>
          {toast.msg}
        </div>
      )}

      <div className="ck-shell">
        {/* Nav */}
        <div className="ck-nav">
          <button
            className="ck-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <div className="ck-nav-center">
            <span className="ck-nav-title">Checkout</span>
            <span className="ck-nav-secure">
              <ShieldCheck size={11} strokeWidth={2.4} />
              Secure
            </span>
          </div>
          <span className="ck-nav-spacer" />
        </div>

        {/* Page header */}
        <div className="ck-header">
          <h1 className="ck-title">Checkout</h1>
          <p className="ck-subtitle">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · GH₵{' '}
            {total.toFixed(2)}
          </p>
        </div>

        {/* ── Delivery Address ── */}
        <section
          className={`ck-card${
            !selectedAddress ? ' is-required' : ''
          }`}
        >
          <SectionHeader
            icon={MapPin}
            title="Delivery Address"
            filled={!!selectedAddress}
            required
          />

          {!selectedAddress && !showAddAddress && (
            <div className="ck-nudge">
              <MapPin size={30} strokeWidth={1.6} color="#99F6E4" />
              <p className="ck-nudge-title">Where should we deliver?</p>
              <p className="ck-nudge-sub">
                Add your first address to continue
              </p>
            </div>
          )}

          {showAddAddress ? (
            <div className="ck-form">
              <InputField
                label="Campus or Street Address"
                required
                placeholder="e.g. 12 Accra Road, East Legon"
                value={newAddress.address}
                onChange={(v) => setNewAddress({ ...newAddress, address: v })}
                autoComplete="street-address"
              />
              <InputField
                label="Campus or City"
                required
                placeholder="e.g. UG or East Legon"
                value={newAddress.city}
                onChange={(v) => setNewAddress({ ...newAddress, city: v })}
                autoComplete="address-level2"
              />
              <InputField
                label="Phone Number"
                required
                placeholder="e.g. 0244000000"
                value={newAddress.phone}
                onChange={(v) => setNewAddress({ ...newAddress, phone: v })}
                inputMode="tel"
                autoComplete="tel"
              />
              <InputField
                label="Nearest Landmark"
                placeholder="e.g. Behind Total Filling Station"
                value={newAddress.nearestLandmark}
                onChange={(v) =>
                  setNewAddress({ ...newAddress, nearestLandmark: v })
                }
              />
              <div className="ck-form-btns">
                <button
                  type="button"
                  className="ck-btn-secondary"
                  onClick={() => setShowAddAddress(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ck-btn-primary-inline"
                  onClick={handleAddAddress}
                >
                  <Check size={16} strokeWidth={2.6} />
                  Save Address
                </button>
              </div>
            </div>
          ) : (
            <>
              {addresses.map((addr, i) => {
                const isSelected =
                  selectedAddress && selectedAddress === addr;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`ck-addr-card${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <span className={`ck-radio${isSelected ? ' is-active' : ''}`}>
                      {isSelected && <span className="ck-radio-fill" />}
                    </span>
                    <span className="ck-addr-body">
                      <span className="ck-addr-main">{addr.address}</span>
                      <span className="ck-addr-sub">
                        {addr.city}
                        {addr.phone ? ` · ${addr.phone}` : ''}
                      </span>
                    </span>
                    {isSelected && (
                      <CheckCircle2
                        size={20}
                        strokeWidth={2.4}
                        color="#059669"
                      />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                className={`ck-add-addr-btn${
                  !selectedAddress ? ' is-filled' : ''
                }`}
                onClick={() => setShowAddAddress(true)}
              >
                <Plus size={19} strokeWidth={2.4} />
                Add New Address
              </button>
            </>
          )}
        </section>

        {/* ── Payment Email ── */}
        <section
          className={`ck-card${!emailValid ? ' is-required' : ''}`}
        >
          <SectionHeader
            icon={Mail}
            title="Payment Email"
            filled={emailValid}
            required
          />

          <div className="ck-info-banner">
            <Info size={15} strokeWidth={2.4} />
            <span>
              Your receipt and order confirmation will be sent here
            </span>
          </div>

          <div
            className={`ck-email-wrap${
              paymentEmailError
                ? ' is-error'
                : emailValid
                ? ' is-success'
                : ''
            }`}
          >
            <Mail
              size={18}
              strokeWidth={2.2}
              className="ck-email-icon"
              color={
                paymentEmailError
                  ? '#DC2626'
                  : emailValid
                  ? '#059669'
                  : '#94A3B8'
              }
            />
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              className="ck-email-input"
              placeholder="yourname@example.com"
              value={paymentEmail}
              onChange={(e) => {
                const v = e.target.value.trim();
                setPaymentEmail(v);
                if (paymentEmailError && validateEmail(v))
                  setPaymentEmailError('');
              }}
            />
            {emailValid && (
              <CheckCircle2 size={18} strokeWidth={2.4} color="#059669" />
            )}
          </div>

          {paymentEmailError && (
            <div className="ck-field-msg is-error">
              <XCircle size={14} strokeWidth={2.4} />
              <span>{paymentEmailError}</span>
            </div>
          )}
          {!paymentEmailError && emailValid && (
            <div className="ck-field-msg is-success">
              <CheckCircle2 size={14} strokeWidth={2.4} />
              <span>Looks good!</span>
            </div>
          )}
        </section>

        {/* ── Order Summary ── */}
        <section className="ck-card">
          <SectionHeader
            icon={Receipt}
            title="Order Summary"
            filled
            action={{
              label: 'Edit Cart',
              onPress: () => router.push('/cart'),
            }}
          />

          <div className="ck-items-list">
            {cartItems.map((item, i) => {
              const p = item.product || item;
              const qty = item.quantity || 1;
              const lineTotal = (qty * (p.price || 0)).toFixed(2);
              const imageUri =
                p.images?.[0] ||
                p.image ||
                'https://placehold.co/64x64/F1F5F9/94A3B8?text=—';

              return (
                <div
                  key={i}
                  className={`ck-item-row${
                    i === cartItems.length - 1 ? ' is-last' : ''
                  }`}
                >
                  <div className="ck-item-thumb">
                    <Image
                      src={imageUri}
                      alt={p.name || 'Item'}
                      width={56}
                      height={56}
                      unoptimized
                    />
                  </div>
                  <div className="ck-item-body">
                    <p className="ck-item-name">{p.name || 'Item'}</p>
                    <p className="ck-item-meta">
                      {qty} × GH₵ {Number(p.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <span className="ck-item-total">GH₵ {lineTotal}</span>
                </div>
              );
            })}
          </div>

          <div className="ck-totals">
            <div className="ck-totals-row">
              <span className="ck-totals-label">
                Subtotal ({cartItems.length} item
                {cartItems.length !== 1 ? 's' : ''})
              </span>
              <span className="ck-totals-value">
                GH₵ {cartTotal.toFixed(2)}
              </span>
            </div>
            <div className="ck-totals-divider" />
            <div className="ck-grand-row">
              <span className="ck-grand-label">Total to pay now</span>
              <span className="ck-grand-amount">GH₵ {total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* ── Delivery Schedule ── */}
        <section className="ck-card">
          <SectionHeader
            icon={Calendar}
            title="Delivery Schedule"
            filled={!!(deliveryDay && deliveryTime)}
          />

          <p className="ck-field-group-label">Preferred Day</p>
          <div className="ck-day-grid">
            {DELIVERY_DAYS.map((day) => {
              const active = deliveryDay === day.id;
              return (
                <button
                  key={day.id}
                  type="button"
                  className={`ck-day-chip${active ? ' is-active' : ''}`}
                  onClick={() => setDeliveryDay(day.id)}
                >
                  {day.label}
                </button>
              );
            })}
          </div>

          <p className="ck-field-group-label">Preferred Time</p>
          <div className="ck-time-grid">
            {DELIVERY_TIMES.map((time) => {
              const Icon = time.icon;
              const active = deliveryTime === time.id;
              return (
                <button
                  key={time.id}
                  type="button"
                  className={`ck-time-card${active ? ' is-active' : ''}`}
                  onClick={() => setDeliveryTime(time.id)}
                >
                  <span className="ck-time-icon">
                    <Icon size={20} strokeWidth={2.2} />
                  </span>
                  <span className="ck-time-label">{time.label}</span>
                  <span className="ck-time-sub">{time.sub}</span>
                  {active && (
                    <span className="ck-time-check">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Bottom bar ── */}
      <div className="ck-bottom-bar">
        <div className="ck-bottom-inner">
          <div className="ck-checklist">
            {[
              { label: 'Address', done: !!selectedAddress },
              { label: 'Email', done: !!emailValid },
              {
                label: 'Schedule',
                done: !!(deliveryDay && deliveryTime),
              },
            ].map((item, i, arr) => (
              <span key={item.label} className="ck-checklist-item">
                {i > 0 && <span className="ck-checklist-sep" />}
                {item.done ? (
                  <CheckCircle2 size={15} strokeWidth={2.4} color="#059669" />
                ) : (
                  <Circle size={15} strokeWidth={2.2} color="#D0D0D0" />
                )}
                <span
                  className={`ck-checklist-label${
                    item.done ? ' is-done' : ''
                  }`}
                >
                  {item.label}
                </span>
              </span>
            ))}
          </div>

          <div className="ck-bottom-amount-row">
            <span className="ck-bottom-amount-label">Total to pay now</span>
            <span className="ck-bottom-amount">GH₵ {total.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className={`ck-pay-btn${
              placingOrder
                ? ' is-loading'
                : !readyToPay
                ? ' is-incomplete'
                : ''
            }`}
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <>
                <Loader2 size={18} strokeWidth={2.4} className="ck-spin" />
                Processing…
              </>
            ) : (
              <>
                <Lock size={16} strokeWidth={2.4} />
                Pay GH₵ {total.toFixed(2)}
              </>
            )}
          </button>

          <p className="ck-terms">
            <Lock size={10} strokeWidth={2.4} /> Secured by Paystack ·
            Continuing means you agree to our Terms
          </p>
        </div>
      </div>
    </div>
  );
}