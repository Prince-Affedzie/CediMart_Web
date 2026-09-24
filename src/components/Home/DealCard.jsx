// src/components/Home/DealCard.jsx
'use client';

import Link from 'next/link';
import { fmtPrice } from '@/utils/formatPrice';

export default function DealCard({ product, skeleton = false }) {
  // ── Skeleton branch ──────────────────────────────────────────────────────
  //  Uses the same outer class (.dc) as the real card so dimensions match
  //  exactly — the rail's height and scroll-snap behaviour are unchanged
  //  when the real content swaps in.
  //
  //  Renders as a <div> not a <Link> — skeletons aren't clickable.
  if (skeleton) {
    return (
      <div className="dc dc-skeleton" aria-hidden="true">
        <div className="dc-skeleton-img" />
        <div className="dc-skeleton-overlay">
          <div className="dc-skeleton-line" style={{ width: '80%' }} />
          <div
            className="dc-skeleton-line dc-skeleton-line-price"
            style={{ width: '50%' }}
          />
        </div>
      </div>
    );
  }

  // ── Real card ────────────────────────────────────────────────────────────
  if (!product || !product._id) return null;

  const img = product.images?.[0] || null;

  const discount = product.discountInfo?.isOnSale
    ? product.discountInfo.discountPercentage ??
      (product.discountInfo.originalPrice
        ? Math.round(
            ((product.discountInfo.originalPrice - product.price) /
              product.discountInfo.originalPrice) *
              100
          )
        : 0)
    : 0;

  return (
    <Link href={`/product/${product._id}`} className="dc">
      {img ? (
        <img src={img} alt="" loading="lazy" className="dc-img" />
      ) : (
        <div className="dc-img-ph" />
      )}

      {discount > 0 && <span className="dc-badge">-{discount}% OFF</span>}

      <div className="dc-overlay">
        <span className="dc-name">{product.name}</span>
        <span className="dc-price">{fmtPrice(product.price)}</span>
        {product.discountInfo?.originalPrice && (
          <span className="dc-orig">
            {fmtPrice(product.discountInfo.originalPrice)}
          </span>
        )}
      </div>
    </Link>
  );
}