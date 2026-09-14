// src/app/favorites/FavoritesClient.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Heart,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
  LogIn,
  Store,
  Laptop,
  Smartphone,
  Monitor,
  Gamepad2,
  Shirt,
  BookOpen,
  Home as HomeIcon,
  Plug,
  Armchair,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Wrench,
  Watch,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { removeFromFavorites } from '@/apis/userActionsApi';
import './favorites.css';

// ─── Category display names ───────────────────────────────────────────────────
const CATEGORY_NAMES = {
  'electronics':              'Electronics',
  'phones and tablets':       'Phones & Tablets',
  'computers and laptops':    'Computers & Laptops',
  'gaming':                   'Gaming',
  'fashion':                  'Fashion',
  'books-course-materials':   'Books & Course Materials',
  'hostel-items':             'Hostel Items',
  'appliances':               'Appliances',
  'furniture':                'Furniture',
  'beauty and grooming':      'Beauty & Grooming',
  'sports and fitness':       'Sports & Fitness',
  'food and drinks':          'Food & Drinks',
  'services':                 'Services',
  'accessories':              'Accessories',
  'other':                    'Other',
};

// ─── Category icons — must match components/Home/constants.js ─────────────────
const CATEGORY_ICONS = {
  'electronics':              Laptop,
  'phones and tablets':       Smartphone,
  'computers and laptops':    Monitor,
  'gaming':                   Gamepad2,
  'fashion':                  Shirt,
  'books-course-materials':   BookOpen,
  'hostel-items':             HomeIcon,
  'appliances':               Plug,
  'furniture':                Armchair,
  'beauty and grooming':      Sparkles,
  'sports and fitness':       Dumbbell,
  'food and drinks':          UtensilsCrossed,
  'services':                 Wrench,
  'accessories':              Watch,
  'other':                    Package,
};

const DEFAULT_CATEGORY_ICON = Package;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCategoryName = (category) =>
  CATEGORY_NAMES[category] || category?.replace(/-/g, ' ') || 'Product';

const getCategoryIcon = (category) =>
  CATEGORY_ICONS[category] || DEFAULT_CATEGORY_ICON;

const fmtPrice = (p) => {
  const n = typeof p === 'number' ? p : parseFloat(p);
  return Number.isFinite(n) ? `GH₵ ${n.toFixed(2)}` : 'GH₵ 0.00';
};

const PLACEHOLDER_IMG =
  'https://placehold.co/400x400/F1F5F9/94A3B8?text=No+Image';

/**
 * Normalizes whatever `favoriteItems` returns into a consistent shape:
 *   { _id, productId, name, price, image, unit, category, countInStock, isPlaceholder }
 */
function processFavoriteItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      // Wrapped: { _id, product: {...} }
      if (item.product && typeof item.product === 'object') {
        return {
          _id: item._id,
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || item.product.images?.[0] || null,
          unit: item.product.unit,
          category: item.product.category,
          description: item.product.description,
          countInStock: item.product.countInStock,
          slug: item.product.slug,
          isAvailable: item.product.isAvailable,
          isPlaceholder: false,
        };
      }

      // Bare reference: only an _id, no other fields
      if (item._id && !item.name) {
        return {
          _id: item._id,
          productId: item._id,
          name: 'Product',
          price: 0,
          image: null,
          unit: 'piece',
          category: 'other',
          countInStock: 0,
          isPlaceholder: true,
        };
      }

      // Full product
      return {
        ...item,
        image: item.image || item.images?.[0] || null,
        productId: item.productId || item._id,
        isPlaceholder: false,
      };
    })
    .filter(Boolean);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FavoritesClient() {
  const router = useRouter();
  const { favoriteItems = [], loading, refreshCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [removingItems, setRemovingItems] = useState({});
  const [toast, setToast] = useState({ msg: '', danger: false });

  const didInitRef = useRef(false);

  const showToast = useCallback((msg, danger = false) => {
    setToast({ msg, danger });
    setTimeout(() => setToast({ msg: '', danger: false }), 2600);
  }, []);

  // Normalize incoming favorites
  const processedFavorites = processFavoriteItems(favoriteItems);

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (isAuthenticated && typeof refreshCart === 'function') {
      refreshCart().catch((err) =>
        console.error('Favorites refresh failed:', err)
      );
    }

    return () => {
      didInitRef.current = false;
    };
  }, [authLoading, isAuthenticated, refreshCart]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCart?.();
    } finally {
      setRefreshing(false);
    }
  };

  // ── Remove a single favorite ────────────────────────────────────────────
  const handleRemoveFavorite = async (item) => {
    const productId = item.productId || item._id;
    if (!productId) return;
    if (!window.confirm(`Remove "${item.name}" from your favorites?`)) return;

    try {
      setRemovingItems((prev) => ({ ...prev, [productId]: true }));
      const response = await removeFromFavorites(productId);

      if (response?.success || response?.status === 200) {
        await refreshCart?.();
        showToast(`${item.name} removed from favorites`);
      } else {
        showToast(
          response?.message || 'Failed to remove from favorites',
          true
        );
      }
    } catch (err) {
      console.error('Remove favorite failed:', err);
      showToast('Failed to remove from favorites. Please try again.', true);
    } finally {
      setRemovingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ── Clear all (sequential loop) ─────────────────────────────────────────
  const handleClearAll = async () => {
    const validItems = processedFavorites.filter((i) => !i.isPlaceholder);
    if (validItems.length === 0) {
      showToast('There are no items to clear.', true);
      return;
    }
    if (
      !window.confirm(
        `Remove all ${validItems.length} item${
          validItems.length === 1 ? '' : 's'
        } from your favorites?`
      )
    ) {
      return;
    }

    try {
      // Mark all as removing for visual feedback
      const next = {};
      validItems.forEach((i) => {
        const id = i.productId || i._id;
        if (id) next[id] = true;
      });
      setRemovingItems(next);

      // Sequential to avoid hammering the server
      let removed = 0;
      for (const item of validItems) {
        const pid = item.productId || item._id;
        if (!pid) continue;
        try {
          await removeFromFavorites(pid);
          removed++;
        } catch (err) {
          console.error(`Failed to remove ${pid}:`, err);
        }
      }

      await refreshCart?.();
      showToast(
        removed === validItems.length
          ? 'All favorites cleared'
          : `Removed ${removed} of ${validItems.length} items`
      );
    } catch (err) {
      console.error('Clear all failed:', err);
      showToast('Failed to clear favorites', true);
    } finally {
      setRemovingItems({});
    }
  };

  // ── Product navigation ──────────────────────────────────────────────────
  const handleProductClick = (item) => {
    if (item.isPlaceholder) return;
    router.push(`/product/${item.productId || item._id}`);
  };

  // ── Auth loading ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="fv-page">
        <div className="fv-nav">
          <button
            className="fv-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <span className="fv-nav-title">My Favorites</span>
          <span className="fv-nav-spacer" />
        </div>
        <div className="fv-loading">
          <div className="fv-loading-icon">
            <Loader2 size={34} strokeWidth={2.4} className="fv-spin" />
          </div>
          <p className="fv-loading-title">Loading your favorites…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ───────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="fv-page">
        <div className="fv-nav">
          <button
            className="fv-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <span className="fv-nav-title">My Favorites</span>
          <span className="fv-nav-spacer" />
        </div>

        <div className="fv-empty-wrap">
          <div className="fv-prompt-card">
            <div className="fv-prompt-icon">
              <Heart size={44} strokeWidth={1.6} />
            </div>
            <h1 className="fv-prompt-title">Login to View Favorites</h1>
            <p className="fv-prompt-sub">
              Sign in to see and manage the products you&apos;ve saved for
              later.
            </p>
            <Link
              href="/login?redirect=/favorites"
              className="fv-btn fv-btn-primary"
            >
              <LogIn size={18} strokeWidth={2.4} />
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading initial ─────────────────────────────────────────────────────
  if (loading && !refreshing && processedFavorites.length === 0) {
    return (
      <div className="fv-page">
        <div className="fv-nav">
          <button
            className="fv-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <span className="fv-nav-title">My Favorites</span>
          <span className="fv-nav-spacer" />
        </div>
        <div className="fv-loading">
          <div className="fv-loading-icon">
            <Loader2 size={34} strokeWidth={2.4} className="fv-spin" />
          </div>
          <p className="fv-loading-title">Loading your favorites…</p>
        </div>
      </div>
    );
  }

  // ── Derived for header ──────────────────────────────────────────────────
  const validFavorites = processedFavorites.filter((i) => !i.isPlaceholder);
  const placeholderCount = processedFavorites.length - validFavorites.length;

  // ── Main ────────────────────────────────────────────────────────────────
  return (
    <div className="fv-page">
      {/* Toast */}
      {toast.msg && (
        <div className={`fv-toast${toast.danger ? ' is-danger' : ''}`}>
          {toast.msg}
        </div>
      )}

      <div className="fv-shell">
        {/* Nav */}
        <div className="fv-nav">
          <button
            className="fv-nav-btn"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <span className="fv-nav-title">My Favorites</span>
          {validFavorites.length > 0 ? (
            <button
              className="fv-nav-btn fv-nav-btn-danger"
              onClick={handleClearAll}
              aria-label="Clear all favorites"
              title="Clear all favorites"
            >
              <Trash2 size={18} strokeWidth={2.2} />
            </button>
          ) : (
            <span className="fv-nav-spacer" />
          )}
        </div>

        {processedFavorites.length === 0 ? (
          // Empty state
          <div className="fv-empty-wrap">
            <div className="fv-prompt-card">
              <div className="fv-prompt-icon">
                <Heart size={44} strokeWidth={1.6} />
              </div>
              <h1 className="fv-prompt-title">No Favorites Yet</h1>
              <p className="fv-prompt-sub">
                Tap the heart icon on any product to add it to your favorites.
              </p>
              <Link href="/listings" className="fv-btn fv-btn-primary">
                <Store size={18} strokeWidth={2.4} />
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="fv-stats">
              <span>
                {validFavorites.length}{' '}
                {validFavorites.length === 1 ? 'item' : 'items'} in favorites
                {placeholderCount > 0 && (
                  <span className="fv-stats-muted">
                    {' '}
                    ({placeholderCount} loading…)
                  </span>
                )}
              </span>
              <button
                type="button"
                className="fv-refresh-btn"
                onClick={onRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <Loader2
                      size={12}
                      strokeWidth={2.6}
                      className="fv-spin"
                    />
                    Refreshing…
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>

            {/* Grid */}
            <div className="fv-grid">
              {processedFavorites.map((item) => {
                const productId = item.productId || item._id;
                const isRemoving = !!removingItems[productId];
                const isPlaceholder = item.isPlaceholder;
                const inStock = (item.countInStock ?? 0) > 0 || isPlaceholder;
                const CategoryIcon = getCategoryIcon(item.category);

                return (
                  <article
                    key={productId}
                    className={`fv-card${
                      isPlaceholder ? ' is-placeholder' : ''
                    }`}
                  >
                    {/* Image / remove button */}
                    <div
                      className="fv-card-img-wrap"
                      onClick={() =>
                        !isPlaceholder && handleProductClick(item)
                      }
                      role={isPlaceholder ? undefined : 'button'}
                      tabIndex={isPlaceholder ? -1 : 0}
                      onKeyDown={(e) => {
                        if (
                          !isPlaceholder &&
                          (e.key === 'Enter' || e.key === ' ')
                        ) {
                          e.preventDefault();
                          handleProductClick(item);
                        }
                      }}
                    >
                      {item.image && !isPlaceholder ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={400}
                          height={400}
                          unoptimized
                          className="fv-card-img"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMG;
                          }}
                        />
                      ) : (
                        <div className="fv-card-img-ph">
                          <Package
                            size={44}
                            strokeWidth={1.4}
                            color="#94A3B8"
                          />
                        </div>
                      )}

                      {/* Remove (heart) button */}
                      <button
                        type="button"
                        className="fv-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(item);
                        }}
                        disabled={isRemoving || isPlaceholder}
                        aria-label={`Remove ${item.name} from favorites`}
                        title="Remove from favorites"
                      >
                        {isRemoving ? (
                          <Loader2
                            size={16}
                            strokeWidth={2.6}
                            className="fv-spin"
                          />
                        ) : (
                          <Heart
                            size={18}
                            strokeWidth={2.2}
                            fill={isPlaceholder ? 'none' : 'currentColor'}
                            color={isPlaceholder ? '#CBD5E1' : '#DC2626'}
                          />
                        )}
                      </button>

                      {/* Placeholder overlay */}
                      {isPlaceholder && (
                        <div className="fv-placeholder-overlay">
                          <Loader2
                            size={18}
                            strokeWidth={2.4}
                            className="fv-spin"
                          />
                          <span>Loading…</span>
                        </div>
                      )}

                      {/* Out-of-stock badge */}
                      {!isPlaceholder && !inStock && (
                        <span className="fv-oos-badge">Out of Stock</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="fv-card-info">
                      <p className="fv-card-name">
                        {isPlaceholder ? 'Loading product…' : item.name}
                      </p>

                      {!isPlaceholder && (
                        <>
                          <span className="fv-card-cat">
                            <CategoryIcon size={12} strokeWidth={2.2} />
                            {getCategoryName(item.category)}
                          </span>

                          <p className="fv-card-price">
                            {fmtPrice(item.price)}
                            <span className="fv-card-unit">
                              {' '}
                              / {item.unit || 'piece'}
                            </span>
                          </p>

                          <div
                            className={`fv-stock${
                              inStock ? ' is-in' : ' is-out'
                            }`}
                          >
                            {inStock ? (
                              <>
                                <CheckCircle2
                                  size={14}
                                  strokeWidth={2.4}
                                />
                                <span>In Stock</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={14} strokeWidth={2.4} />
                                <span>Out of Stock</span>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="fv-bottom-spacer" />
      </div>
    </div>
  );
}