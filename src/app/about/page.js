// src/app/about/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield, MessageCircle, Bot, MapPin, Bell, TrendingUp,
  Download, Apple, Play, Star, ChevronDown, Smartphone,
  PenLine, Rocket, Users, Heart, Video, ShoppingBag,
  Sparkles, Globe, Store, Radio,
} from 'lucide-react';

// ─── Design Tokens (unchanged) ─────────────────────────────────────────────
const C = {
  void:        '#F8FAFC',
  surf:        '#FFFFFF',
  elev:        '#F1F5F9',
  border:      '#E2E8F0',
  brand:       '#0D9488',
  brandL:      '#14B8A6',
  brandD:      '#0F766E',
  brandBg:     '#F0FDFA',
  brandBorder: '#99F6E4',
  accent:      '#F97316',
  accentBg:    '#FFF7ED',
  accentBorder:'#FED7AA',
  success:     '#059669',
  successBg:   '#ECFDF5',
  danger:      '#DC2626',
  dangerBg:    '#FEF2F2',
  dangerBorder:'#FECACA',
  info:        '#0284C7',
  infoBg:      '#F0F9FF',
  white:       '#0F172A',
  off:         '#475569',
  muted:       '#94A3B8',
};

// ─── Scroll-reveal hook ────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function AnimatedStat({ value, label, icon, color, delay = 0 }) {
  const [ref, vis] = useReveal(0.3);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!vis) return;
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    const duration = 1500;
    const steps = 30;
    const increment = numValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) { setCount(numValue); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [vis, value]);

  return (
    <div
      ref={ref}
      className={`stat-card reveal ${vis ? 'shown' : ''}`}
      style={{ '--accent': color, transitionDelay: `${delay}ms` }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={{ color }}>
        {count.toLocaleString()}{value.replace(/[0-9]/g, '')}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function TeamCard({ name, role, emoji, color, delay = 0 }) {
  const [ref, vis] = useReveal(0.2);
  return (
    <div
      ref={ref}
      className={`team-card reveal ${vis ? 'shown' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="team-avatar"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      >
        <span>{emoji}</span>
      </div>
      <h3 className="team-name">{name}</h3>
      <p className="team-role">{role}</p>
    </div>
  );
}

function TimelineItem({ year, title, description, icon, isLast = false }) {
  const [ref, vis] = useReveal(0.2);
  return (
    <div ref={ref} className={`timeline-item reveal ${vis ? 'shown' : ''}`}>
      <div className="timeline-line">
        <div className="timeline-dot"><span>{icon}</span></div>
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

export default function AboutPage() {
  const [heroRef, heroVis] = useReveal(0.05);
  const [missionRef, missionVis] = useReveal(0.15);
  const [featuresRef, featuresVis] = useReveal(0.15);
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
            <div
              className="ab-hero-orb"
              style={{ top: '-20%', left: '-10%', background: `radial-gradient(circle, rgba(13,148,136,.08), transparent)` }}
            />
            <div
              className="ab-hero-orb"
              style={{ bottom: '-10%', right: '-5%', background: `radial-gradient(circle, rgba(249,115,22,.06), transparent)` }}
            />
          </div>

          <div className={`ab-hero-content reveal ${heroVis ? 'shown' : ''}`}>
            <div className="ab-hero-badge">
              <span className="ab-live-dot" />
              Social commerce · Made in Ghana
            </div>
            <h1 className="ab-hero-title">
              A marketplace built
              <span className="ab-hero-highlight"> around trust.</span>
            </h1>
            <p className="ab-hero-subtitle">
              CediMart connects buyers and sellers across Ghana — with video-first
              discovery, in-app chat, verified vendors, and tools that help
              businesses grow a real audience.
            </p>
            <div className="ab-hero-stats-row">
              <div className="ab-hero-stat">
                <span className="ab-hero-stat-num">10K+</span>
                <span className="ab-hero-stat-lbl">Active Buyers</span>
              </div>
              <div className="ab-hero-stat-divider" />
              <div className="ab-hero-stat">
                <span className="ab-hero-stat-num">2.5K+</span>
                <span className="ab-hero-stat-lbl">Verified Vendors</span>
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
                  Commerce in Ghana should feel
                  <span style={{ color: C.brand }}> as social as it is safe.</span>
                </h2>
                <p className="ab-section-desc">
                  We started CediMart because buying and selling in Ghana was
                  scattered across WhatsApp groups, Instagram DMs, and
                  unverified marketplaces. Sellers had no way to build trust.
                  Buyers had no way to know who was real.
                </p>
                <p className="ab-section-desc">
                  So we built something different: a marketplace where discovery
                  happens through video, conversations happen inside the app,
                  sellers are ID-verified, and every transaction has a paper trail.
                </p>
              </div>

              <div className="ab-mission-cards">
                <div className="ab-mission-card" style={{ '--card-color': C.brand }}>
                  <div className="ab-mission-card-icon">🛡️</div>
                  <h3>Trust by default</h3>
                  <p>Every vendor is ID-verified. Verified shops carry a green badge buyers can rely on.</p>
                </div>
                <div className="ab-mission-card" style={{ '--card-color': C.accent }}>
                  <div className="ab-mission-card-icon">🎥</div>
                  <h3>Video-first discovery</h3>
                  <p>Shop the way you scroll — see products in real videos from real sellers, not stock photos.</p>
                </div>
                <div className="ab-mission-card" style={{ '--card-color': C.success }}>
                  <div className="ab-mission-card-icon">💬</div>
                  <h3>Conversations, not dead ends</h3>
                  <p>Chat directly with sellers inside CediMart. Ask questions, negotiate, and track every reply.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ STATS ══════════════════════ */}
        <section className="ab-stats-section">
          <div className="ab-section-inner">
            <div className="ab-stats-grid">
              <AnimatedStat value="10000+" label="Active Buyers" icon="👥" color={C.brandL} delay={0} />
              <AnimatedStat value="2500+" label="Verified Vendors" icon="🏪" color={C.success} delay={100} />
              <AnimatedStat value="50000+" label="Total Listings" icon="📦" color={C.accent} delay={200} />
              <AnimatedStat value="12" label="Cities Covered" icon="📍" color={C.danger} delay={300} />
            </div>
          </div>
        </section>

        {/* ══════════════════════ WHAT YOU CAN DO ══════════════════════ */}
        <section ref={featuresRef} className="ab-section ab-features-section">
          <div className="ab-section-inner">
            <div className={`reveal ${featuresVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="ab-eyebrow">— What You Can Do</p>
              <h2 className="ab-section-title">
                One platform,
                <span style={{ color: C.accent }}> five ways to earn.</span>
              </h2>
            </div>

            <div className="ab-features-grid">
              {[
                {
                  icon: <ShoppingBag size={22} strokeWidth={2.2} />,
                  title: 'Shop from anyone, anywhere in Ghana',
                  desc: 'Browse thousands of listings from verified vendors. Filter by category, city, condition, price — or just search in plain language with CediAi.',
                  color: C.brand,
                },
                {
                  icon: <Video size={22} strokeWidth={2.2} />,
                  title: 'Discover through video',
                  desc: 'Sellers post short product videos that show exactly what you\'re buying. Watch, tap, chat, and buy — all without leaving CediMart.',
                  color: C.accent,
                },
                {
                  icon: <MessageCircle size={22} strokeWidth={2.2} />,
                  title: 'Chat with sellers in-app',
                  desc: 'No more WhatsApp numbers that change or DMs that get buried. Ask questions, negotiate, and confirm details — the entire conversation lives on CediMart.',
                  color: C.success,
                },
                {
                  icon: <Bot size={22} strokeWidth={2.2} />,
                  title: 'Search with CediAi',
                  desc: 'Type "find me a laptop under GH₵3,000 in Kumasi" and CediAi surfaces the best matching listings with prices, conditions, and locations.',
                  color: C.brandL,
                },
                {
                  icon: <Users size={22} strokeWidth={2.2} />,
                  title: 'Build a real audience',
                  desc: 'Vendors get a shop page, followers, and a following — not just anonymous listings. Build a brand people come back to.',
                  color: C.danger,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className={`ab-feature-card reveal ${featuresVis ? 'shown' : ''}`}
                  style={{ '--feat-color': f.color, transitionDelay: `${i * 80}ms` }}
                >
                  <div className="ab-feature-icon" style={{ color: f.color }}>
                    {f.icon}
                  </div>
                  <h3 className="ab-feature-title">{f.title}</h3>
                  <p className="ab-feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ OUR STORY ══════════════════════ */}
        <section ref={storyRef} className="ab-section">
          <div className="ab-section-inner">
            <div className={`ab-story-header reveal ${storyVis ? 'shown' : ''}`}>
              <p className="ab-eyebrow">— Our Story</p>
              <h2 className="ab-section-title">
                From one campus
                <span style={{ color: C.accent }}> to a national platform.</span>
              </h2>
            </div>

            <div className="ab-timeline">
              {[
                {
                  year: '2023',
                  title: 'A problem worth solving',
                  description:
                    'Trading between students meant scattered WhatsApp groups, unreliable notice boards, and endless back-and-forth. A group of students at University of Ghana decided to build something better.',
                  icon: '💡',
                },
                {
                  year: 'Early 2024',
                  title: 'First launch',
                  description:
                    'CediMart launched at UG with 200 beta users. Within the first month, over 1,000 listings were posted — mostly textbooks, laptops, and hostel supplies.',
                  icon: '🚀',
                },
                {
                  year: 'Mid 2024',
                  title: 'Beyond one campus',
                  description:
                    'As sellers started shipping outside their campus, we realized the demand was national, not campus-bound. We added city-level filtering and ID verification.',
                  icon: '📍',
                },
                {
                  year: 'Late 2024',
                  title: 'CediAi and video discovery',
                  description:
                    'We launched our AI shopping assistant and began rolling out video-first listings — the first of their kind for a Ghanaian marketplace.',
                  icon: '🤖',
                },
                {
                  year: '2025',
                  title: 'A national social commerce platform',
                  description:
                    'CediMart now serves buyers and sellers across 12 cities in Ghana, with over 50,000 listings, in-app chat, and audience tools for vendors.',
                  icon: '🇬🇭',
                  isLast: true,
                },
              ].map((item, i) => (<TimelineItem key={i} {...item} />))}
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
                <span style={{ color: C.accent }}> everything we do.</span>
              </h2>
            </div>

            <div className="ab-values-grid">
              {[
                {
                  icon: '🔒',
                  title: 'Trust & transparency',
                  color: C.brand,
                  desc: 'Every seller is ID-verified. Every transaction is logged. Buyers can see who they\'re dealing with before they commit.',
                },
                {
                  icon: '🇬🇭',
                  title: 'Made in Ghana',
                  color: C.success,
                  desc: 'Built by Ghanaians, for Ghana. We understand local commerce — mobile money, meetups, marketplaces — because we live it.',
                },
                {
                  icon: '⚡',
                  title: 'Speed & simplicity',
                  color: C.accent,
                  desc: 'From AI-powered search to a listing flow under 60 seconds, we remove friction at every step.',
                },
                {
                  icon: '🤝',
                  title: 'Community first',
                  color: C.danger,
                  desc: 'Every feature starts with one question: does this make life easier for buyers and sellers in Ghana?',
                },
                {
                  icon: '📈',
                  title: 'Empowerment',
                  color: C.brandL,
                  desc: 'We give small businesses the tools to reach customers, build a following, and grow without needing a physical store.',
                },
                {
                  icon: '♻️',
                  title: 'Sustainability',
                  color: '#14B8A6',
                  desc: 'Buying pre-owned extends the life of products, reduces waste, and keeps quality goods affordable.',
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className={`ab-value-card reveal ${valuesVis ? 'shown' : ''}`}
                  style={{ '--val-color': value.color, transitionDelay: `${i * 80}ms` }}
                >
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
                The people behind
                <span style={{ color: C.brandL }}> CediMart.</span>
              </h2>
            </div>

            <div className="ab-team-grid">
              <TeamCard name="Prince" role="Founder & Lead Developer" emoji="👨‍💻" color={C.brand} delay={0} />
              <TeamCard name="Design Team" role="UI/UX Designers" emoji="🎨" color={C.success} delay={80} />
              <TeamCard name="Vendor Success" role="Onboarding & Support" emoji="🤝" color={C.accent} delay={160} />
              <TeamCard name="Support Team" role="Customer Success" emoji="💬" color={C.danger} delay={240} />
            </div>
          </div>
        </section>

        {/* ══════════════════════ CTA ══════════════════════ */}
        <section ref={ctaRef} className="ab-section">
          <div className="ab-section-inner">
            <div className={`ab-cta reveal ${ctaVis ? 'shown' : ''}`}>
              <div className="ab-cta-bg" />
              <h2 className="ab-cta-title">Ready to join?</h2>
              <p className="ab-cta-subtitle">
                Download the app and start buying, selling, and building an audience across Ghana.
              </p>
              <div className="ab-cta-btns">
                <a
                  href="https://apps.apple.com/us/app/cedimart/id6762318566"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ab-cta-btn primary"
                >
                  <Apple size={24} className="dl-btn-icon" /> App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.freshyfood.factory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ab-cta-btn secondary"
                >
                  <Play size={24} className="dl-btn-icon" fill="currentColor" /> Google Play
                </a>
              </div>
              <div className="ab-cta-links">
                <Link href="/listings">Browse listings</Link>
                <Link href="/ai-assistant">Try CediAi</Link>
                <Link href="/">Back to home</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const aboutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  .ab-page { background: ${C.void}; color: ${C.white}; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
  .reveal { transition: opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1); }
  .reveal:not(.shown) { opacity: 0; transform: translateY(24px); }
  .reveal.shown { opacity: 1; transform: translateY(0); }

  .ab-hero { position: relative; padding: clamp(60px,10vw,120px) clamp(20px,5vw,80px); text-align: center; overflow: hidden; }
  .ab-hero-bg { position: absolute; inset: 0; pointer-events: none; }
  .ab-hero-orb { position: absolute; width: 500px; height: 500px; border-radius: 50%; filter: blur(80px); }
  .ab-hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
  .ab-hero-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${C.brand}; background: ${C.brandBg}; border: 1px solid ${C.brandBorder}; border-radius: 40px; padding: 6px 16px; margin-bottom: 24px; }
  .ab-live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.brand}; }
  .ab-hero-title { font-size: clamp(32px,5vw,64px); font-weight: 900; line-height: 1.08; letter-spacing: -1.5px; margin-bottom: 20px; }
  .ab-hero-highlight { display: block; background: linear-gradient(135deg, ${C.brand}, ${C.accent}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .ab-hero-subtitle { font-size: clamp(14px,2vw,17px); color: ${C.off}; line-height: 1.7; max-width: 620px; margin: 0 auto 40px; }
  .ab-hero-stats-row { display: flex; align-items: center; justify-content: center; gap: clamp(20px,4vw,40px); flex-wrap: wrap; }
  .ab-hero-stat { text-align: center; }
  .ab-hero-stat-num { display: block; font-size: clamp(24px,3vw,36px); font-weight: 900; color: ${C.accent}; font-family: 'JetBrains Mono', monospace; }
  .ab-hero-stat-lbl { font-size: 12px; color: ${C.muted}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
  .ab-hero-stat-divider { width: 1px; height: 40px; background: ${C.border}; }

  .ab-section { padding: clamp(48px,8vw,100px) clamp(20px,5vw,80px); }
  .ab-section-inner { max-width: 1100px; margin: 0 auto; }
  .ab-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.muted}; margin-bottom: 14px; font-family: 'JetBrains Mono', monospace; }
  .ab-section-title { font-size: clamp(24px,3.5vw,42px); font-weight: 800; line-height: 1.12; letter-spacing: -0.5px; margin-bottom: 18px; }
  .ab-section-desc { font-size: 15px; color: ${C.off}; line-height: 1.7; margin-bottom: 12px; }

  .ab-mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px,5vw,60px); align-items: center; }
  @media (max-width: 768px) { .ab-mission-grid { grid-template-columns: 1fr; } }
  .ab-mission-cards { display: flex; flex-direction: column; gap: 14px; }
  .ab-mission-card { background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 18px; padding: clamp(20px,3vw,28px); border-left: 3px solid var(--card-color, ${C.brand}); transition: all .3s; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
  .ab-mission-card:hover { transform: translateX(4px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  .ab-mission-card-icon { font-size: 28px; margin-bottom: 10px; }
  .ab-mission-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .ab-mission-card p { font-size: 13px; color: ${C.off}; line-height: 1.6; }

  .ab-stats-section { background: ${C.surf}; border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border}; padding: clamp(40px,6vw,70px) clamp(20px,5vw,80px); }
  .ab-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1100px; margin: 0 auto; }
  @media (max-width: 640px) { .ab-stats-grid { grid-template-columns: repeat(2, 1fr); } }
  .stat-card { text-align: center; padding: 24px 16px; background: ${C.elev}; border: 1px solid ${C.border}; border-radius: 18px; transition: all .3s; }
  .stat-card:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.06); }
  .stat-icon { font-size: 32px; margin-bottom: 10px; }
  .stat-value { font-size: clamp(28px,3.5vw,42px); font-weight: 900; font-family: 'JetBrains Mono', monospace; letter-spacing: -1px; }
  .stat-label { font-size: 12px; font-weight: 600; color: ${C.muted}; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }

  .ab-features-section { background: ${C.surf}; border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border}; }
  .ab-features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  @media (max-width: 480px) { .ab-features-grid { grid-template-columns: 1fr; } }
  .ab-feature-card { background: ${C.void}; border: 1px solid ${C.border}; border-radius: 18px; padding: clamp(22px,3vw,28px); transition: all .3s; border-top: 3px solid var(--feat-color, ${C.brand}); }
  .ab-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.08); }
  .ab-feature-icon { width: 44px; height: 44px; border-radius: 12px; background: ${C.surf}; border: 1px solid ${C.border}; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .ab-feature-title { font-size: 15.5px; font-weight: 700; margin-bottom: 8px; line-height: 1.35; }
  .ab-feature-desc { font-size: 13.5px; color: ${C.off}; line-height: 1.65; }

  .ab-story-header { text-align: center; margin-bottom: 48px; }
  .ab-timeline { max-width: 700px; margin: 0 auto; position: relative; }
  .timeline-item { display: flex; gap: 20px; margin-bottom: 32px; }
  .timeline-item:last-child { margin-bottom: 0; }
  .timeline-line { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .timeline-dot { width: 44px; height: 44px; border-radius: 50%; background: ${C.surf}; border: 2px solid ${C.brand}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .timeline-connector { width: 2px; flex: 1; background: ${C.border}; margin-top: 4px; min-height: 40px; }
  .timeline-content { padding-top: 6px; }
  .timeline-year { display: inline-block; font-size: 10px; font-weight: 700; color: ${C.brand}; background: ${C.brandBg}; padding: 3px 10px; border-radius: 20px; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }
  .timeline-title { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
  .timeline-desc { font-size: 14px; color: ${C.off}; line-height: 1.6; }
  @media (max-width: 480px) { .timeline-item { gap: 14px; } .timeline-dot { width: 36px; height: 36px; font-size: 14px; } }

  .ab-values-section { background: ${C.surf}; border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border}; }
  .ab-values-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  @media (max-width: 480px) { .ab-values-grid { grid-template-columns: 1fr; } }
  .ab-value-card { background: ${C.void}; border: 1px solid ${C.border}; border-radius: 18px; padding: clamp(20px,3vw,28px); transition: all .3s; border-top: 3px solid var(--val-color, ${C.brand}); }
  .ab-value-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.08); }
  .ab-value-icon { font-size: 28px; margin-bottom: 12px; }
  .ab-value-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .ab-value-desc { font-size: 13.5px; color: ${C.off}; line-height: 1.65; }

  .ab-team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto; }
  @media (max-width: 480px) { .ab-team-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
  .team-card { text-align: center; padding: 24px 16px; background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 18px; transition: all .3s; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
  .team-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  .team-avatar { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 30px; }
  .team-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .team-role { font-size: 12px; color: ${C.muted}; line-height: 1.4; }

  .ab-cta { background: linear-gradient(135deg, ${C.brand} 0%, ${C.brandL} 50%, ${C.accent} 100%); border-radius: 28px; padding: clamp(40px,6vw,70px) clamp(24px,5vw,60px); text-align: center; position: relative; overflow: hidden; }
  .ab-cta-bg { position: absolute; inset: 0; opacity: .04; background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 24px 24px; pointer-events: none; }
  .ab-cta-title { font-size: clamp(26px,4vw,44px); font-weight: 900; color: #fff; margin-bottom: 14px; position: relative; }
  .ab-cta-subtitle { font-size: 15px; color: rgba(255,255,255,.85); max-width: 470px; margin: 0 auto 28px; line-height: 1.6; position: relative; }
  .ab-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; margin-bottom: 24px; }
  .ab-cta-btn { padding: 13px 26px; border-radius: 14px; font-weight: 700; font-size: 14px; text-decoration: none; transition: all .22s; display: inline-flex; align-items: center; gap: 8px; }
  .ab-cta-btn.primary { background: #fff; color: ${C.brandD}; box-shadow: 0 8px 24px rgba(0,0,0,.1); }
  .ab-cta-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,.15); }
  .ab-cta-btn.secondary { background: rgba(255,255,255,.12); color: #fff; border: 1.5px solid rgba(255,255,255,.3); }
  .ab-cta-btn.secondary:hover { background: rgba(255,255,255,.2); }
  .ab-cta-links { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; position: relative; }
  .ab-cta-links a { color: rgba(255,255,255,.75); font-size: 13px; font-weight: 600; text-decoration: none; transition: color .2s; }
  .ab-cta-links a:hover { color: #fff; }

  @media (max-width: 480px) {
    .ab-hero-stats-row { gap: 16px; }
    .ab-hero-stat-divider { display: none; }
    .ab-cta-btns { flex-direction: column; }
    .ab-cta-btn { justify-content: center; }
  }
`;