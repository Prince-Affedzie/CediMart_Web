// src/components/listings/Hero.jsx
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X, MapPin, ArrowUpDown, ChevronDown } from 'lucide-react';
import { HERO_SLIDES, CAMPUS_OPTIONS, SORT_OPTIONS } from '@/constants/listings/options';
import { CATEGORIES } from '@/constants/listings/categories';

// src/components/listings/Hero.jsx
// (imports unchanged)

export default function Hero({
  onPickCategory,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onClearSearch,
  campus,
  onCampusChange,
  sort,
  onSortChange,
  total,
  loading,
}) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, [paused]);

  const goTo = (i) => setSlide(((i % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length);
  const active = HERO_SLIDES[slide];

  const scrollToGrid = () => {
    document.getElementById('lp-grid-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCta = () => {
    const matched = CATEGORIES.find(
      (c) => c.key.toLowerCase().replace(/[^a-z]/g, '') === active.category.toLowerCase().replace(/[^a-z]/g, '')
    );
    onPickCategory(matched ? matched.key : '');
    scrollToGrid();
  };

  return (
    <section className="lp-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {HERO_SLIDES.map((s, i) => {
        const TagIcon = s.tagIcon;
        return (
          <div key={s.id} className={`lp-hero-slide${i === slide ? ' active' : ''}`} style={{ backgroundImage: `url(${s.image})` }}>
            <div className="lp-hero-overlay" />
            <div className="lp-hero-copy">
              <span className="lp-hero-tag"><TagIcon size={13} strokeWidth={2.5} />{s.tag}</span>
              <h1 className="lp-hero-title">{s.title}</h1>
              <p className="lp-hero-subtitle">{s.subtitle}</p>
              <button type="button" className="lp-hero-cta" onClick={handleCta}>
                {s.btnText} <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        );
      })}

      {/* ── Search dock (top-left) ──
          Compact, left-aligned, floating directly on the hero image with a
          frosted glass treatment. No surrounding card. */}
      <form className="lp-hero-search" onSubmit={onSearchSubmit}>
        <span className="lp-hero-search-icon"><Search size={17} strokeWidth={2.2} /></span>
        <input
          className="lp-hero-search-input"
          placeholder="Search laptops, textbooks, sneakers…"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          aria-label="Search listings"
        />
        {searchInput && (
          <button type="button" className="lp-hero-search-clear" onClick={onClearSearch} aria-label="Clear search">
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
        <button type="submit" className="lp-hero-search-btn">
          <Search size={15} strokeWidth={2.5} />
          <span>Search</span>
        </button>
      </form>

      {/* ── Filters dock (right side, lower) ──
          Two compact pill selects + total, dropped near the bottom edge
          of the hero on desktop. On mobile they tuck under the search bar. */}
      <div className="lp-hero-filters">
        <div className="lp-hero-select-wrap">
          <span className="lp-hero-select-icon"><MapPin size={13} strokeWidth={2.2} /></span>
          <select
            className="lp-hero-select"
            value={campus}
            onChange={(e) => onCampusChange(e.target.value)}
            aria-label="Filter by campus"
          >
            {CAMPUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="lp-hero-select-chevron"><ChevronDown size={13} strokeWidth={2.2} /></span>
        </div>

        <div className="lp-hero-select-wrap">
          <span className="lp-hero-select-icon"><ArrowUpDown size={13} strokeWidth={2.2} /></span>
          <select
            className="lp-hero-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="lp-hero-select-chevron"><ChevronDown size={13} strokeWidth={2.2} /></span>
        </div>

        {!loading && (
          <>
            <span className="lp-hero-filters-divider" />
            <span className="lp-hero-total">{total.toLocaleString()} listing{total !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>

      <button type="button" className="lp-hero-arrow lp-hero-arrow-prev" aria-label="Previous slide" onClick={() => goTo(slide - 1)}>
        <ChevronLeft size={22} />
      </button>
      <button type="button" className="lp-hero-arrow lp-hero-arrow-next" aria-label="Next slide" onClick={() => goTo(slide + 1)}>
        <ChevronRight size={22} />
      </button>

      <div className="lp-hero-dots">
        {HERO_SLIDES.map((s, i) => (
          <button key={s.id} type="button" aria-label={`Go to slide ${i + 1}`} className={`lp-hero-dot${i === slide ? ' active' : ''}`} onClick={() => goTo(i)} />
        ))}
      </div>
    </section>
  );
}