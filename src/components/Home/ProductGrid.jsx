// src/components/Home/ProductGrid.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProductsByCategory, getProductsByTag } from '@/apis/productApi';
import ProductCard from './ProductCard';

function extract(res) {
  const d = res?.data;
  const data = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];
  return Array.isArray(data) ? data : [];
}

export default function ProductGrid({
  title, subtitle, tag, category, limit = 10, seeAllHref,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const p = tag
      ? getProductsByTag(tag, { limit, sort: 'newest' })
      : getProductsByCategory(category, { limit, sort: 'newest' });
    p
      .then((res) => { if (!cancelled) setItems(extract(res).slice(0, limit)); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tag, category, limit]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="home-section" aria-label={title}>
      <div className="home-section-head">
        <div>
          <h2 className="home-section-title">{title}</h2>
          {subtitle && <p className="home-section-sub">{subtitle}</p>}
        </div>
        {seeAllHref && <Link href={seeAllHref} className="home-section-link">See all →</Link>}
      </div>

      {loading ? (
        <div className="product-grid">
          {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
            <ProductCard key={i} skeleton />
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </section>
  );
}