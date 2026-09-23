// src/components/Home/DealsRail.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getProductsByTag } from '@/apis/productApi';
import DealCard from './DealCard';

function extract(res) {
  const d = res?.data;
  const data = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];
  return Array.isArray(data) ? data : [];
}

export default function DealsRail({ tag, title, subtitle, accent, seeAllHref }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getProductsByTag(tag, { limit: 12, sort: 'newest' })
      .then((res) => { if (!cancelled) setItems(extract(res)); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tag]);

  if (!loading && items.length === 0) return null;

  const scrollBy = (dx) => scrollerRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  return (
    <section className="home-section" aria-label={title}>
      <div className="home-section-head">
        <div>
          <h2 className={`home-section-title ${accent === 'danger' ? 'is-danger' : ''}`}>{title}</h2>
          {subtitle && <p className="home-section-sub">{subtitle}</p>}
        </div>
        <div className="home-section-head-right">
          {seeAllHref && <Link href={seeAllHref} className="home-section-link">See all →</Link>}
          <div className="rail-arrows">
            <button onClick={() => scrollBy(-420)} aria-label="Previous" className="rail-arrow">‹</button>
            <button onClick={() => scrollBy(420)} aria-label="Next" className="rail-arrow">›</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="deals-rail">
          {Array.from({ length: 6 }).map((_, i) => <DealCard key={i} skeleton />)}
        </div>
      ) : (
        <div className="deals-rail" ref={scrollerRef}>
          {items.map((p) => <DealCard key={p._id} product={p} />)}
        </div>
      )}
    </section>
  );
}