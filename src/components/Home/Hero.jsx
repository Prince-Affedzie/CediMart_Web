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

export default function Hero({ reveal, sectionRef }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/listings?search=${encodeURIComponent(q)}` : '/listings');
  };

  return (
    <section className="hero-section" ref={sectionRef}>
      {/* Background photo — fills the section behind everything else */}
      <div className="hero-bg">
        <Image
          src={GirlShopping}
          alt="Student shopping on CediMart"
          fill
          priority
          sizes="100vw"
          className="hero-bg-img"
        />
        <div className="hero-bg-overlay" />
      </div>

      <div className={`hero reveal ${reveal ? 'shown' : ''}`}>
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="live-dot" />
            Live across 8 campuses in Ghana
          </div>

          <h1 className="hero-h1">
            What do you need<br />
            <span className="hero-h1-line2">on campus today?</span>
          </h1>

          <p className="hero-sub">
            Search thousands of listings from verified student sellers — textbooks,
            electronics, food, fashion, and everything in between.
          </p>

          <div className="hero-copy-actions">
            <form className="hero-search-row" onSubmit={handleSearch}>
              <Search size={19} strokeWidth={2} className="hero-search-icon" />
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search for laptops, textbooks, sneakers…"
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="hero-stars">{'★★★★★'}</div>
                <span className="hero-trust-text"><strong>4.9</strong> / 10K+ students</span>
              </div>
              <div className="hero-campus-pills">
                {['UG', 'KNUST', 'UCC', 'UPSA', 'GIMPA', 'ATU'].map((c) => (
                  <span key={c} className="campus-pill">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges now sit on the photo itself rather than on a framed card */}
      <div className="hero-float-badge hero-float-badge--top">
        <span>✅</span> Verified Sellers
      </div>
      <div className="hero-float-badge hero-float-badge--bottom">
        <span>🔥</span> 500+ new listings today
      </div>
    </section>
  );
}