// src/components/Home/FeaturedCarousel.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getProductsByTag } from '@/apis/productApi';

function extractProducts(res) {
  const d = res?.data;
  const data = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];
  return Array.isArray(data) ? data.slice(0, 6) : [];
}

const money = (n) => `GH₵ ${Number(n).toFixed(2)}`;

export default function FeaturedCarousel() {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getProductsByTag('featured', { limit: 6, sort: 'newest' })
      .then((res) => { if (!cancelled) setItems(extractProducts(res)); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  if (items.length === 0) {
    return <div className="featured-carousel-skeleton" aria-hidden="true" />;
  }

  const go = (i) => {
    setIdx(i);
    clearInterval(timerRef.current);
  };

  return (
    <section className="featured-carousel" aria-label="Featured listings">
      <div className="featured-track">
        {items.map((p, i) => {
          const active = i === idx;
          const img = p.images?.[0];
          const discount = p.discountInfo?.isOnSale
            ? (p.discountInfo.discountPercentage
                ?? (p.discountInfo.originalPrice
                  ? Math.round(((p.discountInfo.originalPrice - p.price) / p.discountInfo.originalPrice) * 100)
                  : 0))
            : 0;
          return (
            <Link
              key={p._id}
              href={`/product/${p._id}`}
              className={`featured-slide ${active ? 'is-active' : ''}`}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
            >
              {img && <img src={img} alt="" className="featured-slide-img" loading={i === 0 ? 'eager' : 'lazy'} />}
              <div className="featured-slide-scrim" />
              <div className="featured-slide-copy">
                {discount > 0 && <span className="featured-slide-tag">-{discount}% off</span>}
                <h2 className="featured-slide-title">{p.name}</h2>
                <div className="featured-slide-prices">
                  <span className="featured-slide-price">{money(p.price)}</span>
                  {p.discountInfo?.originalPrice && (
                    <span className="featured-slide-orig">{money(p.discountInfo.originalPrice)}</span>
                  )}
                </div>
                <span className="featured-slide-cta">View listing →</span>
              </div>
            </Link>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="featured-dots" role="tablist" aria-label="Featured listings">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`Slide ${i + 1}`}
              className={`featured-dot ${i === idx ? 'is-active' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}