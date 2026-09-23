// src/components/Home/ProductCard.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fmtPrice } from '@/utils/formatPrice';
import {
  CONDITION_MAP,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
} from './constants';

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  //  Guard: if the caller hands us nothing (or an object without an id),
  //  render nothing instead of crashing the entire grid. This is the safety
  //  net — the primary fix lives in the data source (ProductGrid / extract).
  if (!product || !product._id) return null;

  const onMove = (e) => {
    if (isMobile) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 12;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -12;
    setTilt({ x, y });
  };
  const onLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  //  `product` is now guaranteed non-null, so this reads safely.
  const img = product.images?.[0] || product.image || null;
  const cond = CONDITION_MAP[product.condition] || null;
  const CategoryIcon = CATEGORY_ICONS[product.category] || DEFAULT_CATEGORY_ICON;

  const isOnSale =
    product.discountInfo?.isOnSale &&
    product.discountInfo?.originalPrice > product.price;

  const pct = isOnSale
    ? Math.round(
        ((product.discountInfo.originalPrice - product.price) /
          product.discountInfo.originalPrice) *
          100
      )
    : null;

  //  Location: prefer the new { city, area } shape, fall back to campus for
  //  legacy listings. Anything missing just means we render no chip.
  const locationLabel =
    product.location?.area ||
    product.location?.city ||
    product.campus ||
    null;

  return (
    <Link href={`/product/${product._id}`} className="prod-card-link">
      <div
        className="prod-card"
        style={{
          animationDelay: `${index * 60}ms`,
          transform: isMobile
            ? 'none'
            : `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) ${
                hovered ? 'translateY(-6px)' : 'translateY(0)'
              }`,
          boxShadow:
            hovered && !isMobile
              ? '0 20px 50px rgba(0,0,0,.15), 0 0 0 1px rgba(13,148,136,.25)'
              : '0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05)',
        }}
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onTouchStart={() => setIsMobile(true)}
      >
        <div className="prod-img-wrap">
          {img ? (
            <img
              src={img}
              alt={product.name || 'Product'}
              className="prod-img"
              onError={(e) => {
                e.target.src =
                  'https://placehold.co/400x300/F1F5F9/94A3B8?text=No+Image';
              }}
            />
          ) : (
            <div className="prod-img-placeholder">
              <CategoryIcon size={48} strokeWidth={1.4} />
            </div>
          )}

          {isOnSale && (
            <span className="prod-badge prod-badge-sale">-{pct}%</span>
          )}
          {cond && !isOnSale && (
            <span
              className="prod-badge prod-badge-cond"
              style={{ background: cond.bg, color: cond.color }}
            >
              {cond.label}
            </span>
          )}
          {product.negotiable && (
            <span className="prod-badge prod-badge-nego">Nego.</span>
          )}

          <div
            className="prod-overlay"
            style={{ opacity: !isMobile && hovered ? 1 : 0 }}
          >
            <span className="prod-overlay-text">View listing →</span>
          </div>
        </div>

        <div className="prod-info">
          <div className="prod-meta-row">
            <span className="prod-cat">
              <CategoryIcon size={12} strokeWidth={2.2} />
              {product.category?.replace(/-/g, ' ') || 'Other'}
            </span>
            {locationLabel && (
              <span className="prod-campus">{locationLabel}</span>
            )}
          </div>
          <p className="prod-name">{product.name}</p>
          <div className="prod-foot">
            <div>
              {isOnSale && (
                <s className="prod-original">
                  {fmtPrice(product.discountInfo.originalPrice)}
                </s>
              )}
              <span
                className="prod-price"
                style={{ color: isOnSale ? '#DC2626' : '#F97316' }}
              >
                {fmtPrice(product.price)}
              </span>
            </div>
            <span className="prod-view-btn">View</span>
          </div>
        </div>
      </div>
    </Link>
  );
}