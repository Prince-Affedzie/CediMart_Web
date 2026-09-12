// src/components/listings/ProductCard.jsx
import Link from 'next/link';
import { MapPin, Tag, Heart, Package } from 'lucide-react';
import { C } from '@/constants/listings/tokens';
import { fmtPrice } from '@/utils/formatPrice';

export default function ProductCard({ product }) {
  const img = product.images?.[0] || product.image;
  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const pct = isOnSale
    ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100)
    : null;

  return (
    <Link href={`/product/${product._id}`} className="lp-card">
      <div className="lp-card-img-wrap">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="lp-card-img"
            loading="lazy"
            onError={(e) => { e.target.src = 'https://placehold.co/400x400/F1F5F9/94A3B8?text=No+Image'; }}
          />
        ) : (
          <div className="lp-card-img-ph"><Package size={32} color={C.muted} strokeWidth={1.5} /></div>
        )}

        <div className="lp-card-badges">
          {isOnSale && <span className="lp-badge lp-badge-sale">-{pct}%</span>}
          {product.negotiable && (
            <span className="lp-badge lp-badge-nego"><Tag size={10} strokeWidth={2.5} />Negotiable</span>
          )}
        </div>

        <span className="lp-card-fav" aria-hidden="true"><Heart size={15} strokeWidth={2} /></span>

        <div className="lp-card-overlay">
          <span className="lp-card-view-btn">View details</span>
        </div>
      </div>

      <div className="lp-card-body">
        {product.campus && (
          <span className="lp-card-campus"><MapPin size={9.5} strokeWidth={2.5} />{product.campus}</span>
        )}
        <p className="lp-card-name">{product.name}</p>
        <div className="lp-card-foot">
          <span className="lp-price" style={{ color: isOnSale ? C.coral : C.white }}>{fmtPrice(product.price)}</span>
          {isOnSale && <s className="lp-original">{fmtPrice(product.discountInfo.originalPrice)}</s>}
        </div>
      </div>
    </Link>
  );
}