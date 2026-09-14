// src/app/page.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { getProductsByCategory, getProductsByTag } from '@/apis/productApi';
import BrowseByCategory from '@/components/Home/BrowseByCategory';
import Hero from '@/components/Home/Hero';
import Ticker from '@/components/Home/Ticker';
import StatsBar from '@/components/Home/StatsBar';
import ProductRail from '@/components/Home/ProductRail';
import WhySection from '@/components/Home/WhySection';
import AiSection from '@/components/Home/AiSection';
import CtaSection from '@/components/Home/CtaSection';
import FloatingAiButton from '@/components/Home/FloatingAiButton';
import { TAG_RAILS, CATEGORY_RAILS } from '@/components/Home/constants';
import './home.css';

// Normalizes the various response shapes the API has been seen to return
// down to a plain product array.
function extractProducts(res) {
  const d = res?.data;
  const data = d?.data?.products || d?.data?.data || d?.products || d?.data || d || [];
  return Array.isArray(data) ? data.slice(0, 10) : [];
}

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

export default function HomePage() {
  const [heroRef, heroVis] = useReveal(0.05);
  const [whyRef, whyVis] = useReveal(0.08);
  const [ctaRef, ctaVis] = useReveal(0.08);

  return (
    <div className="home-page">
      <Hero reveal={heroVis} sectionRef={heroRef} />

      <Ticker />
      <StatsBar />

      {/* ══════════════════════ BROWSE BY CATEGORY ══════════════════════ */}
      <BrowseByCategory />

      {/* ══════════════════════ TAG RAILS ══════════════════════
          getProductsByTag('urgent-sale' | 'popular' | 'new-arrival' |
          'student-favorite' | 'discounted', …) — one rail per tag, in the
          order editors would want them to compete for attention. A rail
          with no tagged products yet renders nothing. */}
      {TAG_RAILS.map((rail) => (
        <ProductRail
          key={rail.tag}
          title={rail.title}
          subtitle={rail.subtitle}
          accent={rail.accent}
          seeAllHref={`/listings?tag=${encodeURIComponent(rail.tag)}`}
          fetcher={() => getProductsByTag(rail.tag, { limit: 10, sort: 'newest' }).then(extractProducts)}
        />
      ))}

      {/* ══════════════════════ CATEGORY RAILS ══════════════════════
          getProductsByCategory(category, …) — mirrors the tag rails but
          scoped by category instead. */}
      {CATEGORY_RAILS.map((rail) => (
        <ProductRail
          key={rail.category}
          title={rail.title}
          accent={rail.accent}
          seeAllHref={`/listings?category=${encodeURIComponent(rail.category)}`}
          fetcher={() => getProductsByCategory(rail.category, { limit: 10, sort: 'newest' }).then(extractProducts)}
        />
      ))}

      <WhySection reveal={whyVis} sectionRef={whyRef} />

      <AiSection />

      <CtaSection reveal={ctaVis} sectionRef={ctaRef} />

      <FloatingAiButton />
    </div>
  );
}