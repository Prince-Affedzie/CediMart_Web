// src/components/Home/ProductRail.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

// `fetcher` is an async function that resolves to a product array. Rails
// that come back empty (no products tagged/categorized that way yet)
// render nothing rather than an empty section — the homepage should never
// show a rail with nothing in it.
export default function ProductRail({ title, subtitle, seeAllHref, accent = '#0D9488', fetcher }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetcher();
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(`Rail "${title}" fetch failed:`, err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollBy = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="rail-section">
      <div className="rail-head">
        <div>
          <h2 className="rail-title" style={{ '--rc': accent }}>{title}</h2>
          {subtitle && <p className="rail-subtitle">{subtitle}</p>}
        </div>
        <div className="rail-head-actions">
          <div className="rail-arrows">
            <button type="button" className="rail-arrow-btn" onClick={() => scrollBy(-1)} aria-label="Scroll left">
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>
            <button type="button" className="rail-arrow-btn" onClick={() => scrollBy(1)} aria-label="Scroll right">
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>
          {seeAllHref && <Link href={seeAllHref} className="rail-see-all">See all →</Link>}
        </div>
      </div>

      <div className="rail-scroller" ref={scrollerRef}>
        {loading
          ? [...Array(6)].map((_, i) => <div key={i} className="rail-item"><SkeletonCard /></div>)
          : products.map((p, i) => <div key={p._id || i} className="rail-item"><ProductCard product={p} index={i} /></div>)}
      </div>
    </section>
  );
}