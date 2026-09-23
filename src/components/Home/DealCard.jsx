// src/components/Home/DealCard.jsx
'use client';

import Link from 'next/link';

const money = (n) => `GH₵ ${Number(n).toFixed(2)}`;

export default function DealCard({ product, skeleton }) {
  if (skeleton) {
    return <div className="dc dc-skeleton" aria-hidden="true" />;
  }

  const img = product.images?.[0];
  const discount = product.discountInfo?.isOnSale
    ? (product.discountInfo.discountPercentage
        ?? (product.discountInfo.originalPrice
          ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100)
          : 0))
    : 0;

  return (
    <Link href={`/listings/${product._id}`} className="dc">
      {img ? <img src={img} alt="" loading="lazy" className="dc-img" /> : <div className="dc-img-ph" />}
      {discount > 0 && <span className="dc-badge">-{discount}% OFF</span>}
      <div className="dc-overlay">
        <span className="dc-name">{product.name}</span>
        <span className="dc-price">{money(product.price)}</span>
        {product.discountInfo?.originalPrice && (
          <span className="dc-orig">{money(product.discountInfo.originalPrice)}</span>
        )}
      </div>
    </Link>
  );
}