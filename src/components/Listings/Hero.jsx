// src/components/listings/Hero.jsx
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_SLIDES } from '@/constants/listings/options';
import { CATEGORIES } from '@/constants/listings/categories';

export default function Hero({ onPickCategory }) {
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