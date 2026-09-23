// src/components/Home/Hero.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import GirlShopping from '@/assets/cedimartlandingpage_img_1.png';

const QUICK_FILTERS = [
  { label: 'New Arrivals', href: '/listings?sort=newest' },
  { label: 'Trending', href: '/listings?tag=popular' },
  { label: '✦ Try CediAi', href: '/ai-assistant' },
];

// Cities/locations the marketplace serves — this replaces the old
// campus-only list (UG, KNUST, UCC…) now that CediMart isn't limited to
// campuses. Extend this list as coverage grows.
const LOCATIONS = ['Accra', 'Kumasi', 'Takoradi', 'Cape Coast', 'Tamale', 'Ho'];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/listings?search=${encodeURIComponent(q)}` : '/listings');
  };

  return (
    <section className="hero-section">
      <div className="hero-bg">
        <Image
          src={GirlShopping}
          alt="Shopping on CediMart"
          fill
          priority
          sizes="100vw"
          className="hero-bg-img"
        />
        <div className="hero-bg-overlay" />
      </div>

      <div className="hero">
        <div className="hero-copy">
          <p className="hero-tag">Now shipping to cities across Ghana</p>

          <h1 className="hero-h1">What are you looking for today?</h1>

          <p className="hero-sub">
            Search thousands of listings from verified sellers — electronics,
            fashion, home goods, and everything in between.
          </p>

          <div className="hero-copy-actions">
            <form className="hero-search-row" onSubmit={handleSearch}>
              <Search size={19} strokeWidth={2} className="hero-search-icon" />
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search for accessories, fashion, electronics…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search listings"
              />
              <button type="submit" className="hero-search-btn">Search</button>
            </form>

            <div className="hero-quick-filters">
              {QUICK_FILTERS.map((f) => (
                <Link key={f.label} href={f.href} className="hero-quick-chip">{f.label}</Link>
              ))}
            </div>

            <div className="hero-trust">
              <div className="hero-rating">
                <div className="hero-stars">{'★★★★★'}</div>
                <span className="hero-trust-text"><strong>4.9</strong> / 10K+ people</span>
              </div>
              <div className="hero-location-pills">
                {LOCATIONS.map((c) => (
                  <span key={c} className="location-pill">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}