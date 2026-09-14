// src/app/order/[id]/OrderDetailClient.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  Clock,
  Bike,
  CheckCircle2,
  XCircle,
  ShoppingBasket,
  MapPin,
  Phone,
  Calendar,
  FileText,
  CreditCard,
  Receipt,
  HelpCircle,
  Navigation,
  X,
  Info,
  Heart,
  Tag,
  AlertCircle,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getOrderById, cancelOrder } from '@/apis/orderApi';
import './order-detail.css';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_META = {
  Pending:            { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082', icon: Clock,         dotColor: '#F57F17' },
  Processing:         { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9', icon: RefreshCw,          dotColor: '#1565C0' },
  'Out for Delivery': { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7', icon: Bike,          dotColor: '#2E7D32' },
  Delivered:          { bg: '#E8F5E9', text: '#1B5E20', border: '#A5D6A7', icon: CheckCircle2,  dotColor: '#1B5E20' },
  Cancelled:          { bg: '#FFEBEE', text: '#B71C1C', border: '#EF9A9A', icon: XCircle,       dotColor: '#B71C1C' },
};

const STEPS = ['Pending', 'Processing', 'Out for Delivery', 'Delivered'];

const CANCELLATION_REASONS = [
  { id: 'changed_mind',    label: 'Changed my mind',         icon: Heart },
  { id: 'found_cheaper',   label: 'Found cheaper elsewhere', icon: Tag },
  { id: 'delivery_time',   label: 'Delivery too slow',       icon: Clock },
  { id: 'ordered_mistake', label: 'Ordered by mistake',      icon: AlertCircle },
  { id: 'payment_issues',  label: 'Payment issues',          icon: CreditCard },
  { id: 'other',           label: 'Other reason',            icon: MessageCircle },
];

const SUPPORT_PHONE = '+233505671577';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getProductImage = (item) => {
  if (item?.images?.length > 0) return item.images[0];
  if (item?.image) return item.image;
  if (item?.product?.images?.length > 0) return item.product.images[0];
  if (item?.product?.image) return item.product.image;
  return 'https://placehold.co/64x64/F1F5F9/94A3B8?text=—';
};

const formatDate = (ds) => {
  if (!ds) return '—';
  try {
    return new Date(ds).toLocaleString('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, expanded, onToggle, children }) {
  return (
    <section className="od-section">
      <button
        type="button"
        className="od-section-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="od-section-header-left">
          <span className="od-section-icon">
            <Icon size={16} strokeWidth={2.2} />
          </span>
          <span className="od-section-title">{title}</span>
        </span>
        {expanded ? (
          <ChevronUp size={18} strokeWidth={2.4} className="od-section-chevron" />
        ) : (
          <ChevronDown size={18} strokeWidth={2.4} className="od-section-chevron" />
        )}
      </button>
      {expanded && <div className="od-section-body">{children}</div>}
    </section>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, valueColor }) {
  return (
    <div className="od-info-row">
      <span className="od-info-row-icon">
        <Icon size={15} strokeWidth={2.2} />
      </span>
      <div className="od-info-row-body">
        <span className="od-info-row-label">{label}</span>
        <span
          className="od-info-row-value"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrderDetailClient() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState('items');
  const [toast, setToast] = useState({ msg: '', danger: false });

  // Cancel modal state
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const didInitRef = useRef(false);

  const showToast = useCallback((msg, danger = false) => {
    setToast({ msg, danger });
    setTimeout(() => setToast({ msg: '', danger: false }), 3000);
  }, []);

  // ── Fetch order ─────────────────────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await getOrderById(orderId);
      if (res?.status === 200 && res.data?.data) {
        setOrder(res.data.data);
      } else {
        showToast(res?.message || 'Could not load order', true);
        setTimeout(() => router.push('/orders'), 1200);
      }
    } catch (err) {
      console.error('Order fetch failed:', err);
      showToast('Failed to load order. Check your connection.', true);
      setTimeout(() => router.push('/orders'), 1200);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, router, showToast]);

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/order/${orderId}`);
      return;
    }

    fetchOrder();

    return () => {
      didInitRef.current = false;
    };
  }, [authLoading, isAuthenticated, orderId, router, fetchOrder]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
  };

  const toggle = (s) => setExpanded((prev) => (prev === s ? null : s));

  const handleContactSupport = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${SUPPORT_PHONE}`;
    }
  };

  const handleTrackOrder = () => {
    showToast(
      'Real-time tracking will be available soon. You will be notified when your order is out for delivery.'
    );
  };

  const handleReorder = () => {
    showToast('Reorder feature coming soon!');
  };

  const handleCancelOrder = () => {
    if (!order) return;
    const status = order.status?.current || 'Pending';
    if (!['Pending', 'Processing'].includes(status)) {
      showToast(`Orders with status "${status}" cannot be cancelled.`, true);
      return;
    }
    if (order.payment?.isPaid) {
      showToast(
        'This order has already been paid. Please contact support for assistance.',
        true
      );
      return;
    }
    setCancelReason('');
    setCustomReason('');
    setCancelModalVisible(true);
  };

  const submitCancellation = async () => {
    let finalReason = '';
    if (cancelReason === 'other') {
      if (!customReason.trim()) {
        showToast('Please enter your reason for cancellation', true);
        return;
      }
      finalReason = customReason.trim();
    } else {
      const sel = CANCELLATION_REASONS.find((r) => r.id === cancelReason);
      if (!sel) {
        showToast('Please select a reason for cancellation', true);
        return;
      }
      finalReason = sel.label;
    }

    setCancelling(true);
    try {
      const res = await cancelOrder(orderId, { reason: finalReason });
      if (res?.status === 200 && res.data?.success) {
        showToast('Your order has been successfully cancelled.');
        setCancelModalVisible(false);
        await fetchOrder();
      } else {
        showToast(res.data?.message || 'Failed to cancel order', true);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to cancel order. Please try again.',
        true
      );
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (authLoading || (loading && !refreshing)) {
    return (
      <div className="od-page">
        <div className="od-nav">
          <button
            className="od-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <span className="od-nav-title">Order Details</span>
          <span className="od-nav-spacer" />
        </div>
        <div className="od-loading">
          <div className="od-loading-icon">
            <Loader2 size={34} strokeWidth={2.4} className="od-spin" />
          </div>
          <p className="od-loading-title">Loading order</p>
          <p className="od-loading-sub">Fetching your order details…</p>
        </div>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────
  if (!order) {
    return (
      <div className="od-page">
        <div className="od-nav">
          <button
            className="od-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <span className="od-nav-title">Order Details</span>
          <span className="od-nav-spacer" />
        </div>
        <div className="od-loading">
          <div className="od-loading-icon is-danger">
            <AlertCircle size={34} strokeWidth={2.4} />
          </div>
          <p className="od-loading-title">Order Not Found</p>
          <button
            className="od-go-back-btn"
            onClick={() => router.push('/orders')}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // ── Derived ─────────────────────────────────────────────────────────────
  const status = order.status?.current || 'Pending';
  const meta = STATUS_META[status] || STATUS_META.Pending;
  const StatusIcon = meta.icon;
  const canCancel =
    ['Pending', 'Processing'].includes(status) && !order.payment?.isPaid;
  const stepIdx = STEPS.indexOf(status);
  const orderItems = order.orderItems || [];
  const itemCount = orderItems.length;

  const preferredDay = order.deliverySchedule?.preferredDay || '';
  const preferredTime = order.deliverySchedule?.preferredTime || '—';
  const scheduleLine = `${preferredDay.charAt(0).toUpperCase() + preferredDay.slice(1)} · ${preferredTime}`;

  const totalPrice = order.pricing?.totalPrice;
  const itemsPrice = order.pricing?.itemsPrice;
  const deliveryFee = order.pricing?.deliveryFee;

  return (
    <div className="od-page">
      {/* Toast */}
      {toast.msg && (
        <div className={`od-toast${toast.danger ? ' is-danger' : ''}`}>
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <div className="od-nav">
        <button
          className="od-nav-btn"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>
        <span className="od-nav-title">Order Details</span>
        <button
          className="od-nav-btn"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshCw
            size={18}
            strokeWidth={2.2}
            className={refreshing ? 'od-spin' : ''}
          />
        </button>
      </div>

      <div className="od-shell">
        {/* ── Status hero ── */}
        <div
          className="od-status-hero"
          style={{ background: meta.bg, borderColor: meta.border }}
        >
          <div className="od-status-top">
            <span
              className="od-status-icon-bg"
              style={{ background: meta.text }}
            >
              <StatusIcon size={22} strokeWidth={2.2} color="#fff" />
            </span>
            <div className="od-status-info">
              <span className="od-status-text" style={{ color: meta.text }}>
                {status}
              </span>
              <span className="od-order-num">
                #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <span
              className="od-status-pill"
              style={{ background: meta.text }}
            >
              {status}
            </span>
          </div>

          {status !== 'Cancelled' && (
            <div className="od-progress-row">
              {STEPS.map((s, i) => {
                const done = stepIdx > i;
                const active = stepIdx === i;
                return (
                  <div key={s} className="od-step-wrap">
                    <span
                      className={`od-step-bubble${
                        done ? ' is-done' : active ? ' is-active' : ''
                      }`}
                      style={
                        done || active
                          ? { background: meta.text }
                          : undefined
                      }
                    >
                      {done ? (
                        <CheckCircle2
                          size={11}
                          strokeWidth={3}
                          color="#fff"
                        />
                      ) : (
                        <span
                          className={`od-step-inner${
                            active ? ' is-active' : ''
                          }`}
                        />
                      )}
                    </span>
                    <span
                      className={`od-step-label${
                        done || active ? ' is-active' : ''
                      }`}
                      style={done || active ? { color: meta.text } : undefined}
                    >
                      {s === 'Out for Delivery' ? 'On Way' : s}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span
                        className={`od-step-connector${
                          done ? ' is-done' : ''
                        }`}
                        style={done ? { background: meta.text } : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {status === 'Out for Delivery' && (
            <button
              type="button"
              className="od-track-nudge"
              onClick={handleTrackOrder}
            >
              <Navigation size={15} strokeWidth={2.4} />
              <span>Tap to track your order in real-time</span>
              <ChevronRight size={15} strokeWidth={2.4} />
            </button>
          )}

          {status === 'Delivered' && (
            <div className="od-delivered-banner">
              <CheckCircle2 size={16} strokeWidth={2.4} />
              <span>Delivered on {formatDate(order.deliveredAt)}</span>
            </div>
          )}

          <div className="od-placed-row">
            <Calendar size={13} strokeWidth={2.2} />
            <span>Placed {formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* ── Items ── */}
        <Section
          icon={ShoppingBasket}
          title={`Items (${itemCount})`}
          expanded={expanded === 'items'}
          onToggle={() => toggle('items')}
        >
          {orderItems.map((item, idx) => {
            const qty = item.quantity || 1;
            const price = item.price || 0;
            const lineTotal = (qty * price).toFixed(2);
            const isLast = idx === orderItems.length - 1;
            return (
              <div
                key={idx}
                className={`od-item-row${isLast ? ' is-last' : ''}`}
              >
                <div className="od-item-thumb">
                  <Image
                    src={getProductImage(item)}
                    alt={item.name || 'Item'}
                    width={58}
                    height={58}
                    unoptimized
                  />
                </div>
                <div className="od-item-body">
                  <p className="od-item-name">{item.name}</p>
                  <p className="od-item-meta">
                    {qty} × {item.unit || 'unit'} · GH₵ {price}
                  </p>
                </div>
                <span className="od-item-total">GH₵ {lineTotal}</span>
              </div>
            );
          })}
        </Section>

        {/* ── Delivery ── */}
        <Section
          icon={MapPin}
          title="Delivery"
          expanded={expanded === 'delivery'}
          onToggle={() => toggle('delivery')}
        >
          <InfoRow
            icon={MapPin}
            label="Address"
            value={`${order.shippingAddress?.address || '—'}, ${
              order.shippingAddress?.city || ''
            }`}
          />
          <InfoRow
            icon={Phone}
            label="Phone"
            value={order.shippingAddress?.phone || user?.phone || '—'}
          />
          <InfoRow icon={Calendar} label="Scheduled" value={scheduleLine} />
          {order.deliveryNote && (
            <InfoRow
              icon={FileText}
              label="Note"
              value={order.deliveryNote}
            />
          )}
        </Section>

        {/* ── Payment ── */}
        <Section
          icon={CreditCard}
          title="Payment"
          expanded={expanded === 'payment'}
          onToggle={() => toggle('payment')}
        >
          <InfoRow
            icon={CreditCard}
            label="Method"
            value={order.payment?.method || 'Paystack'}
          />
          <InfoRow
            icon={order.payment?.isPaid ? CheckCircle2 : Clock}
            label="Status"
            value={order.payment?.isPaid ? 'Paid' : 'Pending'}
            valueColor={order.payment?.isPaid ? '#2E7D32' : '#F57F17'}
          />
          {order.payment?.paidAt && (
            <InfoRow
              icon={Calendar}
              label="Paid on"
              value={formatDate(order.payment.paidAt)}
            />
          )}
        </Section>

        {/* ── Price Summary ── */}
        <Section
          icon={Receipt}
          title="Price Summary"
          expanded={expanded === 'summary'}
          onToggle={() => toggle('summary')}
        >
          <div className="od-price-line">
            <span className="od-price-line-label">Items total</span>
            <span className="od-price-line-value">
              GH₵ {itemsPrice ?? '—'}
            </span>
          </div>
          <div className="od-price-line">
            <span className="od-price-line-label od-price-delivery-label">
              <Bike size={13} strokeWidth={2.2} />
              Delivery fee
            </span>
            <span className="od-price-line-value od-price-delivery-value">
              {deliveryFee === 0 ? 'Free' : `GH₵ ${deliveryFee ?? '—'}`}
            </span>
          </div>
          <div className="od-price-divider" />
          <div className="od-price-grand-row">
            <span className="od-price-grand-label">Grand Total</span>
            <span className="od-price-grand-value">
              GH₵ {totalPrice ?? '—'}
            </span>
          </div>
        </Section>

        {/* ── Timeline ── */}
        <Section
          icon={Clock}
          title="Order Timeline"
          expanded={expanded === 'timeline'}
          onToggle={() => toggle('timeline')}
        >
          {[
            {
              label: 'Order Placed',
              sub: formatDate(order.createdAt),
              active: true,
            },
            {
              label: 'Order Confirmed',
              sub: 'Processing started',
              active: ['Processing', 'Out for Delivery', 'Delivered'].includes(
                status
              ),
            },
            {
              label: 'Out for Delivery',
              sub: 'Your order is on the way',
              active: ['Out for Delivery', 'Delivered'].includes(status),
            },
            {
              label: 'Delivered',
              sub: formatDate(order.deliveredAt),
              active: status === 'Delivered',
            },
          ].map((tl, i, arr) => {
            const isLast = i === arr.length - 1;
            const nextActive = !isLast && arr[i + 1].active;
            return (
              <div key={i} className="od-tl-row">
                <div className="od-tl-left">
                  <span
                    className={`od-tl-dot${tl.active ? ' is-active' : ''}`}
                  />
                  {!isLast && (
                    <span
                      className={`od-tl-line${
                        tl.active && nextActive ? ' is-active' : ''
                      }`}
                    />
                  )}
                </div>
                <div
                  className={`od-tl-content${
                    !isLast ? ' has-spacing' : ''
                  }`}
                >
                  <span
                    className={`od-tl-label${tl.active ? ' is-active' : ''}`}
                  >
                    {tl.label}
                  </span>
                  {tl.active && tl.sub && tl.sub !== '—' && (
                    <span className="od-tl-sub">{tl.sub}</span>
                  )}
                </div>
              </div>
            );
          })}
        </Section>

        <div className="od-bottom-spacer" />
      </div>

      {/* ── Bottom action bar ── */}
      <div className="od-bottom-bar">
        <div className="od-bottom-inner">
          <button
            type="button"
            className="od-action-btn is-blue"
            onClick={handleContactSupport}
          >
            <HelpCircle size={17} strokeWidth={2.4} />
            Support
          </button>

          {status === 'Out for Delivery' && (
            <button
              type="button"
              className="od-action-btn is-green"
              onClick={handleTrackOrder}
            >
              <Navigation size={17} strokeWidth={2.4} />
              Track
            </button>
          )}

          {status === 'Delivered' && (
            <button
              type="button"
              className="od-action-btn is-amber"
              onClick={handleReorder}
            >
              <RefreshCw size={17} strokeWidth={2.4} />
              Reorder
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              className="od-action-btn is-red"
              onClick={handleCancelOrder}
            >
              <XCircle size={17} strokeWidth={2.4} />
              Cancel
            </button>
          )}

          {!order.payment?.isPaid &&
            status !== 'Cancelled' &&
            !canCancel &&
            status !== 'Delivered' && (
              <button
                type="button"
                className="od-action-btn is-green"
                onClick={() => showToast('Redirecting to payment…')}
              >
                <CreditCard size={17} strokeWidth={2.4} />
                Pay Now
              </button>
            )}
        </div>
      </div>

      {/* ── Cancellation modal ── */}
      {cancelModalVisible && (
        <div
          className="od-modal-backdrop"
          onClick={() => !cancelling && setCancelModalVisible(false)}
        >
          <div
            className="od-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="od-modal-handle" />

            <div className="od-modal-head">
              <div className="od-modal-head-left">
                <span className="od-modal-head-icon">
                  <XCircle size={20} strokeWidth={2.2} />
                </span>
                <h3 className="od-modal-title">Cancel Order</h3>
              </div>
              <button
                type="button"
                className="od-modal-close"
                onClick={() => setCancelModalVisible(false)}
                disabled={cancelling}
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.4} />
              </button>
            </div>

            <div className="od-modal-body">
              <div className="od-modal-order-strip">
                <span className="od-modal-order-num">
                  Order #
                  {order.orderNumber || order._id?.slice(-8).toUpperCase()}
                </span>
                <span className="od-modal-order-total">
                  GH₵ {order.pricing?.totalPrice || '—'}
                </span>
              </div>

              <p className="od-modal-subtitle">
                Why are you cancelling this order?
              </p>

              <div className="od-reason-grid">
                {CANCELLATION_REASONS.map((r) => {
                  const Icon = r.icon;
                  const active = cancelReason === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={`od-reason-card${
                        active ? ' is-active' : ''
                      }`}
                      onClick={() => {
                        setCancelReason(r.id);
                        if (r.id !== 'other') setCustomReason('');
                      }}
                    >
                      <span
                        className={`od-reason-icon-bg${
                          active ? ' is-active' : ''
                        }`}
                      >
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <span
                        className={`od-reason-label${
                          active ? ' is-active' : ''
                        }`}
                      >
                        {r.label}
                      </span>
                      {active && (
                        <span className="od-reason-check">
                          <CheckCircle2
                            size={12}
                            strokeWidth={3}
                            color="#fff"
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {cancelReason === 'other' && (
                <div className="od-custom-reason">
                  <label className="od-custom-reason-label">
                    Please describe your reason
                  </label>
                  <textarea
                    className="od-custom-reason-input"
                    placeholder="Enter your reason here…"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                </div>
              )}

              <div className="od-policy-banner">
                <Info size={16} strokeWidth={2.4} />
                <span>
                  Cancelling will void any pending payments and return items to
                  stock.
                </span>
              </div>
            </div>

            <div className="od-modal-footer">
              <button
                type="button"
                className="od-keep-btn"
                onClick={() => setCancelModalVisible(false)}
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                type="button"
                className="od-confirm-cancel-btn"
                onClick={submitCancellation}
                disabled={
                  !cancelReason ||
                  (cancelReason === 'other' && !customReason.trim()) ||
                  cancelling
                }
              >
                {cancelling ? (
                  <Loader2 size={16} strokeWidth={2.4} className="od-spin" />
                ) : (
                  <>
                    <XCircle size={16} strokeWidth={2.4} />
                    Cancel Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}