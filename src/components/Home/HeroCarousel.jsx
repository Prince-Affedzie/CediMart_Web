// src/components/Home/HeroCarousel.jsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import './HeroCarousel.css';

//  Hero slides — each one is a fully-designed flyer. No text overlays,
//  no CTAs, no product data. The image IS the message.
const SLIDES = [
  {
    src: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1790335121/hero_flyer_1_1_ney3mo.png',
    alt: 'CediMart promo',
    href: '/listings',
  },
  {
    src: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1790335131/hero_flyer_2_1_av33wr.png',
    alt: 'CediMart promo',
    href: '/listings?sort=newest',
  },
  {
    src: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1790335211/hero_flyer_3_1_lrktad.png',
    alt: 'CediMart promo',
    href: '/listings?tag=popular',
  },
  {
    src: 'https://res.cloudinary.com/duv3qvvjz/image/upload/v1790335121/hero_flyer_4_1_elq4l8.png',
    alt: 'CediMart promo',
    href: '/listings?tag=urgent-sale',
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-advance. Pauses when the user interacts (hover, focus, touch).
  useEffect(() => {
    if (paused || SLIDES.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  // Keyboard navigation — left/right arrows move between slides.
  const go = useCallback((i) => {
    setIdx(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') go(idx + 1);
    else if (e.key === 'ArrowLeft') go(idx - 1);
  };

  if (SLIDES.length === 0) return null;

  return (
    <section
      className="hero-carousel"
      aria-label="Promotions"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="hero-track">
        {SLIDES.map((slide, i) => {
          const active = i === idx;
          return (
            <a
              key={slide.src}
              href={slide.href}
              className={`hero-slide ${active ? 'is-active' : ''}`}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="hero-slide-img"
                // First slide eager so it's part of the initial paint;
                // the rest lazy so they don't compete for bandwidth.
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchpriority={i === 0 ? 'high' : 'low'}
              />
            </a>
          );
        })}
      </div>

      {SLIDES.length > 1 && (
        <>
          {/* Prev / next arrows — hidden on small screens via CSS */}
          <button
            type="button"
            className="hero-arrow hero-arrow-prev"
            onClick={() => go(idx - 1)}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="hero-arrow hero-arrow-next"
            onClick={() => go(idx + 1)}
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="hero-dots" role="tablist" aria-label="Slides">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`Go to slide ${i + 1}`}
                className={`hero-dot ${i === idx ? 'is-active' : ''}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}