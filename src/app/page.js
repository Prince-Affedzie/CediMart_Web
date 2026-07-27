// src/app/page.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts, getProductsByTag } from '@/apis/productApi';
import GirlShopping from '@/assets/cedimartlandingpage_img_1.png';

// ─── Design tokens (Teal + Coral Light Mode) ──────────────────────────────────
const C = {
  void:    '#F8FAFC',
  surf:    '#FFFFFF',
  elev:    '#F1F5F9',
  white:   '#0F172A',
  off:     '#475569',
  muted:   '#94A3B8',
  border:  '#E2E8F0',
  brand:   '#0D9488',
  brandL:  '#14B8A6',
  brandD:  '#0F766E',
  brandBg: '#F0FDFA',
  accent:  '#F97316',
  accentL: '#FB923C',
  accentBg:'#FFF7ED',
  emerald: '#059669',
  emeraldBg:'#ECFDF5',
  coral:   '#DC2626',
  coralBg: '#FEF2F2',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p == null ? '—' : `GH₵\u00A0${Number(p).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;

const CONDITION_MAP = {
  'new':           { label: 'New',        bg: '#05966915', color: C.emerald },
  'like-new':      { label: 'Like New',   bg: '#05966915', color: C.emerald },
  'excellent':     { label: 'Excellent',  bg: '#0D948815', color: C.brand },
  'good':          { label: 'Good',       bg: '#F9731615', color: '#D97706' },
  'fair':          { label: 'Fair',       bg: '#DC262615', color: C.coral },
  'slightly-used': { label: 'Used',       bg: '#DC262615', color: C.coral },
  'for-parts':     { label: 'Parts',      bg: '#64748B15', color: '#64748B' },
};

const CATEGORY_ICONS = {
  'electronics':'💻','phones and tablets':'📱','computers and laptops':'🖥️',
  'gaming':'🎮','fashion':'👗','books-course-materials':'📚',
  'hostel-items':'🏠','appliances':'🔌','furniture':'🪑',
  'beauty and grooming':'💄','sports and fitness':'⚽',
  'food and drinks':'🍕','services':'🛠️','other':'📦',
};

const TICKER_ITEMS = [
  '🔥 Flash sale — Samsung Galaxy A54 · GH₵ 1,800 · KNUST',
  '✅ Ama sold her fan in 40 minutes · UG',
  '🆕 Kofi just listed a Dell laptop · GH₵ 2,200 · UCC',
  '👀 94 students browsing Electronics right now',
  "🎉 Serwaa's Fashion shop crossed 200 sales · UPSA",
  '⚡ 500 new listings today across all campuses',
  '📚 Past questions for all courses — GH₵ 20 · KNUST',
  '🍚 Jollof Rice delivery — Legon Hall area',
];

const CATEGORIES = [
  { key:'all',         label:'All'         },
  { key:'electronics', label:'Electronics' },
  { key:'fashion',     label:'Fashion'     },
  { key:'books-course-materials', label:'Books' },
  { key:'food and drinks', label:'Food'   },
  { key:'hostel-items',    label:'Hostel' },
  { key:'phones and tablets', label:'Phones' },
];

const AI_DEMOS = [
  { q:'Find me a laptop under GH₵3000', icon:'💻' },
  { q:'Best headphones under GH₵300',   icon:'🎧' },
  { q:'Dresses for Hall Week',           icon:'👗' },
  { q:'Affordable course materials',     icon:'📚' },
  { q:'Who sells Jollof near Legon?',    icon:'🍚' },
];

const WHY_ITEMS = [
  { icon:'🛡️', title:'Verified Sellers',    color:C.brand,
    desc:'Every vendor submits a national ID and student card. Green badge = fully checked.' },
  { icon:'⚡', title:'List in 60 Seconds', color:C.accent,
    desc:'Photo, price, publish. Median listing time: 48 seconds. Your buyer could message within the hour.' },
  { icon:'🔒', title:'Private Messaging',   color:C.coral,
    desc:'Chat inside the app. Your phone number stays private until you choose to share it.' },
  { icon:'📊', title:'Live Analytics',      color:C.emerald,
    desc:'See real-time views, saves, and conversion rates on every product you list. No weekly reports.' },
];

const STATS = [
  { v:'10K+',   l:'Students',   c:C.brand  },
  { v:'2,500+', l:'Businesses', c:C.accent },
  { v:'50K+',   l:'Listings',   c:C.coral  },
  { v:'8',      l:'Campuses',   c:C.emerald },
];

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

// ─── Product card skeleton ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-img" />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="sk-line" style={{ width: '60%', height: 10 }} />
        <div className="sk-line" style={{ width: '90%', height: 14 }} />
        <div className="sk-line" style={{ width: '80%', height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div className="sk-line" style={{ width: '35%', height: 18 }} />
          <div className="sk-line" style={{ width: '28%', height: 30, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  const [hovered, setHovered] = useState(false);
  const [tilt,    setTilt]    = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { setIsMobile(window.innerWidth <= 768); }, []);

  const onMove = (e) => {
    if (isMobile) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -12;
    setTilt({ x, y });
  };
  const onLeave = () => { setHovered(false); setTilt({ x: 0, y: 0 }); };

  const img = product.images?.[0] || product.image || null;
  const cond = CONDITION_MAP[product.condition] || null;
  const catIcon = CATEGORY_ICONS[product.category] || '📦';
  const isOnSale = product.discountInfo?.isOnSale && product.discountInfo?.originalPrice > product.price;
  const pct = isOnSale
    ? Math.round(((product.discountInfo.originalPrice - product.price) / product.discountInfo.originalPrice) * 100)
    : null;

  return (
    <Link href={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
      <div className="prod-card" style={{
        animationDelay: `${index * 60}ms`,
        transform: isMobile ? 'none' : `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) ${hovered ? 'translateY(-6px)' : 'translateY(0)'}`,
        boxShadow: hovered && !isMobile ? `0 20px 50px rgba(0,0,0,.15), 0 0 0 1px ${C.brand}40` : `0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05)`,
      }}
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onTouchStart={() => setIsMobile(true)}
      >
        <div className="prod-img-wrap">
          {img ? (
            <img src={img} alt={product.name} className="prod-img" onError={e => { e.target.src = 'https://placehold.co/400x300/F1F5F9/94A3B8?text=No+Image'; }} />
          ) : (
            <div className="prod-img-placeholder">{catIcon}</div>
          )}
          {isOnSale && <span className="prod-badge" style={{ background: C.coral, color: '#fff', top: 10, right: 10 }}>-{pct}%</span>}
          {cond && !isOnSale && <span className="prod-badge" style={{ background: cond.bg, color: cond.color, top: 10, left: 10 }}>{cond.label}</span>}
          {product.negotiable && <span className="prod-badge" style={{ background: '#F9731615', color: C.accent, bottom: 10, left: 10, border: `1px solid ${C.accent}30` }}>Nego.</span>}
          <div className="prod-overlay" style={{ opacity: !isMobile && hovered ? 1 : 0 }}>
            <span className="prod-overlay-text">View listing →</span>
          </div>
        </div>
        <div className="prod-info">
          <div className="prod-meta-row">
            <span className="prod-cat">{catIcon} {product.category?.replace(/-/g,' ') || 'Other'}</span>
            {product.campus && <span className="prod-campus">{product.campus}</span>}
          </div>
          <p className="prod-name">{product.name}</p>
          <div className="prod-foot">
            <div>
              {isOnSale && <s className="prod-original">{fmtPrice(product.discountInfo.originalPrice)}</s>}
              <span className="prod-price" style={{ color: isOnSale ? C.coral : C.accent }}>{fmtPrice(product.price)}</span>
            </div>
            <span className="prod-view-btn">View</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Continuous ticker ─────────────────────────────────────────────────────────
function Ticker() {
  return (
    <div className="ticker-outer">
      <div className="ticker-track">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (<span key={i} className="ticker-item">{t}</span>))}
      </div>
    </div>
  );
}

// ─── AI demo conversation card ─────────────────────────────────────────────────
function AiDemoCard({ query, icon, delay = 0 }) {
  const [ref, vis] = useReveal(0.2);
  return (
    <div ref={ref} className={`ai-demo-card reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="ai-demo-q"><span className="ai-demo-icon">{icon}</span><span className="ai-demo-q-text">{query}</span></div>
      <div className="ai-demo-a">
        <div className="ai-demo-a-header"><span className="ai-demo-sparkle">✦</span><span className="ai-demo-a-name">Ask Cedi</span></div>
        <p className="ai-demo-a-text">I found <span style={{ color: C.emerald, fontWeight: 700 }}>4 listings</span> that match — let me show you the best options with prices, conditions, and campus locations.</p>
        <div className="ai-demo-chips">
          <span className="ai-demo-chip">📦 3 results</span>
          <span className="ai-demo-chip">🏫 2 campuses</span>
          <span className="ai-demo-chip">✅ All verified</span>
        </div>
      </div>
    </div>
  );
}

// ─── Floating "Shop with CediAi" launcher ──────────────────────────────────────
function FloatingAiButton() {
  return (
    <Link href="/ai-assistant" className="floating-ai-btn" aria-label="Shop with CediAi">
      <span className="floating-ai-sparkle">✦</span>
      <span className="floating-ai-label">Shop with CediAi</span>
    </Link>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products,     setProducts]     = useState([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [email,        setEmail]        = useState('');
  const [emailDone,    setEmailDone]    = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [heroRef, heroVis] = useReveal(0.05);
  const [listRef, listVis] = useReveal(0.08);
  const [whyRef,  whyVis]  = useReveal(0.08);
  const [aiRef,   aiVis]   = useReveal(0.08);
  const [ctaRef,  ctaVis]  = useReveal(0.08);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchProducts = useCallback(async (filter) => {
    setLoadingProds(true);
    try {
      let res;
      if (filter === 'all') {
        try { res = await getProductsByTag('featured'); }
        catch (tagError) { res = await getAllProducts({ limit: 8, sort: 'newest' }); }
      } else {
        const { getProductsByCategory } = await import('@/apis/productApi');
        res = await getProductsByCategory(filter, { limit: 8, sort: 'newest' });
      }
      const responseData = res?.data;
      const data = responseData?.data?.products || responseData?.data?.data || responseData?.products || responseData?.data || responseData || [];
      setProducts(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (err) { console.error('Fetch error:', err); setProducts([]); }
    finally { setLoadingProds(false); }
  }, []);

  useEffect(() => { fetchProducts(activeFilter); }, [activeFilter]);

  return (
    <div style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }} className="overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.void}; color: ${C.white}; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        ::selection { background: ${C.brand}22; color: ${C.brand}; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes cardIn    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(13,148,136,.15)} 50%{box-shadow:0 0 0 20px rgba(13,148,136,0)} }
        @keyframes tealOrb   { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.6;transform:scale(1.05)} }
        @keyframes dotPulse  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
        @keyframes gradBG    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes floatBob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }

        .reveal { transition: opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1); }
        .reveal:not(.shown) { opacity: 0; transform: translateY(22px); }
        .reveal.shown { opacity: 1; transform: translateY(0); }

        /* ── Hero ── */
        .hero {
          position: relative; overflow: hidden;
          padding: clamp(40px,8vw,140px) clamp(16px,4vw,80px) clamp(40px,8vw,100px);
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(20px,4vw,60px); align-items: center;
          max-width: 1280px; margin: 0 auto; z-index: 1;
        }
        @media(max-width:900px){ 
          .hero{grid-template-columns:1fr; text-align: center; padding: clamp(32px,6vw,60px) 16px;}
          .hero-visual{display:none!important;}
          .hero-sub{margin-left: auto; margin-right: auto;}
          .hero-trust{justify-content: center;}
          .hero-btns{justify-content: center;}
        }
        .hero-glow {
          position: absolute; pointer-events: none;
          border-radius: 50%; filter: blur(80px); z-index: 0;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: clamp(9px,2vw,11px); font-weight: 700; letter-spacing: .14em;
          text-transform: uppercase; color: ${C.brand};
          background: rgba(13,148,136,0.08); border: 1px solid ${C.brand}20;
          border-radius: 40px; padding: clamp(4px,1vw,6px) clamp(10px,2vw,14px); 
          margin-bottom: clamp(16px,3vw,24px);
        }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.brand}; position: relative; }
        .live-dot::after { content:''; position: absolute; inset: -3px; border-radius: 50%; background: ${C.brand}; animation: dotPulse 1.8s ease-out infinite; }
        .hero-h1 {
          font-size: clamp(28px,5vw,76px); font-weight: 900; line-height: 1.05;
          letter-spacing: -1.5px; margin-bottom: clamp(14px,2vw,22px); color: ${C.white};
        }
        .hero-h1-line2 { color: ${C.accent}; display: block; }
        .hero-sub { font-size: clamp(14px,2vw,17px); color: ${C.off}; line-height: 1.72; max-width: 440px; margin-bottom: clamp(24px,4vw,36px); }
        .hero-btns { display: flex; gap: clamp(8px,2vw,12px); flex-wrap: wrap; margin-bottom: clamp(32px,5vw,48px); }
        .btn-primary {
          background: linear-gradient(135deg,${C.brand},${C.brandL});
          color: #fff; font-weight: 700; font-size: clamp(12px,2vw,14px);
          padding: clamp(10px,2vw,14px) clamp(16px,3vw,26px); border-radius: 14px; 
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(13,148,136,0.2); transition: all .22s ease;
        }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,148,136,0.28); }
        .btn-secondary {
          background: ${C.surf}; color: ${C.white}; font-weight: 600; 
          font-size: clamp(12px,2vw,14px); padding: clamp(10px,2vw,14px) clamp(16px,3vw,26px); 
          border-radius: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid ${C.border}; transition: all .22s ease;
        }
        .btn-secondary:hover { border-color: ${C.accent}; color: ${C.accent}; }
        .hero-trust { display: flex; align-items: center; gap: clamp(10px,2vw,20px); flex-wrap: wrap; }
        .hero-stars { display: flex; gap: 2px; color: ${C.accent}; font-size: clamp(11px,2vw,13px); }
        .hero-trust-text { font-size: clamp(10px,1.5vw,12.5px); color: ${C.muted}; }
        .hero-trust-text strong { color: ${C.white}; }
        .hero-campus-pills { display: flex; gap: clamp(4px,1vw,7px); flex-wrap: wrap; }
        .campus-pill { font-size: clamp(8px,1.2vw,10px); font-weight: 700; color: ${C.off}; background: ${C.elev}; border: 1px solid ${C.border}; border-radius: 20px; padding: clamp(3px,0.5vw,4px) clamp(6px,1vw,10px); font-family: 'JetBrains Mono', monospace; }

        .hero-visual { position: relative; height: clamp(300px,40vw,480px); }
        .hero-visual-blob { position: absolute; inset: 0; margin: auto; width: 82%; height: 82%; background: radial-gradient(circle, rgba(13,148,136,.14), transparent 70%); filter: blur(50px); z-index: 0; }
        .hero-float-badge { position: absolute; z-index: 3; display: flex; align-items: center; gap: 8px; background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 40px; padding: clamp(8px,1.4vw,11px) clamp(12px,2vw,16px); font-size: clamp(11px,1.4vw,13px); font-weight: 700; color: ${C.white}; box-shadow: 0 10px 30px rgba(15,23,42,.12); animation: floatBob 4s ease-in-out infinite; }
        .hero-float-badge--top { top: clamp(6%,4vw,10%); right: clamp(-6%,-2vw,-4%); }
        .hero-float-badge--bottom { bottom: clamp(6%,4vw,10%); left: clamp(-6%,-2vw,-4%); animation-delay: 1.3s; }

        /* ── Floating CediAi launcher ── */
        .floating-ai-btn {
          position: fixed; bottom: clamp(16px,3vw,28px); right: clamp(16px,3vw,28px); z-index: 500;
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, ${C.brand}, ${C.brandL});
          color: #fff; font-weight: 800; font-size: clamp(12px,1.6vw,14px);
          padding: clamp(13px,2vw,16px) clamp(20px,2.5vw,24px); border-radius: 999px;
          text-decoration: none; box-shadow: 0 10px 28px rgba(13,148,136,.35), 0 2px 8px rgba(0,0,0,.12);
          transition: transform .22s ease, box-shadow .22s ease;
          animation: floatBob 3.4s ease-in-out infinite;
        }
        .floating-ai-btn:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 16px 36px rgba(13,148,136,.45); }
        .floating-ai-sparkle { font-size: 15px; }
        @media(max-width:520px){ .floating-ai-btn { padding: 15px; border-radius: 50%; animation: none; } .floating-ai-label { display: none; } }

        /* ── Ticker ── */
        .ticker-outer { overflow: hidden; background: ${C.surf}; border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border}; padding: clamp(8px,1.5vw,12px) 0; }
        .ticker-track { display: flex; gap: clamp(24px,4vw,48px); white-space: nowrap; animation: ticker 38s linear infinite; }
        .ticker-item  { font-size: clamp(11px,1.5vw,13px); color: ${C.off}; flex-shrink: 0; }

        /* ── Stats bar ── */
        .stats-bar { background: ${C.surf}; border-bottom: 1px solid ${C.border}; padding: clamp(24px,4vw,36px) clamp(16px,4vw,80px); }
        .stats-inner { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: clamp(12px,2vw,24px); }
        @media(max-width:640px){ .stats-inner{grid-template-columns:repeat(2,1fr); gap: 20px;} }
        .stat-item { border-left: 3px solid var(--sc); padding-left: clamp(12px,2vw,18px); }
        .stat-val { font-size: clamp(24px,4vw,42px); font-weight: 900; color: var(--sc); letter-spacing: -1px; line-height: 1; }
        .stat-lbl { font-size: clamp(9px,1.2vw,11px); font-weight: 600; color: ${C.muted}; margin-top: 4px; letter-spacing: .12em; text-transform: uppercase; font-family: 'JetBrains Mono',monospace; }

        /* ── Listings section ── */
        .section { padding: clamp(40px,6vw,100px) clamp(16px,4vw,80px); overflow: hidden; width: 100%; max-width: 100vw; }
        .section-inner { max-width: 1280px; margin: 0 auto; }
        .section-eyebrow { font-size: clamp(9px,1.3vw,10.5px); font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--ec); margin-bottom: clamp(10px,2vw,14px); font-family: 'JetBrains Mono',monospace; }
        .section-h2 { font-size: clamp(22px,3.5vw,48px); font-weight: 800; line-height: 1.1; letter-spacing: -1px; margin-bottom: clamp(10px,2vw,14px); color: ${C.white}; }
        .section-sub { font-size: clamp(13px,2vw,15px); color: ${C.off}; line-height: 1.7; max-width: 520px; margin-bottom: clamp(24px,4vw,36px); }

        .filter-row { display: flex; gap: clamp(4px,1vw,8px); flex-wrap: wrap; margin-bottom: clamp(20px,3vw,32px); }
        .filter-pill {
          font-size: clamp(11px,1.5vw,12.5px); font-weight: 600; 
          padding: clamp(5px,1vw,7px) clamp(12px,2vw,16px); border-radius: 40px; cursor: pointer;
          border: 1.5px solid ${C.border}; background: ${C.surf}; color: ${C.off};
          transition: all .22s ease; font-family: 'Plus Jakarta Sans',sans-serif; white-space: nowrap;
        }
        .filter-pill:hover  { border-color: ${C.brand}; color: ${C.brand}; }
        .filter-pill.active { background: linear-gradient(135deg,${C.brand},${C.brandL}); border-color: transparent; color: #fff; box-shadow: 0 4px 16px rgba(13,148,136,0.2); }

        .prod-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(clamp(160px,25vw,220px),1fr)); gap: clamp(12px,2vw,18px); }
        @media(max-width:480px){ .prod-grid{grid-template-columns: repeat(2,1fr); gap: 10px;} }
        .prod-card { background: ${C.surf}; border-radius: clamp(12px,2vw,18px); overflow: hidden; border: 1px solid ${C.border}; transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s, border-color .22s; cursor: pointer; text-decoration: none; display: block; opacity: 0; animation: cardIn .5s ease forwards; }
        .prod-img-wrap { position: relative; height: clamp(130px,20vw,180px); background: ${C.elev}; overflow: hidden; }
        .prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; display: block; }
        .prod-card:hover .prod-img { transform: scale(1.05); }
        .prod-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: clamp(28px,4vw,42px); }
        .prod-badge { position: absolute; font-size: clamp(8px,1.1vw,9.5px); font-weight: 800; padding: clamp(2px,0.5vw,3px) clamp(5px,1vw,8px); border-radius: 8px; letter-spacing: .03em; }
        .prod-overlay { position: absolute; inset: 0; background: rgba(13,148,136,.1); display: flex; align-items: center; justify-content: center; transition: opacity .22s; }
        .prod-overlay-text { font-size: clamp(11px,1.5vw,13px); font-weight: 700; color: #fff; background: ${C.brand}; padding: clamp(5px,1vw,7px) clamp(12px,2vw,16px); border-radius: 40px; }
        .prod-info { padding: clamp(10px,1.5vw,14px) clamp(12px,2vw,16px) clamp(12px,2vw,16px); display: flex; flex-direction: column; gap: clamp(4px,1vw,6px); }
        .prod-meta-row{ display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; }
        .prod-cat { font-size: clamp(9px,1.1vw,10px); font-weight: 700; color: ${C.muted}; text-transform: capitalize; }
        .prod-campus { font-size: clamp(8px,1vw,9.5px); font-weight: 700; color: ${C.brand}; font-family: 'JetBrains Mono',monospace; background: rgba(13,148,136,0.08); padding: 2px 7px; border-radius: 8px; white-space: nowrap; }
        .prod-name { font-size: clamp(12px,1.6vw,14px); font-weight: 700; color: ${C.white}; line-height: 1.38; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .prod-foot { display: flex; align-items: flex-end; justify-content: space-between; margin-top: clamp(2px,0.5vw,4px); }
        .prod-original{ font-size: clamp(9px,1.2vw,10.5px); color: ${C.muted}; text-decoration: line-through; display: block; margin-bottom: 1px; font-family: 'JetBrains Mono',monospace; }
        .prod-price { font-size: clamp(14px,2vw,17px); font-weight: 800; font-family: 'JetBrains Mono',monospace; display: block; }
        .prod-view-btn{ font-size: clamp(10px,1.3vw,12px); font-weight: 700; background: rgba(13,148,136,0.08); color: ${C.brand}; border: 1px solid ${C.brand}20; padding: clamp(5px,1vw,7px) clamp(10px,1.5vw,13px); border-radius: 10px; white-space: nowrap; transition: all .2s; }
        .prod-card:hover .prod-view-btn { background: ${C.brand}; color: #fff; border-color: transparent; }

        .sk-card { background: ${C.surf}; border-radius: 18px; overflow: hidden; border: 1px solid ${C.border}; animation: shimmer 1.8s ease-in-out infinite; background: linear-gradient(90deg,${C.elev} 25%,${C.surf} 50%,${C.elev} 75%); background-size: 400% 100%; }
        .sk-img  { height: clamp(130px,20vw,180px); background: ${C.elev}; }
        .sk-line { border-radius: 6px; background: ${C.elev}; }

        .view-all-wrap { display: flex; justify-content: center; margin-top: clamp(24px,4vw,36px); }
        .view-all-btn { border: 1.5px solid ${C.border}; color: ${C.off}; font-weight: 600; font-size: clamp(12px,2vw,14px); padding: clamp(10px,2vw,12px) clamp(20px,3vw,28px); border-radius: 12px; text-decoration: none; transition: all .22s; }
        .view-all-btn:hover { border-color: ${C.brand}; color: ${C.brand}; }

        /* ── Cedi AI section ── */
        .ai-section { background: linear-gradient(135deg, ${C.surf} 0%, ${C.elev} 100%); border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border}; }
        .ai-split { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px,5vw,72px); align-items: center; max-width: 1280px; margin: 0 auto; }
        @media(max-width:900px){ .ai-split{grid-template-columns:1fr; gap: 32px;} .ai-demos-stack{max-width: 500px; margin: 0 auto;} }
        .ai-orb { width: clamp(40px,5vw,56px); height: clamp(40px,5vw,56px); border-radius: 50%; background: rgba(13,148,136,.08); border: 1px solid rgba(13,148,136,.2); display: flex; align-items: center; justify-content: center; font-size: clamp(18px,2.5vw,24px); margin-bottom: clamp(14px,2vw,22px); animation: orbPulse 3s ease-in-out infinite; }
        .ai-feature-row { display: flex; align-items: flex-start; gap: clamp(10px,1.5vw,14px); padding: clamp(14px,2vw,18px) 0; border-bottom: 1px solid ${C.border}; }
        .ai-feature-row:last-child { border-bottom: none; }
        .ai-feature-icon { width: clamp(32px,3vw,38px); height: clamp(32px,3vw,38px); border-radius: 10px; background: rgba(13,148,136,.08); display: flex; align-items: center; justify-content: center; font-size: clamp(14px,2vw,17px); flex-shrink: 0; }
        .ai-feature-title { font-size: clamp(13px,1.6vw,14px); font-weight: 700; color: ${C.white}; margin-bottom: 3px; }
        .ai-feature-desc  { font-size: clamp(11px,1.4vw,13px); color: ${C.off}; line-height: 1.6; }
        .ai-try-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: clamp(20px,3vw,28px); background: ${C.brand}; color: #fff; font-weight: 800; font-size: clamp(12px,1.5vw,14px); padding: clamp(10px,1.5vw,13px) clamp(18px,2.5vw,24px); border-radius: 14px; text-decoration: none; transition: all .22s; box-shadow: 0 4px 16px rgba(13,148,136,.25); }
        .ai-try-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }

        .ai-demo-card { background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
        .ai-demo-q { display: flex; align-items: center; gap: 10px; padding: clamp(10px,1.5vw,14px) clamp(12px,2vw,16px); border-bottom: 1px solid ${C.border}; background: ${C.elev}; }
        .ai-demo-icon    { font-size: clamp(16px,2vw,18px); }
        .ai-demo-q-text  { font-size: clamp(12px,1.5vw,14px); font-weight: 600; color: ${C.white}; }
        .ai-demo-a { padding: clamp(10px,1.5vw,14px) clamp(12px,2vw,16px) clamp(12px,2vw,16px); }
        .ai-demo-a-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
        .ai-demo-sparkle { color: ${C.brand}; font-size: 12px; }
        .ai-demo-a-name  { font-size: clamp(10px,1.2vw,11px); font-weight: 700; color: ${C.brand}; text-transform: uppercase; letter-spacing: .06em; }
        .ai-demo-a-text  { font-size: clamp(11px,1.4vw,13.5px); color: ${C.off}; line-height: 1.65; margin-bottom: 12px; }
        .ai-demo-chips   { display: flex; gap: 7px; flex-wrap: wrap; }
        .ai-demo-chip    { font-size: clamp(10px,1.2vw,11px); font-weight: 600; color: ${C.brand}; background: rgba(13,148,136,.08); border: 1px solid rgba(13,148,136,.15); border-radius: 20px; padding: 4px 11px; }
        .ai-demos-stack  { display: flex; flex-direction: column; gap: clamp(10px,1.5vw,14px); }

        /* ── Why section ── */
        .why-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(clamp(250px,30vw,280px),1fr)); gap: clamp(12px,1.5vw,16px); }
        @media(max-width:640px){ .why-grid{grid-template-columns: 1fr;} }
        .why-card { background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 18px; padding: clamp(20px,3vw,26px); transition: all .28s ease; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
        .why-card:hover { transform: translateY(-4px); border-color: var(--wc); background: ${C.surf}; box-shadow: 0 8px 30px rgba(0,0,0,.1); }
        .why-icon { width: clamp(36px,4vw,44px); height: clamp(36px,4vw,44px); border-radius: 13px; background: var(--wb); display: flex; align-items: center; justify-content: center; font-size: clamp(16px,2vw,20px); margin-bottom: clamp(12px,2vw,16px); }
        .why-title{ font-size: clamp(13px,1.6vw,15px); font-weight: 700; color: ${C.white}; margin-bottom: 7px; }
        .why-desc { font-size: clamp(12px,1.4vw,13.5px); color: ${C.off}; line-height: 1.65; }

        /* ── CTA section ── */
        .cta-wrap { background: linear-gradient(135deg,${C.brand} 0%,${C.brandL} 40%,${C.accent} 100%); background-size: 200% 200%; animation: gradBG 8s ease infinite; border-radius: clamp(20px,3vw,28px); padding: clamp(32px,5vw,80px) clamp(20px,4vw,80px); text-align: center; position: relative; overflow: hidden; }
        .cta-h2 { font-size: clamp(24px,4vw,58px); font-weight: 900; color: #fff; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: clamp(12px,2vw,16px); position: relative; }
        .cta-sub { font-size: clamp(13px,1.8vw,16px); color: rgba(255,255,255,.9); max-width: 440px; margin: 0 auto clamp(24px,4vw,36px); line-height: 1.7; position: relative; }
        .cta-btns { display: flex; gap: clamp(8px,1.5vw,12px); justify-content: center; flex-wrap: wrap; position: relative; }
        @media(max-width:480px){ .cta-btns{flex-direction: column; align-items: center;} .cta-btns a{width: 100%; justify-content: center;} }
        .cta-btn-white { background: #fff; color: ${C.brand}; font-weight: 800; font-size: clamp(12px,1.5vw,14px); padding: clamp(10px,1.5vw,14px) clamp(20px,3vw,28px); border-radius: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(0,0,0,.15); transition: all .22s; }
        .cta-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,.25); }
        .cta-btn-ghost { background: rgba(255,255,255,.15); color: #fff; font-weight: 700; font-size: clamp(12px,1.5vw,14px); padding: clamp(10px,1.5vw,14px) clamp(20px,3vw,28px); border-radius: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid rgba(255,255,255,.4); backdrop-filter: blur(8px); transition: all .22s; }
        .cta-btn-ghost:hover { background: rgba(255,255,255,.25); }

        .nl-form { display: flex; gap: 8px; max-width: 400px; margin: clamp(18px,3vw,24px) auto 0; }
        @media(max-width:480px){ .nl-form{flex-direction: column; gap: 12px;} }
        .nl-input { flex: 1; background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.3); border-radius: 12px; padding: clamp(10px,1.5vw,12px) clamp(12px,2vw,16px); color: #fff; font-size: clamp(12px,1.5vw,14px); font-family: 'Plus Jakarta Sans',sans-serif; outline: none; min-width: 0; }
        .nl-input::placeholder { color: rgba(255,255,255,.6); }
        .nl-input:focus { border-color: rgba(255,255,255,.6); background: rgba(255,255,255,.2); }
        .nl-btn { background: #fff; color: ${C.brand}; font-weight: 800; font-size: clamp(11px,1.4vw,13px); padding: clamp(10px,1.5vw,12px) clamp(14px,2vw,18px); border-radius: 12px; border: none; cursor: pointer; transition: all .2s; font-family: 'Plus Jakarta Sans',sans-serif; flex-shrink: 0; white-space: nowrap; }
        .nl-btn:hover { transform: scale(1.03); }

        @media(max-width:480px){
          .hero-h1 br{display: none;}
          .filter-row{overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;}
          .filter-row::-webkit-scrollbar{display: none;}
          .filter-pill{flex-shrink: 0;}
          .ai-feature-row{flex-direction: column; gap: 8px;}
          .cta-h2 br{display: none;}
        }
      `}</style>

     {/* ══════════════════════ HERO ══════════════════════ */}
<section ref={heroRef} style={{ background: C.void, position: 'relative', overflow: 'hidden' }}>
  {/* ── Full background image — more visible ── */}
  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <Image
      src={GirlShopping}
      alt=""
      fill
      priority
      sizes="100vw"
      style={{ 
        objectFit: 'cover', 
        objectPosition: 'right center',
        opacity: 0.25,
      }}
    />
    {/* Lighter gradient overlays — more image visible */}
    <div style={{ 
      position: 'absolute', inset: 0, 
      background: `linear-gradient(135deg, ${C.void}ee 0%, ${C.void}aa 35%, transparent 60%)` 
    }} />
    <div style={{ 
      position: 'absolute', inset: 0, 
      background: `linear-gradient(to top, ${C.void}cc 0%, transparent 35%)` 
    }} />
  </div>

  <div className="hero-glow" style={{ width: isMobile ? 300 : 600, height: isMobile ? 300 : 600, top:'-20%', left:'-10%', background:`radial-gradient(circle, rgba(13,148,136,.08), transparent)`, animation:'tealOrb 8s ease-in-out infinite' }}/>
  <div className="hero-glow" style={{ width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, bottom:'0', right:'5%', background:`radial-gradient(circle, rgba(249,115,22,.06), transparent)` }}/>

  <div className={`hero reveal ${heroVis ? 'shown' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
    <div>
      <div className="hero-eyebrow">
        <span className="live-dot"/>
        Live across 8 campuses in Ghana
      </div>

      <h1 className="hero-h1" style={{ textShadow: '0 2px 20px rgba(15,23,42,.3)' }}>
        Your Campus.<br/>
        <span className="hero-h1-line2">Your Marketplace.</span>
      </h1>

      <p className="hero-sub">
        CediMart connects students across Ghana's top universities — buy textbooks, sell electronics, discover food vendors, and grow a real business, all within walking distance.
      </p>

      <div className="hero-btns">
        <Link href="#listings" className="btn-primary">Browse Listings →</Link>
        <Link href="/ai-assistant" className="btn-secondary">✦ Try CediAi</Link>
      </div>

      <div className="hero-trust">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="hero-stars">{'★★★★★'}</div>
          <span className="hero-trust-text"><strong>4.9</strong> / 10K+ students</span>
        </div>
        <div className="hero-campus-pills">
          {['UG','KNUST','UCC','UPSA','GIMPA','ATU'].map(c => (
            <span key={c} className="campus-pill">{c}</span>
          ))}
        </div>
      </div>
    </div>

    {/* Right visual — removed the duplicate image card, just keep floating badges */}
    <div className="hero-visual">
      <div className="hero-visual-blob" />
      <div className="hero-float-badge hero-float-badge--top">
        <span>✅</span> Verified Sellers
      </div>
      <div className="hero-float-badge hero-float-badge--bottom">
        <span>🔥</span> 500+ new listings today
      </div>
    </div>
  </div>
</section>

      <Ticker />
      <div className="stats-bar"><div className="stats-inner">{STATS.map((s, i) => (<div key={i} className="stat-item" style={{ '--sc': s.c }}><div className="stat-val">{s.v}</div><div className="stat-lbl">{s.l}</div></div>))}</div></div>

      <section id="listings" className="section" style={{ background: C.void }}>
        <div className="section-inner">
          <div ref={listRef} className={`reveal ${listVis ? 'shown' : ''}`}>
            <p className="section-eyebrow" style={{ '--ec': C.accent }}>— Browse</p>
            <h2 className="section-h2">What's selling on campus<span style={{ color: C.accent }}> right now.</span></h2>
            <p className="section-sub">Fresh listings added daily by verified student sellers — from course materials and electronics to food and fashion.</p>
          </div>
          <div className="filter-row">{CATEGORIES.map(cat => (<button key={cat.key} className={`filter-pill${activeFilter === cat.key ? ' active' : ''}`} onClick={() => setActiveFilter(cat.key)}>{cat.label}</button>))}</div>
          {loadingProds ? (<div className="prod-grid">{[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}</div>) : products.length === 0 ? (<div style={{ textAlign:'center', padding:'48px 0', color: C.muted }}><p style={{ fontSize:42, marginBottom:12 }}>📦</p><p style={{ fontSize:16 }}>No listings found for this category right now.</p></div>) : (<div className="prod-grid">{products.map((product, i) => (<ProductCard key={product._id || i} product={product} index={i} />))}</div>)}
          <div className="view-all-wrap"><Link href="/listings" className="view-all-btn">View all listings →</Link></div>
        </div>
      </section>

      <section id="ai-assistant-demo" className="section ai-section" ref={aiRef}>
        <div className="section-inner">
          <div className="ai-split">
            <div className={`reveal ${aiVis ? 'shown' : ''}`}>
              <div className="ai-orb">✦</div>
              <p className="section-eyebrow" style={{ '--ec': C.brand }}>— Cedi AI</p>
              <h2 className="section-h2">CediAi — your <span style={{ color: C.brand }}>AI shopping assistant.</span></h2>
              <p className="section-sub">Type anything. "Find me a laptop under GH₵3000," "Who sells Jollof near Legon?" — Cedi reads your intent and surfaces the best matching listings from across campus, instantly.</p>
              {[{ icon:'🧠', title:'Natural language search', desc:'No keywords needed. Ask like you would a friend who knows every listing.' },{ icon:'📦', title:'Rich product results', desc:'Gets back images, prices, conditions, and campus locations — not just links.' },{ icon:'💬', title:'Follow-up questions', desc:'"Show me cheaper ones" or "only KNUST sellers" — Cedi remembers the context.' }].map((f, i) => (<div key={i} className="ai-feature-row"><div className="ai-feature-icon">{f.icon}</div><div><div className="ai-feature-title">{f.title}</div><div className="ai-feature-desc">{f.desc}</div></div></div>))}
              <Link href="/ai-assistant" className="ai-try-btn">✦ Try CediAi — it's free</Link>
            </div>
            <div className="ai-demos-stack">{AI_DEMOS.slice(0, 3).map((demo, i) => (<AiDemoCard key={i} query={demo.q} icon={demo.icon} delay={i * 100} />))}</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: C.void }} ref={whyRef}>
        <div className="section-inner">
          <div className={`reveal ${whyVis ? 'shown' : ''}`} style={{ textAlign:'center', maxWidth:540, margin:'0 auto 52px' }}>
            <p className="section-eyebrow" style={{ '--ec': C.coral, textAlign:'center' }}>— Why CediMart</p>
            <h2 className="section-h2">Built specifically<br/><span style={{ color: C.coral }}>for campus life.</span></h2>
            <p className="section-sub" style={{ margin:'0 auto', textAlign:'center' }}>Not a clone of Jumia. Not a WhatsApp group. A marketplace designed from the ground up for how students buy and sell.</p>
          </div>
          <div className="why-grid">{WHY_ITEMS.map((item, i) => (<div key={i} className={`why-card reveal ${whyVis ? 'shown' : ''}`} style={{ '--wc': item.color, '--wb': item.color + '12', transitionDelay:`${i * 60}ms` }}><div className="why-icon">{item.icon}</div><div className="why-title">{item.title}</div><div className="why-desc">{item.desc}</div></div>))}</div>
        </div>
      </section>

      <section id="download" className="section" ref={ctaRef} style={{ background: C.surf }}>
        <div className="section-inner">
          <div className={`cta-wrap reveal ${ctaVis ? 'shown' : ''}`}>
            <div className="cta-noise" /><div className="cta-dot-grid" />
            <h2 className="cta-h2">Your campus marketplace<br/>is waiting.</h2>
            <p className="cta-sub">Join 10,000+ students already buying, selling, and growing on CediMart. Free forever.</p>
            <div className="cta-btns">
              <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="cta-btn-white">🍎 App Store</a>
              <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="cta-btn-ghost">▶ Google Play</a>
            </div>
            <form className="nl-form" onSubmit={e => { e.preventDefault(); setEmailDone(true); setEmail(''); }}>
              <input type="email" required placeholder="Get launch updates by email" className="nl-input" value={email} onChange={e => setEmail(e.target.value)} />
              <button type="submit" className="nl-btn">{emailDone ? '✓ Done' : 'Notify me'}</button>
            </form>
          </div>
        </div>
      </section>

      <FloatingAiButton />
    </div>
  );
}