// src/app/download/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  void:    '#09090F',
  surf:    '#13131E',
  elev:    '#1C1C2E',
  indigo:  '#6366F1',
  indigoL: '#818CF8',
  indigoDim:'rgba(99,102,241,0.12)',
  amber:   '#F59E0B',
  amberL:  '#FCD34D',
  amberDim:'rgba(245,158,11,0.12)',
  coral:   '#F43F5E',
  coralDim:'rgba(244,63,94,0.12)',
  emerald: '#10B981',
  emeraldDim:'rgba(16,185,129,0.12)',
  white:   '#F1F0FF',
  off:     '#A8A8B8',
  muted:   '#52525B',
  border:  '#27273A',
};

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
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

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, color, delay = 0 }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} className={`dl-feature-card reveal ${vis ? 'shown' : ''}`} style={{ '--fc': color, transitionDelay: `${delay}ms` }}>
      <div className="dl-feature-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <h3 className="dl-feature-title">{title}</h3>
      <p className="dl-feature-desc">{description}</p>
    </div>
  );
}

// ─── Step Card ─────────────────────────────────────────────────────────────────
function StepCard({ number, title, description, emoji, delay = 0 }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} className={`dl-step-card reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="dl-step-number">{number}</div>
      <div className="dl-step-emoji">{emoji}</div>
      <h3 className="dl-step-title">{title}</h3>
      <p className="dl-step-desc">{description}</p>
    </div>
  );
}

// ─── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ name, campus, rating, text, emoji, delay = 0 }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} className={`dl-review-card reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="dl-review-stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div>
      <p className="dl-review-text">"{text}"</p>
      <div className="dl-review-author">
        <div className="dl-review-avatar">{emoji}</div>
        <div>
          <span className="dl-review-name">{name}</span>
          <span className="dl-review-campus">{campus}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DownloadPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const [heroRef, heroVis] = useReveal(0.05);
  const [featuresRef, featuresVis] = useReveal(0.1);
  const [stepsRef, stepsVis] = useReveal(0.1);
  const [reviewsRef, reviewsVis] = useReveal(0.1);
  const [faqRef, faqVis] = useReveal(0.1);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: '🛡️', title: 'Verified Sellers', description: 'Every seller submits a national ID and student card. Shop with confidence knowing you\'re dealing with real students.', color: C.indigo },
    { icon: '💬', title: 'In-App Chat', description: 'Message sellers directly within the app. Negotiate prices, ask questions, and arrange meet-ups without sharing your number.', color: C.emerald },
    { icon: '🤖', title: 'CediAI Assistant', description: 'Our AI shopping assistant helps you find exactly what you need. Just type what you\'re looking for in plain English.', color: C.amber },
    { icon: '📍', title: 'Campus Filtering', description: 'Filter listings by campus, hostel, or area. Find items within walking distance of your lecture hall.', color: C.coral },
    { icon: '🔔', title: 'Price Alerts', description: 'Save products and get notified when prices drop. Never miss a deal on the items you want.', color: C.indigoL },
    { icon: '📊', title: 'Sell & Earn', description: 'List items in under 60 seconds. Track views, manage listings, and grow your side hustle while in school.', color: '#34D399' },
  ];

  const steps = [
    { number: '01', title: 'Download the App', description: 'Get CediMart from the App Store or Google Play. It\'s free and takes less than a minute.', emoji: '📲' },
    { number: '02', title: 'Create Your Account', description: 'Sign up with your school email and verify your identity with your student ID card.', emoji: '✍️' },
    { number: '03', title: 'Start Exploring', description: 'Browse listings, chat with sellers, or list your first item. Your campus marketplace is ready!', emoji: '🚀' },
  ];

  const reviews = [
    { name: 'Akua S.', campus: 'University of Ghana', rating: 5, text: 'CediMart made Hall Week shopping so easy! Found a beautiful dress from a seller in my own hall. The chat feature is seamless.', emoji: '👩🏾' },
    { name: 'Kofi M.', campus: 'KNUST', rating: 5, text: 'Sold my old textbooks in 2 days. The listing process is super fast and I got paid directly. Way better than WhatsApp groups!', emoji: '👨🏾' },
    { name: 'Ama D.', campus: 'UCC', rating: 5, text: 'CediAI helped me find a laptop within my budget in seconds. I didn\'t even know there were so many options on campus!', emoji: '👩🏾' },
    { name: 'Yaw B.', campus: 'UPSA', rating: 4, text: 'Great app for student entrepreneurs. I\'ve built a small phone accessories business just by listing on CediMart.', emoji: '👨🏾' },
  ];

  const faqs = [
    { q: 'Is CediMart really free?', a: 'Yes! CediMart is completely free to download and use. There are no hidden fees for buyers or sellers.' },
    { q: 'Which campuses are supported?', a: 'CediMart is available at 8 campuses: UG, KNUST, UCC, UPSA, GIMPA, ATU, UEW, and Ashesi. We\'re expanding soon!' },
    { q: 'How do sellers get verified?', a: 'Sellers submit their national ID and student card. Our team reviews each submission — verified sellers get a green badge.' },
    { q: 'Is my personal information safe?', a: 'Absolutely. Your phone number and email are never shared with other users unless you choose to share them. All chat happens in-app.' },
  ];

  return (
    <>
      <style>{downloadStyles}</style>

      <div className="dl-page">
        {/* ══════════════════════ HERO ══════════════════════ */}
        <section ref={heroRef} className="dl-hero">
          <div className="dl-hero-bg">
            <div className="dl-hero-orb" style={{ top: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(99,102,241,.12), transparent)' }} />
            <div className="dl-hero-orb" style={{ bottom: '-15%', left: '-5%', background: 'radial-gradient(circle, rgba(16,185,129,.1), transparent)' }} />
            <div className="dl-hero-grid-pattern" />
          </div>

          <div className={`dl-hero-content reveal ${heroVis ? 'shown' : ''}`}>
            <div className="dl-hero-badge">
              <span className="dl-hero-badge-dot" />
              Free forever — no hidden fees
            </div>
            <h1 className="dl-hero-title">
              Your campus in
              <span className="dl-hero-highlight"> your pocket.</span>
            </h1>
            <p className="dl-hero-subtitle">
              Download CediMart and join 10,000+ students buying, selling, and connecting across Ghana's top universities.
            </p>

            {/* Download Buttons */}
            <div className="dl-hero-btns">
              <a
                href="https://apps.apple.com/us/app/cedimart/id6762318566"
                target="_blank"
                rel="noopener noreferrer"
                className="dl-hero-btn dl-btn-ios"
              >
                <span className="dl-btn-icon">🍎</span>
                <div className="dl-btn-text">
                  <span className="dl-btn-label">Download on the</span>
                  <span className="dl-btn-store">App Store</span>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.freshyfood.factory"
                target="_blank"
                rel="noopener noreferrer"
                className="dl-hero-btn dl-btn-android"
              >
                <span className="dl-btn-icon">▶</span>
                <div className="dl-btn-text">
                  <span className="dl-btn-label">Get it on</span>
                  <span className="dl-btn-store">Google Play</span>
                </div>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="dl-hero-trust">
              <div className="dl-trust-item">
                <span className="dl-trust-stars">★★★★★</span>
                <span className="dl-trust-text">4.9 rating</span>
              </div>
              <div className="dl-trust-divider" />
              <div className="dl-trust-item">
                <span className="dl-trust-num">10K+</span>
                <span className="dl-trust-text">Downloads</span>
              </div>
              <div className="dl-trust-divider" />
              <div className="dl-trust-item">
                <span className="dl-trust-icon">🇬🇭</span>
                <span className="dl-trust-text">Made in Ghana</span>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="dl-hero-phone">
            <div className="dl-phone-frame">
              <div className="dl-phone-notch" />
              <div className="dl-phone-screen">
                <div className="dl-phone-app-icon">C</div>
                <div className="dl-phone-app-name">CediMart</div>
                <div className="dl-phone-preview-grid">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="dl-phone-preview-item" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="dl-phone-preview-img" />
                      <div className="dl-phone-preview-line" style={{ width: `${60 + Math.random() * 30}%` }} />
                      <div className="dl-phone-preview-line short" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ FEATURES ══════════════════════ */}
        <section ref={featuresRef} className="dl-section">
          <div className="dl-section-inner">
            <div className={`reveal ${featuresVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="dl-eyebrow">— Why CediMart</p>
              <h2 className="dl-section-title">
                Everything you need
                <span style={{ color: C.emerald }}> in one app.</span>
              </h2>
              <p className="dl-section-sub">
                CediMart isn't just a marketplace — it's your complete campus commerce toolkit.
              </p>
            </div>

            <div className="dl-features-grid">
              {features.map((f, i) => (
                <FeatureCard key={i} {...f} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
        <section ref={stepsRef} className="dl-section dl-steps-section">
          <div className="dl-section-inner">
            <div className={`reveal ${stepsVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="dl-eyebrow">— Get Started</p>
              <h2 className="dl-section-title">
                Three simple steps
                <span style={{ color: C.amber }}> to get going.</span>
              </h2>
            </div>

            <div className="dl-steps-grid">
              {steps.map((s, i) => (
                <StepCard key={i} {...s} delay={i * 120} />
              ))}
              <div className="dl-steps-connector" />
            </div>
          </div>
        </section>

        {/* ══════════════════════ REVIEWS ══════════════════════ */}
        <section ref={reviewsRef} className="dl-section">
          <div className="dl-section-inner">
            <div className={`reveal ${reviewsVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 40 }}>
              <p className="dl-eyebrow">— Testimonials</p>
              <h2 className="dl-section-title">
                Loved by students
                <span style={{ color: C.coral }}> across Ghana.</span>
              </h2>
            </div>

            <div className="dl-reviews-grid">
              {reviews.map((r, i) => (
                <ReviewCard key={i} {...r} delay={i * 100} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ FAQ ══════════════════════ */}
        <section ref={faqRef} className="dl-section dl-faq-section">
          <div className="dl-section-inner">
            <div className={`reveal ${faqVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 36 }}>
              <p className="dl-eyebrow">— FAQ</p>
              <h2 className="dl-section-title">
                Quick answers to
                <span style={{ color: C.indigoL }}> common questions.</span>
              </h2>
            </div>

            <div className="dl-faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className={`dl-faq-item ${activeFaq === i ? 'open' : ''}`}>
                  <button className="dl-faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    <span className="dl-faq-arrow">▼</span>
                  </button>
                  <div className="dl-faq-a">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ BOTTOM CTA ══════════════════════ */}
        <section className="dl-section">
          <div className="dl-section-inner">
            <div className="dl-bottom-cta">
              <div className="dl-bottom-cta-pattern" />
              <div className="dl-bottom-cta-glow" />
              <h2 className="dl-bottom-cta-title">Ready to get started?</h2>
              <p className="dl-bottom-cta-sub">
                Download CediMart now and discover why 10,000+ students trust us for campus buying and selling.
              </p>
              <div className="dl-bottom-cta-btns">
                <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="dl-bottom-btn white">
                  🍎 Download for iOS
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="dl-bottom-btn ghost">
                  ▶ Download for Android
                </a>
              </div>
              <div className="dl-bottom-links">
                <Link href="/listings">Browse Web Version →</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const downloadStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .dl-page {
    background: ${C.void};
    color: ${C.white};
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
  }

  .reveal {
    transition: opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1);
  }
  .reveal:not(.shown) { opacity: 0; transform: translateY(24px); }
  .reveal.shown { opacity: 1; transform: translateY(0); }

  /* ── Hero ── */
  .dl-hero {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(32px,5vw,60px);
    align-items: center;
    padding: clamp(60px,10vw,120px) clamp(20px,5vw,80px);
    max-width: 1280px;
    margin: 0 auto;
    overflow: hidden;
  }
  @media (max-width: 900px) {
    .dl-hero {
      grid-template-columns: 1fr;
      text-align: center;
    }
    .dl-hero-phone { display: none !important; }
  }
  .dl-hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .dl-hero-orb {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    filter: blur(100px);
  }
  .dl-hero-grid-pattern {
    position: absolute;
    inset: 0;
    opacity: .03;
    background-image: radial-gradient(circle, #fff 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .dl-hero-content {
    position: relative;
    z-index: 2;
  }
  .dl-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: ${C.emerald};
    background: ${C.emeraldDim};
    border: 1px solid rgba(16,185,129,.25);
    border-radius: 40px;
    padding: 6px 16px;
    margin-bottom: 24px;
  }
  .dl-hero-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${C.emerald};
  }
  .dl-hero-title {
    font-size: clamp(36px,5.5vw,72px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 18px;
  }
  .dl-hero-highlight {
    display: block;
    background: linear-gradient(135deg, ${C.emerald}, ${C.indigoL});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .dl-hero-subtitle {
    font-size: clamp(14px,2vw,17px);
    color: ${C.off};
    line-height: 1.7;
    max-width: 480px;
    margin-bottom: 32px;
  }
  @media (max-width: 900px) {
    .dl-hero-subtitle { margin-left: auto; margin-right: auto; }
  }

  /* Download buttons */
  .dl-hero-btns {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 36px;
  }
  @media (max-width: 900px) {
    .dl-hero-btns { justify-content: center; }
  }
  @media (max-width: 480px) {
    .dl-hero-btns { flex-direction: column; }
  }
  .dl-hero-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 14px 24px;
    border-radius: 16px;
    text-decoration: none;
    transition: all .25s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .dl-btn-ios {
    background: #fff;
    color: #000;
    box-shadow: 0 8px 28px rgba(0,0,0,.25);
  }
  .dl-btn-ios:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 36px rgba(0,0,0,.35);
  }
  .dl-btn-android {
    background: rgba(255,255,255,.08);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,.2);
    backdrop-filter: blur(10px);
  }
  .dl-btn-android:hover {
    background: rgba(255,255,255,.14);
    transform: translateY(-3px);
  }
  .dl-btn-icon { font-size: 28px; flex-shrink: 0; }
  .dl-btn-text { display: flex; flex-direction: column; text-align: left; }
  .dl-btn-label { font-size: 11px; opacity: .7; font-weight: 500; }
  .dl-btn-store { font-size: 17px; font-weight: 800; letter-spacing: -.3px; }

  /* Trust row */
  .dl-hero-trust {
    display: flex;
    align-items: center;
    gap: clamp(16px,3vw,24px);
    flex-wrap: wrap;
  }
  @media (max-width: 900px) {
    .dl-hero-trust { justify-content: center; }
  }
  .dl-trust-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .dl-trust-stars { color: ${C.amber}; font-size: 13px; letter-spacing: 1px; }
  .dl-trust-num { font-size: 16px; font-weight: 800; color: ${C.white}; font-family: 'JetBrains Mono', monospace; }
  .dl-trust-icon { font-size: 18px; }
  .dl-trust-text { font-size: 11px; color: ${C.muted}; font-weight: 600; }
  .dl-trust-divider {
    width: 1px; height: 32px;
    background: ${C.border};
  }

  /* Phone mockup */
  .dl-hero-phone {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
  }
  .dl-phone-frame {
    width: 260px;
    height: 520px;
    background: ${C.surf};
    border: 3px solid ${C.border};
    border-radius: 36px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 30px 60px rgba(0,0,0,.5), 0 0 0 1px ${C.border}80;
  }
  .dl-phone-notch {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 24px;
    background: ${C.void};
    border-radius: 12px;
    z-index: 3;
  }
  .dl-phone-screen {
    padding: 52px 16px 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .dl-phone-app-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL});
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 900;
    color: #fff;
    margin-bottom: 8px;
  }
  .dl-phone-app-name {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }
  .dl-phone-preview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: 100%;
  }
  .dl-phone-preview-item {
    animation: phoneFadeIn .6s ease forwards;
    opacity: 0;
  }
  .dl-phone-preview-img {
    aspect-ratio: 1;
    background: ${C.elev};
    border-radius: 10px;
    margin-bottom: 6px;
  }
  .dl-phone-preview-line {
    height: 6px;
    background: ${C.elev};
    border-radius: 3px;
    margin-bottom: 4px;
  }
  .dl-phone-preview-line.short {
    width: 40% !important;
  }
  @keyframes phoneFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Sections ── */
  .dl-section {
    padding: clamp(48px,8vw,100px) clamp(20px,5vw,80px);
  }
  .dl-section-inner {
    max-width: 1100px;
    margin: 0 auto;
  }
  .dl-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: ${C.muted};
    margin-bottom: 14px;
    font-family: 'JetBrains Mono', monospace;
  }
  .dl-section-title {
    font-size: clamp(24px,3.5vw,42px);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -.5px;
    margin-bottom: 14px;
  }
  .dl-section-sub {
    font-size: 15px;
    color: ${C.off};
    max-width: 500px;
    margin: 0 auto;
  }

  /* ── Features ── */
  .dl-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  @media (max-width: 480px) {
    .dl-features-grid { grid-template-columns: 1fr; }
  }
  .dl-feature-card {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 20px;
    padding: clamp(20px,3vw,28px);
    transition: all .3s;
    border-top: 3px solid var(--fc, ${C.indigo});
  }
  .dl-feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,.3);
  }
  .dl-feature-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 16px;
  }
  .dl-feature-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .dl-feature-desc {
    font-size: 13.5px;
    color: ${C.off};
    line-height: 1.65;
  }

  /* ── Steps ── */
  .dl-steps-section {
    background: ${C.surf};
    border-top: 1px solid ${C.border};
    border-bottom: 1px solid ${C.border};
  }
  .dl-steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    position: relative;
  }
  @media (max-width: 640px) {
    .dl-steps-grid { grid-template-columns: 1fr; max-width: 350px; margin: 0 auto; }
  }
  .dl-step-card {
    text-align: center;
    padding: 28px 20px;
    background: ${C.void};
    border: 1px solid ${C.border};
    border-radius: 20px;
    position: relative;
    z-index: 1;
    transition: all .3s;
  }
  .dl-step-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,.25);
  }
  .dl-step-number {
    font-size: 12px;
    font-weight: 800;
    color: ${C.indigoL};
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 12px;
  }
  .dl-step-emoji {
    font-size: 40px;
    margin-bottom: 14px;
  }
  .dl-step-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .dl-step-desc {
    font-size: 13px;
    color: ${C.off};
    line-height: 1.6;
  }

  /* ── Reviews ── */
  .dl-reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
  @media (max-width: 480px) {
    .dl-reviews-grid { grid-template-columns: 1fr; }
  }
  .dl-review-card {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 20px;
    padding: clamp(20px,3vw,24px);
    transition: all .3s;
  }
  .dl-review-card:hover {
    border-color: ${C.amber};
    box-shadow: 0 8px 24px rgba(0,0,0,.2);
  }
  .dl-review-stars {
    color: ${C.amber};
    font-size: 14px;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .dl-review-text {
    font-size: 14px;
    color: ${C.off};
    line-height: 1.65;
    margin-bottom: 16px;
    font-style: italic;
  }
  .dl-review-author {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dl-review-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: ${C.elev};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  .dl-review-name {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: ${C.white};
  }
  .dl-review-campus {
    font-size: 11px;
    color: ${C.muted};
  }

  /* ── FAQ ── */
  .dl-faq-section {
    background: ${C.surf};
    border-top: 1px solid ${C.border};
    border-bottom: 1px solid ${C.border};
  }
  .dl-faq-list {
    max-width: 650px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .dl-faq-item {
    background: ${C.void};
    border: 1px solid ${C.border};
    border-radius: 14px;
    overflow: hidden;
  }
  .dl-faq-q {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 20px;
    background: none;
    border: none;
    color: ${C.white};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    text-align: left;
    transition: background .2s;
  }
  .dl-faq-q:hover { background: ${C.elev}; }
  .dl-faq-arrow {
    font-size: 10px;
    color: ${C.muted};
    transition: transform .3s;
    flex-shrink: 0;
  }
  .dl-faq-item.open .dl-faq-arrow { transform: rotate(180deg); color: ${C.emerald}; }
  .dl-faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height .35s ease, padding .35s ease;
  }
  .dl-faq-item.open .dl-faq-a {
    max-height: 200px;
    padding: 0 20px 16px;
  }
  .dl-faq-a p {
    font-size: 13.5px;
    color: ${C.off};
    line-height: 1.7;
  }

  /* ── Bottom CTA ── */
  .dl-bottom-cta {
    background: linear-gradient(135deg, ${C.indigo} 0%, #4F46E5 50%, ${C.coral} 100%);
    border-radius: 28px;
    padding: clamp(40px,6vw,70px) clamp(24px,5vw,60px);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .dl-bottom-cta-pattern {
    position: absolute;
    inset: 0;
    opacity: .04;
    background-image: radial-gradient(circle, #fff 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .dl-bottom-cta-glow {
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: rgba(255,255,255,.05);
    filter: blur(80px);
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }
  .dl-bottom-cta-title {
    font-size: clamp(26px,4vw,44px);
    font-weight: 900;
    color: #fff;
    margin-bottom: 12px;
    position: relative;
  }
  .dl-bottom-cta-sub {
    font-size: 15px;
    color: rgba(255,255,255,.7);
    max-width: 440px;
    margin: 0 auto 28px;
    line-height: 1.6;
    position: relative;
  }
  .dl-bottom-cta-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
  }
  @media (max-width: 480px) {
    .dl-bottom-cta-btns { flex-direction: column; }
  }
  .dl-bottom-btn {
    padding: 14px 28px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
    transition: all .22s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .dl-bottom-btn.white {
    background: #fff;
    color: #000;
    box-shadow: 0 8px 28px rgba(0,0,0,.2);
  }
  .dl-bottom-btn.white:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(0,0,0,.3);
  }
  .dl-bottom-btn.ghost {
    background: rgba(255,255,255,.12);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,.3);
  }
  .dl-bottom-btn.ghost:hover { background: rgba(255,255,255,.2); }
  .dl-bottom-links {
    margin-top: 24px;
    position: relative;
  }
  .dl-bottom-links a {
    color: rgba(255,255,255,.6);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: color .2s;
  }
  .dl-bottom-links a:hover { color: #fff; }
`;