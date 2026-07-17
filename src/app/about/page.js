// src/app/about/page.js
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

// ─── Stat Counter ──────────────────────────────────────────────────────────────
function AnimatedStat({ value, label, icon, color, delay = 0 }) {
  const [ref, vis] = useReveal(0.3);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!vis) return;
    const numValue = parseInt(value.replace(/[^0-9]/g, ''));
    const suffix = value.replace(/[0-9]/g, '');
    const duration = 1500;
    const steps = 30;
    const increment = numValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setCount(numValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [vis, value]);

  const numValue = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');

  return (
    <div ref={ref} className={`stat-card reveal ${vis ? 'shown' : ''}`} style={{ '--accent': color, transitionDelay: `${delay}ms` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={{ color }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─── Team Card ─────────────────────────────────────────────────────────────────
function TeamCard({ name, role, emoji, color, delay = 0 }) {
  const [ref, vis] = useReveal(0.2);
  return (
    <div ref={ref} className={`team-card reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="team-avatar" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
        <span>{emoji}</span>
      </div>
      <h3 className="team-name">{name}</h3>
      <p className="team-role">{role}</p>
    </div>
  );
}

// ─── Timeline Item ─────────────────────────────────────────────────────────────
function TimelineItem({ year, title, description, icon, isLast = false }) {
  const [ref, vis] = useReveal(0.2);
  return (
    <div ref={ref} className={`timeline-item reveal ${vis ? 'shown' : ''}`}>
      <div className="timeline-line">
        <div className="timeline-dot">
          <span>{icon}</span>
        </div>
        {!isLast && <div className="timeline-connector" />}
      </div>
      <div className="timeline-content">
        <span className="timeline-year">{year}</span>
        <h3 className="timeline-title">{title}</h3>
        <p className="timeline-desc">{description}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [heroRef, heroVis] = useReveal(0.05);
  const [missionRef, missionVis] = useReveal(0.15);
  const [storyRef, storyVis] = useReveal(0.15);
  const [valuesRef, valuesVis] = useReveal(0.15);
  const [teamRef, teamVis] = useReveal(0.1);
  const [ctaRef, ctaVis] = useReveal(0.1);

  return (
    <>
      <style>{aboutStyles}</style>
      
      <div className="ab-page">
        {/* ══════════════════════ HERO ══════════════════════ */}
        <section ref={heroRef} className="ab-hero">
          <div className="ab-hero-bg">
            <div className="ab-hero-orb" style={{ top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(99,102,241,.12), transparent)' }} />
            <div className="ab-hero-orb" style={{ bottom: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(16,185,129,.1), transparent)' }} />
          </div>
          
          <div className={`ab-hero-content reveal ${heroVis ? 'shown' : ''}`}>
            <div className="ab-hero-badge">
              <span className="ab-live-dot" />
              Built in Ghana, for Ghana
            </div>
            <h1 className="ab-hero-title">
              We're building the
              <span className="ab-hero-highlight"> campus economy.</span>
            </h1>
            <p className="ab-hero-subtitle">
              CediMart connects thousands of students across Ghana's universities — making it easy to buy, sell, and grow together. What started as a simple idea is now the fastest-growing student marketplace in the country.
            </p>
            <div className="ab-hero-stats-row">
              <div className="ab-hero-stat">
                <span className="ab-hero-stat-num">10K+</span>
                <span className="ab-hero-stat-lbl">Active Students</span>
              </div>
              <div className="ab-hero-stat-divider" />
              <div className="ab-hero-stat">
                <span className="ab-hero-stat-num">8</span>
                <span className="ab-hero-stat-lbl">Campuses</span>
              </div>
              <div className="ab-hero-stat-divider" />
              <div className="ab-hero-stat">
                <span className="ab-hero-stat-num">50K+</span>
                <span className="ab-hero-stat-lbl">Listings</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ MISSION ══════════════════════ */}
        <section ref={missionRef} className="ab-section">
          <div className="ab-section-inner">
            <div className={`ab-mission-grid reveal ${missionVis ? 'shown' : ''}`}>
              <div className="ab-mission-text">
                <p className="ab-eyebrow">— Our Mission</p>
                <h2 className="ab-section-title">
                  Making campus commerce
                  <span style={{ color: C.emerald }}> safe, simple, and social.</span>
                </h2>
                <p className="ab-section-desc">
                  We believe every student should have access to affordable goods and the opportunity to earn. CediMart removes the friction from campus buying and selling — no more WhatsApp groups, no more notice boards, no more uncertainty about who you're dealing with.
                </p>
                <p className="ab-section-desc">
                  Every seller is verified. Every transaction is transparent. And our AI assistant, CediAI, helps you find exactly what you need in seconds.
                </p>
              </div>
              <div className="ab-mission-cards">
                <div className="ab-mission-card" style={{ '--card-color': C.indigo }}>
                  <div className="ab-mission-card-icon">🛡️</div>
                  <h3>Trust & Safety</h3>
                  <p>Every vendor submits a national ID and student card. Verified sellers get a green badge.</p>
                </div>
                <div className="ab-mission-card" style={{ '--card-color': C.emerald }}>
                  <div className="ab-mission-card-icon">⚡</div>
                  <h3>Speed & Simplicity</h3>
                  <p>List an item in under 60 seconds. Find what you need with AI-powered search.</p>
                </div>
                <div className="ab-mission-card" style={{ '--card-color': C.amber }}>
                  <div className="ab-mission-card-icon">🤝</div>
                  <h3>Community First</h3>
                  <p>Built by students, for students. We understand campus life because we live it.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ STATS ══════════════════════ */}
        <section className="ab-stats-section">
          <div className="ab-section-inner">
            <div className="ab-stats-grid">
              <AnimatedStat value="10000+" label="Active Students" icon="👥" color={C.indigoL} delay={0} />
              <AnimatedStat value="2500+" label="Verified Businesses" icon="🏪" color={C.emerald} delay={100} />
              <AnimatedStat value="50000+" label="Total Listings" icon="📦" color={C.amber} delay={200} />
              <AnimatedStat value="8" label="Campuses" icon="🏫" color={C.coral} delay={300} />
            </div>
          </div>
        </section>

        {/* ══════════════════════ OUR STORY ══════════════════════ */}
        <section ref={storyRef} className="ab-section">
          <div className="ab-section-inner">
            <div className={`ab-story-header reveal ${storyVis ? 'shown' : ''}`}>
              <p className="ab-eyebrow">— Our Story</p>
              <h2 className="ab-section-title">
                From a hostel room
                <span style={{ color: C.amber }}> to every campus.</span>
              </h2>
              <p className="ab-section-desc" style={{ maxWidth: 600, margin: '0 auto' }}>
                The journey of CediMart — built by students who understood the struggle of buying and selling on campus.
              </p>
            </div>

            <div className="ab-timeline">
              <TimelineItem
                year="2023"
                title="The Idea"
                description="Frustrated with scattered WhatsApp groups and unreliable notice boards, a group of students at University of Ghana decided to build a better way to connect buyers and sellers on campus."
                icon="💡"
              />
              <TimelineItem
                year="Early 2024"
                title="First Launch at UG"
                description="CediMart launched at University of Ghana with 200 beta users. Within the first month, over 1,000 listings were posted and the word spread fast."
                icon="🚀"
              />
              <TimelineItem
                year="Mid 2024"
                title="Expanding to More Campuses"
                description="KNUST, UCC, and UPSA joined the platform. We introduced verified seller badges and campus-specific filtering to maintain trust as we grew."
                icon="🏫"
              />
              <TimelineItem
                year="Late 2024"
                title="CediAI is Born"
                description="We launched our AI shopping assistant — the first of its kind for a student marketplace in Ghana. Students can now search using natural language."
                icon="🤖"
              />
              <TimelineItem
                year="2025"
                title="10,000+ Students Strong"
                description="CediMart hit 10,000 active students across 8 campuses with over 50,000 total listings. We continue to build features that make campus life easier."
                icon="🎉"
                isLast
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════ VALUES ══════════════════════ */}
        <section ref={valuesRef} className="ab-section ab-values-section">
          <div className="ab-section-inner">
            <div className={`reveal ${valuesVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="ab-eyebrow">— Our Values</p>
              <h2 className="ab-section-title">
                What drives
                <span style={{ color: C.coral }}> everything we do.</span>
              </h2>
            </div>

            <div className="ab-values-grid">
              {[
                { icon: '🔒', title: 'Trust & Transparency', color: C.indigo, desc: 'Every transaction is protected. Every seller is verified. We believe trust is the foundation of any marketplace.' },
                { icon: '🌍', title: 'Made in Ghana', color: C.emerald, desc: 'Built by Ghanaian students, for Ghanaian students. We understand the unique needs of campus life in Ghana.' },
                { icon: '⚡', title: 'Speed & Innovation', color: C.amber, desc: 'From AI-powered search to instant listings, we leverage technology to make campus commerce effortless.' },
                { icon: '🤝', title: 'Community First', color: C.coral, desc: 'Every feature we build starts with a simple question: "Does this make campus life better for students?"' },
                { icon: '📈', title: 'Empowerment', color: C.indigoL, desc: 'We give students the tools to earn income and build businesses while still in school.' },
                { icon: '♻️', title: 'Sustainability', color: '#34D399', desc: 'Buying and selling pre-owned items reduces waste and makes quality goods accessible to every student.' },
              ].map((value, i) => (
                <div key={i} className={`ab-value-card reveal ${valuesVis ? 'shown' : ''}`} style={{ '--val-color': value.color, transitionDelay: `${i * 80}ms` }}>
                  <div className="ab-value-icon">{value.icon}</div>
                  <h3 className="ab-value-title">{value.title}</h3>
                  <p className="ab-value-desc">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ TEAM ══════════════════════ */}
        <section ref={teamRef} className="ab-section">
          <div className="ab-section-inner">
            <div className={`reveal ${teamVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="ab-eyebrow">— Our Team</p>
              <h2 className="ab-section-title">
                Built by students,
                <span style={{ color: C.indigoL }}> for students.</span>
              </h2>
              <p className="ab-section-desc" style={{ maxWidth: 500, margin: '0 auto' }}>
                We're a team of passionate students and recent graduates who believe in the power of community commerce.
              </p>
            </div>

            <div className="ab-team-grid">
              <TeamCard name="Prince" role="Founder & Lead Developer" emoji="👨‍💻" color={C.indigo} delay={0} />
              <TeamCard name="Design Team" role="UI/UX Designers" emoji="🎨" color={C.emerald} delay={80} />
              <TeamCard name="Campus Ambassadors" role="Community Managers" emoji="📣" color={C.amber} delay={160} />
              <TeamCard name="Support Team" role="Customer Success" emoji="💬" color={C.coral} delay={240} />
            </div>
          </div>
        </section>

        {/* ══════════════════════ CTA ══════════════════════ */}
        <section ref={ctaRef} className="ab-section">
          <div className="ab-section-inner">
            <div className={`ab-cta reveal ${ctaVis ? 'shown' : ''}`}>
              <div className="ab-cta-bg" />
              <h2 className="ab-cta-title">Ready to join the community?</h2>
              <p className="ab-cta-subtitle">
                Download the CediMart app and start buying, selling, and connecting with students across Ghana.
              </p>
              <div className="ab-cta-btns">
                <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="ab-cta-btn primary">
                  🍎 App Store
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="ab-cta-btn secondary">
                  ▶ Google Play
                </a>
              </div>
              <div className="ab-cta-links">
                <Link href="/listings">Browse Listings</Link>
                <Link href="/ai-assistant">Try CediAI</Link>
                <Link href="/">Back to Home</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const aboutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ab-page {
    background: ${C.void};
    color: ${C.white};
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
  }

  /* ── Reveal animation ── */
  .reveal {
    transition: opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1);
  }
  .reveal:not(.shown) {
    opacity: 0;
    transform: translateY(24px);
  }
  .reveal.shown {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Hero ── */
  .ab-hero {
    position: relative;
    padding: clamp(60px,10vw,120px) clamp(20px,5vw,80px);
    text-align: center;
    overflow: hidden;
  }
  .ab-hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .ab-hero-orb {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    filter: blur(80px);
  }
  .ab-hero-content {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
  }
  .ab-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${C.emerald};
    background: ${C.emeraldDim};
    border: 1px solid rgba(16,185,129,.25);
    border-radius: 40px;
    padding: 6px 16px;
    margin-bottom: 24px;
  }
  .ab-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${C.emerald};
  }
  .ab-hero-title {
    font-size: clamp(32px,5vw,64px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -1.5px;
    margin-bottom: 20px;
  }
  .ab-hero-highlight {
    display: block;
    background: linear-gradient(135deg, ${C.emerald}, ${C.indigoL});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ab-hero-subtitle {
    font-size: clamp(14px,2vw,17px);
    color: ${C.off};
    line-height: 1.7;
    max-width: 600px;
    margin: 0 auto 40px;
  }
  .ab-hero-stats-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(20px,4vw,40px);
    flex-wrap: wrap;
  }
  .ab-hero-stat {
    text-align: center;
  }
  .ab-hero-stat-num {
    display: block;
    font-size: clamp(24px,3vw,36px);
    font-weight: 900;
    color: ${C.amber};
    font-family: 'JetBrains Mono', monospace;
  }
  .ab-hero-stat-lbl {
    font-size: 12px;
    color: ${C.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .ab-hero-stat-divider {
    width: 1px;
    height: 40px;
    background: ${C.border};
  }

  /* ── Sections ── */
  .ab-section {
    padding: clamp(48px,8vw,100px) clamp(20px,5vw,80px);
  }
  .ab-section-inner {
    max-width: 1100px;
    margin: 0 auto;
  }
  .ab-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${C.muted};
    margin-bottom: 14px;
    font-family: 'JetBrains Mono', monospace;
  }
  .ab-section-title {
    font-size: clamp(24px,3.5vw,42px);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.5px;
    margin-bottom: 18px;
  }
  .ab-section-desc {
    font-size: 15px;
    color: ${C.off};
    line-height: 1.7;
    margin-bottom: 12px;
  }

  /* ── Mission ── */
  .ab-mission-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(32px,5vw,60px);
    align-items: center;
  }
  @media (max-width: 768px) {
    .ab-mission-grid {
      grid-template-columns: 1fr;
    }
  }
  .ab-mission-cards {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .ab-mission-card {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 18px;
    padding: clamp(20px,3vw,28px);
    border-left: 3px solid var(--card-color, ${C.indigo});
    transition: all .3s;
  }
  .ab-mission-card:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 24px rgba(0,0,0,.25);
  }
  .ab-mission-card-icon {
    font-size: 28px;
    margin-bottom: 10px;
  }
  .ab-mission-card h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .ab-mission-card p {
    font-size: 13px;
    color: ${C.off};
    line-height: 1.6;
  }

  /* ── Stats ── */
  .ab-stats-section {
    background: ${C.surf};
    border-top: 1px solid ${C.border};
    border-bottom: 1px solid ${C.border};
    padding: clamp(40px,6vw,70px) clamp(20px,5vw,80px);
  }
  .ab-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    max-width: 1100px;
    margin: 0 auto;
  }
  @media (max-width: 640px) {
    .ab-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .stat-card {
    text-align: center;
    padding: 24px 16px;
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 18px;
    transition: all .3s;
  }
  .stat-card:hover {
    border-color: var(--accent);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,.2);
  }
  .stat-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }
  .stat-value {
    font-size: clamp(28px,3.5vw,42px);
    font-weight: 900;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: -1px;
  }
  .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: ${C.muted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 4px;
  }

  /* ── Timeline ── */
  .ab-story-header {
    text-align: center;
    margin-bottom: 48px;
  }
  .ab-timeline {
    max-width: 700px;
    margin: 0 auto;
    position: relative;
  }
  .timeline-item {
    display: flex;
    gap: 20px;
    margin-bottom: 32px;
  }
  .timeline-item:last-child {
    margin-bottom: 0;
  }
  .timeline-line {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }
  .timeline-dot {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: ${C.surf};
    border: 2px solid ${C.indigo};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .timeline-connector {
    width: 2px;
    flex: 1;
    background: ${C.border};
    margin-top: 4px;
    min-height: 40px;
  }
  .timeline-content {
    padding-top: 6px;
  }
  .timeline-year {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    color: ${C.indigoL};
    background: ${C.indigoDim};
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 8px;
    font-family: 'JetBrains Mono', monospace;
  }
  .timeline-title {
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .timeline-desc {
    font-size: 14px;
    color: ${C.off};
    line-height: 1.6;
  }
  @media (max-width: 480px) {
    .timeline-item {
      gap: 14px;
    }
    .timeline-dot {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }
  }

  /* ── Values ── */
  .ab-values-section {
    background: ${C.surf};
    border-top: 1px solid ${C.border};
    border-bottom: 1px solid ${C.border};
  }
  .ab-values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  @media (max-width: 480px) {
    .ab-values-grid {
      grid-template-columns: 1fr;
    }
  }
  .ab-value-card {
    background: ${C.void};
    border: 1px solid ${C.border};
    border-radius: 18px;
    padding: clamp(20px,3vw,28px);
    transition: all .3s;
    border-top: 3px solid var(--val-color, ${C.indigo});
  }
  .ab-value-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,.3);
    border-color: var(--val-color, ${C.indigo})40;
  }
  .ab-value-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }
  .ab-value-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .ab-value-desc {
    font-size: 13.5px;
    color: ${C.off};
    line-height: 1.65;
  }

  /* ── Team ── */
  .ab-team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  @media (max-width: 480px) {
    .ab-team-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
  }
  .team-card {
    text-align: center;
    padding: 24px 16px;
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 18px;
    transition: all .3s;
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,.25);
  }
  .team-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
    font-size: 30px;
  }
  .team-name {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .team-role {
    font-size: 12px;
    color: ${C.muted};
    line-height: 1.4;
  }

  /* ── CTA ── */
  .ab-cta {
    background: linear-gradient(135deg, ${C.indigo} 0%, #4F46E5 50%, ${C.coral} 100%);
    border-radius: 28px;
    padding: clamp(40px,6vw,70px) clamp(24px,5vw,60px);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .ab-cta-bg {
    position: absolute;
    inset: 0;
    opacity: .04;
    background-image: radial-gradient(circle, #fff 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .ab-cta-title {
    font-size: clamp(26px,4vw,44px);
    font-weight: 900;
    color: #fff;
    margin-bottom: 14px;
    position: relative;
  }
  .ab-cta-subtitle {
    font-size: 15px;
    color: rgba(255,255,255,.7);
    max-width: 450px;
    margin: 0 auto 28px;
    line-height: 1.6;
    position: relative;
  }
  .ab-cta-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    margin-bottom: 24px;
  }
  .ab-cta-btn {
    padding: 13px 26px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
    transition: all .22s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .ab-cta-btn.primary {
    background: #fff;
    color: #000;
    box-shadow: 0 8px 24px rgba(0,0,0,.2);
  }
  .ab-cta-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,.3);
  }
  .ab-cta-btn.secondary {
    background: rgba(255,255,255,.12);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,.3);
  }
  .ab-cta-btn.secondary:hover {
    background: rgba(255,255,255,.2);
  }
  .ab-cta-links {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
  }
  .ab-cta-links a {
    color: rgba(255,255,255,.6);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: color .2s;
  }
  .ab-cta-links a:hover {
    color: #fff;
  }

  @media (max-width: 480px) {
    .ab-hero-stats-row {
      gap: 16px;
    }
    .ab-hero-stat-divider {
      display: none;
    }
    .ab-cta-btns {
      flex-direction: column;
    }
    .ab-cta-btn {
      justify-content: center;
    }
  }
`;