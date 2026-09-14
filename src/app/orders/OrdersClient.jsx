// src/app/orders/OrdersClient.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Receipt,
  Clock,
  RefreshCw,
  Bike,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Layers,
  Calendar,
  Lock,
  LogIn,
  Store,
  Package,
  Navigation,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyOrder } from '@/apis/orderApi';
import './orders.css';

// ─── Config ───────────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all',              label: 'All',         icon: LayoutGrid,     color: '#0D9488' },
  { id: 'pending',          label: 'Pending',     icon: Clock,          color: '#F97316' },
  { id: 'processing',       label: 'Processing',  icon: RefreshCw,           color: '#0284C7' },
  { id: 'out_for_delivery', label: 'On the way',  icon: Bike,           color: '#7E22CE' },
  { id: 'delivered',        label: 'Delivered',   icon: CheckCircle2,   color: '#059669' },
  { id: 'cancelled',        label: 'Cancelled',   icon: XCircle,        color: '#DC2626' },
];

const STATUS_META = {
  Pending:              { color: '#F97316', bg: '#FFF7ED', icon: Clock },
  Processing:           { color: '#0284C7', bg: '#F0F9FF', icon: RefreshCw },
  'Out for Delivery':   { color: '#7E22CE', bg: '#F3E8FF', icon: Bike },
  Delivered:            { color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  Cancelled:            { color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
};

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeStatus = (status) =>
  (status || 'Pending').toLowerCase().replace(/ /g, '_');

const getStatusText = (status) => {
  const map = {
    pending:          'Pending',
    processing:       'Processing',
    out_for_delivery: 'Out for Delivery',
    delivered:        'Delivered',
    cancelled:        'Cancelled',
  };
  return map[normalizeStatus(status)] || 'Pending';
};

const formatDate = (ds) => {
  try {
    const d = new Date(ds);
    const now = new Date();
    const days = Math.ceil(Math.abs(now - d) / 86400000);
    if (days === 0)
      return `Today · ${d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    if (days === 1)
      return `Yesterday · ${d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

const getProductImage = (item) => {
  if (!item) return FALLBACK_IMG;
  if (item.image) return item.image;
  const product = item.product;
  if (product?.images?.length > 0) return product.images[0];
  if (product?.image) return product.image;
  return FALLBACK_IMG;
};

const formatMoney = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? `GH₵ ${n.toFixed(2)}` : 'GH₵ 0.00';
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrdersClient() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    processing: 0,
    out_for_delivery: 0,
  });
  const [toast, setToast] = useState({ msg: '', danger: false });

  const didInitRef = useRef(false);

  const showToast = useCallback((msg, danger = false) => {
    setToast({ msg, danger });
    setTimeout(() => setToast({ msg: '', danger: false }), 3000);
  }, []);

  // ── Fetch orders ────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyOrder();
      if (response?.status === 200) {
        const data = response.data?.data || response.data?.orders || [];
        const list = Array.isArray(data) ? data : [];
        setOrders(list);

        // Recompute stats
        const s = {
          total: list.length,
          pending: 0,
          delivered: 0,
          cancelled: 0,
          processing: 0,
          out_for_delivery: 0,
        };
        list.forEach((o) => {
          const st = normalizeStatus(o.status);
          if (st === 'delivered') s.delivered++;
          else if (st === 'cancelled') s.cancelled++;
          else if (st === 'processing') s.processing++;
          else if (st === 'out_for_delivery') s.out_for_delivery++;
          else s.pending++;
        });
        setStats(s);
      } else {
        showToast('Failed to load orders.', true);
      }
    } catch (err) {
      console.error('Orders fetch failed:', err);
      showToast('Failed to load orders. Check your connection.', true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // ── Initial load — only after auth settles ──────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }

    return () => {
      didInitRef.current = false;
    };
  }, [authLoading, isAuthenticated, fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const activeCount =
    stats.pending + stats.processing + stats.out_for_delivery;

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((o) => {
          const st = normalizeStatus(o.status);
          if (filter === 'pending') {
            return ['pending', 'processing', 'out_for_delivery'].includes(st);
          }
          return st === filter;
        });

  const getFilterCount = (id) => {
    if (id === 'all') return stats.total;
    if (id === 'pending')
      return stats.pending + stats.processing + stats.out_for_delivery;
    return stats[id] || 0;
  };

  const handleReorder = (order) => {
    showToast('Reorder feature coming soon!');
  };

  // ── Auth loading ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="or-page">
        <div className="or-loading">
          <div className="or-loading-icon">
            <Loader2 size={34} strokeWidth={2.4} className="or-spin" />
          </div>
          <p className="or-loading-title">Fetching your orders</p>
          <p className="or-loading-sub">Please wait a moment…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ───────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="or-page">
        <div className="or-shell">
          <div className="or-nav">
            <button
              className="or-nav-btn"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ChevronLeft size={22} strokeWidth={2.4} />
            </button>
            <span className="or-nav-title">My Orders</span>
            <span className="or-nav-spacer" />
          </div>
        </div>

        <div className="or-empty-wrap">
          <div className="or-prompt-card">
            <div className="or-prompt-icon">
              <Lock size={44} strokeWidth={1.6} />
            </div>
            <h1 className="or-prompt-title">Sign in to continue</h1>
            <p className="or-prompt-sub">
              View your order history, track deliveries, and manage your
              account.
            </p>
            <Link
              href="/login?redirect=/orders"
              className="or-btn or-btn-primary"
            >
              <LogIn size={18} strokeWidth={2.4} />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading initial ─────────────────────────────────────────────────────
  if (loading && !refreshing && orders.length === 0) {
    return (
      <div className="or-page">
        <div className="or-loading">
          <div className="or-loading-icon">
            <Loader2 size={34} strokeWidth={2.4} className="or-spin" />
          </div>
          <p className="or-loading-title">Fetching your orders</p>
          <p className="or-loading-sub">Please wait a moment…</p>
        </div>
      </div>
    );
  }

  const firstName =
    user?.firstName || user?.name?.split(' ')[0] || 'there';

  return (
    <div className="or-page">
      {/* Toast */}
      {toast.msg && (
        <div className={`or-toast${toast.danger ? ' is-danger' : ''}`}>
          {toast.msg}
        </div>
      )}

      <div className="or-shell">
        {/* Nav */}
        <div className="or-nav">
          <button
            className="or-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <div className="or-nav-right">
            <button
              className="or-nav-btn"
              onClick={onRefresh}
              disabled={refreshing || loading}
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                strokeWidth={2.2}
                className={refreshing || loading ? 'or-spin' : ''}
              />
            </button>
            <Link href="/" className="or-nav-btn" aria-label="Home" title="Home">
              <Home size={18} strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="or-header">
          <div className="or-greeting">
            <p className="or-welcome">Hello, {firstName}!</p>
            <h1 className="or-title">My Orders</h1>
          </div>

          <div className="or-stats">
            <div className="or-stat">
              <span className="or-stat-value">{stats.total}</span>
              <span className="or-stat-label">Total</span>
            </div>
            <span className="or-stat-divider" />
            <div className="or-stat">
              <span
                className={`or-stat-value${
                  activeCount > 0 ? ' is-highlight' : ''
                }`}
              >
                {activeCount}
              </span>
              <span className="or-stat-label">Active</span>
            </div>
            <span className="or-stat-divider" />
            <div className="or-stat">
              <span className="or-stat-value">{stats.delivered}</span>
              <span className="or-stat-label">Delivered</span>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="or-nudge">
              <span className="or-nudge-dot" />
              <span>
                {activeCount} order{activeCount > 1 ? 's' : ''} currently active
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="or-filters-scroll">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.id;
            const count = getFilterCount(f.id);
            return (
              <button
                key={f.id}
                type="button"
                className={`or-filter-chip${active ? ' is-active' : ''}`}
                style={
                  active
                    ? { background: f.color, borderColor: f.color }
                    : undefined
                }
                onClick={() => setFilter(f.id)}
              >
                <Icon size={14} strokeWidth={2.4} />
                <span>{f.label}</span>
                {count > 0 && (
                  <span
                    className={`or-filter-badge${
                      active ? ' is-active' : ''
                    }`}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results row */}
        <div className="or-results-row">
          <span className="or-results-text">
            {filteredOrders.length}{' '}
            {filter !== 'all' ? filter.replace('_', ' ') : ''} order
            {filteredOrders.length !== 1 ? 's' : ''}
          </span>
          {filter !== 'all' && (
            <button
              type="button"
              className="or-clear-btn"
              onClick={() => setFilter('all')}
            >
              <X size={14} strokeWidth={2.4} />
              Clear
            </button>
          )}
        </div>

        {/* Order list */}
        {filteredOrders.length === 0 ? (
          <div className="or-empty">
            <div className="or-empty-icon">
              <Package size={38} strokeWidth={1.6} />
            </div>
            <h3 className="or-empty-title">
              {filter === 'all'
                ? 'No orders yet'
                : `No ${filter.replace('_', ' ')} orders`}
            </h3>
            <p className="or-empty-sub">
              {filter === 'all'
                ? "You haven't placed any orders yet. Start shopping!"
                : `You don't have any ${filter.replace(
                    '_',
                    ' '
                  )} orders at the moment.`}
            </p>
            {filter !== 'all' ? (
              <button
                type="button"
                className="or-empty-btn"
                onClick={() => setFilter('all')}
              >
                <LayoutGrid size={16} strokeWidth={2.4} />
                View All Orders
              </button>
            ) : (
              <Link href="/listings" className="or-empty-btn">
                <Store size={16} strokeWidth={2.4} />
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="or-list">
            {filteredOrders.map((order) => {
              const statusText = getStatusText(order.status);
              const meta = STATUS_META[statusText] || STATUS_META.Pending;
              const StatusIcon = meta.icon;
              const normalizedStatus = normalizeStatus(order.status);
              const orderItems = order.items || order.orderItems || [];
              const itemCount =
                order.itemsCount || orderItems.length || 0;
              const totalPrice =
                order.totalPrice || order.orderTotal || 0;
              const firstItem = orderItems[0];
              const firstImg =
                firstItem?.image || getProductImage(firstItem);
              const orderId = order.id || order._id;

              return (
                <article key={orderId} className="or-card">
                  <span
                    className="or-card-accent"
                    style={{ background: meta.color }}
                  />

                  <div className="or-card-inner">
                    {/* Header */}
                    <div className="or-card-head">
                      <div className="or-card-id-row">
                        <span
                          className="or-card-id-icon"
                          style={{
                            background: meta.bg,
                            color: meta.color,
                          }}
                        >
                          <Receipt size={14} strokeWidth={2.4} />
                        </span>
                        <div>
                          <p className="or-card-id">
                            #
                            {order.orderNumber ||
                              (order._id || '')
                                .substring(0, 8)
                                .toUpperCase()}
                          </p>
                          <p className="or-card-date">
                            {formatDate(order.createdAt || order.orderDate)}
                          </p>
                        </div>
                      </div>

                      <span
                        className="or-status-pill"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <StatusIcon size={11} strokeWidth={2.6} />
                        {statusText}
                      </span>
                    </div>

                    {/* Preview */}
                    <div className="or-card-preview">
                      <Link
                        href={`/orders/${orderId}`}
                        className="or-preview-img-wrap"
                      >
                        <Image
                          src={firstImg}
                          alt="Order item"
                          width={72}
                          height={72}
                          unoptimized
                          className="or-preview-img"
                        />
                        {itemCount > 1 && (
                          <span className="or-preview-more">
                            +{itemCount - 1}
                          </span>
                        )}
                      </Link>

                      <div className="or-preview-details">
                        <span className="or-preview-count">
                          <Layers size={12} strokeWidth={2.2} />
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </span>
                        <p className="or-preview-total">
                          {formatMoney(totalPrice)}
                        </p>
                        {order.deliverySchedule?.preferredDay && (
                          <span className="or-preview-delivery">
                            <Calendar size={12} strokeWidth={2.2} />
                            {order.deliverySchedule.preferredDay}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/orders/${orderId}`}
                        className="or-quick-action"
                        style={{ background: meta.bg, color: meta.color }}
                        aria-label="View order"
                      >
                        {normalizedStatus === 'delivered' ? (
                          <Receipt size={18} strokeWidth={2.2} />
                        ) : (
                          <Navigation size={18} strokeWidth={2.2} />
                        )}
                      </Link>
                    </div>

                    {/* Actions */}
                    <div className="or-card-actions">
                      {normalizedStatus === 'delivered' ? (
                        <button
                          type="button"
                          className="or-action-btn is-primary"
                          onClick={() => handleReorder(order)}
                        >
                          <RefreshCw size={14} strokeWidth={2.4} />
                          Reorder
                        </button>
                      ) : normalizedStatus !== 'cancelled' ? (
                        <Link
                          href={`/orders/${orderId}`}
                          className="or-action-btn is-track"
                        >
                          <Navigation size={14} strokeWidth={2.4} />
                          Track Order
                        </Link>
                      ) : (
                        <span className="or-action-placeholder" />
                      )}

                      <Link
                        href={`/orders/${orderId}`}
                        className="or-action-btn is-ghost"
                      >
                        View Details
                        <ChevronRight size={13} strokeWidth={2.4} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="or-bottom-spacer" />
      </div>
    </div>
  );
}