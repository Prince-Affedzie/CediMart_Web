'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getAllProducts,getProductsByTag } from '@/apis/productApi';

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

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p == null ? '—' : `GH₵\u00A0${Number(p).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;

const CONDITION_MAP = {
  'new':           { label: 'New',        bg: '#10B98118', color: '#10B981' },
  'like-new':      { label: 'Like New',   bg: '#10B98118', color: '#10B981' },
  'excellent':     { label: 'Excellent',  bg: '#6366F118', color: '#818CF8' },
  'good':          { label: 'Good',       bg: '#F59E0B18', color: '#F59E0B' },
  'fair':          { label: 'Fair',       bg: '#F43F5E18', color: '#F87171' },
  'slightly-used': { label: 'Used',       bg: '#F43F5E18', color: '#F87171' },
  'for-parts':     { label: 'Parts',      bg: '#71717A18', color: '#71717A' },
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
  { icon:'🛡️', title:'Verified Sellers',    color:C.indigo,
    desc:'Every vendor submits a national ID and student card. Green badge = fully checked.' },
  { icon:'⚡', title:'List in 60 Seconds', color:C.amber,
    desc:'Photo, price, publish. Median listing time: 48 seconds. Your buyer could message within the hour.' },
  { icon:'🔒', title:'Private Messaging',   color:C.coral,
    desc:'Chat inside the app. Your phone number stays private until you choose to share it.' },
  { icon:'📊', title:'Live Analytics',      color:C.emerald,
    desc:'See real-time views, saves, and conversion rates on every product you list. No weekly reports.' },
  { icon:'📍', title:'Campus-Precise',      color:C.indigoL,
    desc:'Filter by campus, hostel, area. Find listings a 5-minute walk from your lecture hall.' },
  { icon:'🤝', title:'Safe Meet-ups',       color:C.amberL,
    desc:'Guided safe-location suggestions and in-app incident reporting for every transaction.' },
];

const STATS = [
  { v:'10K+',   l:'Students',   c:C.indigo  },
  { v:'2,500+', l:'Businesses', c:C.amber   },
  { v:'50K+',   l:'Listings',   c:C.coral   },
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

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

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
      <div
        className="prod-card"
        style={{
          animationDelay: `${index * 60}ms`,
          transform: isMobile ? 'none' : `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) ${hovered ? 'translateY(-6px)' : 'translateY(0)'}`,
          boxShadow: hovered && !isMobile
            ? `0 20px 50px rgba(0,0,0,.55), 0 0 0 1px ${C.indigo}40`
            : `0 4px 16px rgba(0,0,0,.35)`,
        }}
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onTouchStart={() => setIsMobile(true)}
      >
        {/* Image */}
        <div className="prod-img-wrap">
          {img ? (
            <img src={img} alt={product.name} className="prod-img"
              onError={e => { e.target.src = 'https://placehold.co/400x300/13131E/52525B?text=No+Image'; }} />
          ) : (
            <div className="prod-img-placeholder">{catIcon}</div>
          )}

          {/* Sale badge */}
          {isOnSale && (
            <span className="prod-badge" style={{ background: C.coral, color: '#fff', top: 10, right: 10 }}>
              -{pct}%
            </span>
          )}

          {/* Condition badge */}
          {cond && !isOnSale && (
            <span className="prod-badge" style={{ background: cond.bg, color: cond.color, top: 10, left: 10 }}>
              {cond.label}
            </span>
          )}

          {/* Negotiable */}
          {product.negotiable && (
            <span className="prod-badge" style={{ background: C.amberDim, color: C.amber, bottom: 10, left: 10, border: `1px solid ${C.amber}30` }}>
              Nego.
            </span>
          )}

          {/* Hover overlay - hidden on mobile */}
          <div className="prod-overlay" style={{ opacity: !isMobile && hovered ? 1 : 0 }}>
            <span className="prod-overlay-text">View listing →</span>
          </div>
        </div>

        {/* Info */}
        <div className="prod-info">
          <div className="prod-meta-row">
            <span className="prod-cat">{catIcon} {product.category?.replace(/-/g,' ') || 'Other'}</span>
            {product.campus && <span className="prod-campus">{product.campus}</span>}
          </div>

          <p className="prod-name">{product.name}</p>

          <div className="prod-foot">
            <div>
              {isOnSale && (
                <s className="prod-original">{fmtPrice(product.discountInfo.originalPrice)}</s>
              )}
              <span className="prod-price" style={{ color: isOnSale ? C.coral : C.amber }}>
                {fmtPrice(product.price)}
              </span>
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
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
          <span key={i} className="ticker-item">{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── AI demo conversation card ─────────────────────────────────────────────────
function AiDemoCard({ query, icon, delay = 0 }) {
  const [ref, vis] = useReveal(0.2);
  return (
    <div ref={ref} className={`ai-demo-card reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="ai-demo-q">
        <span className="ai-demo-icon">{icon}</span>
        <span className="ai-demo-q-text">{query}</span>
      </div>
      <div className="ai-demo-a">
        <div className="ai-demo-a-header">
          <span className="ai-demo-sparkle">✦</span>
          <span className="ai-demo-a-name">Ask Cedi</span>
        </div>
        <p className="ai-demo-a-text">
          I found <span style={{ color: C.emerald, fontWeight: 700 }}>4 listings</span> that match —
          let me show you the best options with prices, conditions, and campus locations.
        </p>
        <div className="ai-demo-chips">
          <span className="ai-demo-chip">📦 3 results</span>
          <span className="ai-demo-chip">🏫 2 campuses</span>
          <span className="ai-demo-chip">✅ All verified</span>
        </div>
      </div>
    </div>
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

  const [heroRef,   heroVis]   = useReveal(0.05);
  const [listRef,   listVis]   = useReveal(0.08);
  const [whyRef,    whyVis]    = useReveal(0.08);
  const [aiRef,     aiVis]     = useReveal(0.08);
  const [ctaRef,    ctaVis]    = useReveal(0.08);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchProducts = useCallback(async (filter) => {
  console.log('🔄 Fetching products for filter:', filter);
  setLoadingProds(true);
  try {
    let res;
    if (filter === 'all') {
      console.log('📡 Calling getProductsByTag featured...');
      try {
        res = await getProductsByTag('featured');
        console.log('✅ getProductsByTag response:', res);
      } catch (tagError) {
        console.warn('⚠️ Featured tag failed, falling back to getAllProducts');
        console.error('Tag error:', tagError);
        // Fallback to getAllProducts if tag endpoint fails
        res = await getAllProducts({ limit: 8, sort: 'newest' });
        console.log('✅ getAllProducts fallback response:', res);
      }
    } else {
      console.log('📡 Calling getProductsByCategory for:', filter);
      const { getProductsByCategory } = await import('@/apis/productApi');
      res = await getProductsByCategory(filter, { limit: 8, sort: 'newest' });
      console.log('✅ getProductsByCategory response:', res);
    }
    
    // Handle axios response structure
    const responseData = res?.data;
    console.log('📦 Response data:', responseData);
    
    // Try multiple data paths
    const data = responseData?.data?.products || 
                 responseData?.data?.data || 
                 responseData?.products || 
                 responseData?.data || 
                 responseData || 
                 [];
    
    console.log('📦 Extracted data:', data);
    console.log('📦 Is array?:', Array.isArray(data));
    
    setProducts(Array.isArray(data) ? data.slice(0, 10) : []);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    console.error('❌ Error details:', {
      message: err.message,
      code: err.code,
      response: err.response?.data,
      status: err.response?.status
    });
    setProducts([]);
  } finally {
    setLoadingProds(false);
    console.log('🏁 Fetch complete');
  }
}, []);

  useEffect(() => { fetchProducts(activeFilter); }, [activeFilter]);

  return (
    <div style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }} className="overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.void}; color: ${C.white}; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        ::selection { background: ${C.indigo}44; color: ${C.indigoL}; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes cardIn    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.2)} 50%{box-shadow:0 0 0 20px rgba(16,185,129,0)} }
        @keyframes indigoOrb { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes dotPulse  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
        @keyframes gradBG    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

        .reveal { transition: opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1); }
        .reveal:not(.shown) { opacity: 0; transform: translateY(22px); }
        .reveal.shown { opacity: 1; transform: translateY(0); }

        /* ── Hero ── */
        .hero {
          position: relative; overflow: hidden;
          padding: clamp(40px,8vw,140px) clamp(16px,4vw,80px) clamp(40px,8vw,100px);
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(20px,4vw,60px); align-items: center;
          max-width: 1280px; margin: 0 auto;
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
        @media(max-width:640px){
          .hero-glow{display: none;}
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: clamp(9px,2vw,11px); font-weight: 700; letter-spacing: .14em;
          text-transform: uppercase; color: ${C.indigoL};
          background: ${C.indigoDim}; border: 1px solid ${C.indigo}30;
          border-radius: 40px; padding: clamp(4px,1vw,6px) clamp(10px,2vw,14px); 
          margin-bottom: clamp(16px,3vw,24px);
        }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.indigo}; position: relative; }
        .live-dot::after { content:''; position: absolute; inset: -3px; border-radius: 50%; background: ${C.indigo}; animation: dotPulse 1.8s ease-out infinite; }
        .hero-h1 {
          font-size: clamp(28px,5vw,76px); font-weight: 900; line-height: 1.05;
          letter-spacing: -1.5px; margin-bottom: clamp(14px,2vw,22px);
        }
        .hero-h1-line2 { color: ${C.amber}; display: block; }
        .hero-sub { 
          font-size: clamp(14px,2vw,17px); color: ${C.off}; line-height: 1.72; 
          max-width: 440px; margin-bottom: clamp(24px,4vw,36px); 
        }
        .hero-btns { display: flex; gap: clamp(8px,2vw,12px); flex-wrap: wrap; margin-bottom: clamp(32px,5vw,48px); }
        .btn-primary {
          background: linear-gradient(135deg,${C.indigo},${C.indigoL});
          color: #fff; font-weight: 700; font-size: clamp(12px,2vw,14px);
          padding: clamp(10px,2vw,14px) clamp(16px,3vw,26px); border-radius: 14px; 
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 28px ${C.indigoDim}; transition: all .22s ease;
        }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 14px 36px ${C.indigoDim}; }
        .btn-secondary {
          background: ${C.surf}; color: ${C.white}; font-weight: 600; 
          font-size: clamp(12px,2vw,14px); padding: clamp(10px,2vw,14px) clamp(16px,3vw,26px); 
          border-radius: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid ${C.border}; transition: all .22s ease;
        }
        .btn-secondary:hover { border-color: ${C.amber}; color: ${C.amber}; }
        .hero-trust { display: flex; align-items: center; gap: clamp(10px,2vw,20px); flex-wrap: wrap; }
        .hero-stars { display: flex; gap: 2px; color: ${C.amber}; font-size: clamp(11px,2vw,13px); }
        .hero-trust-text { font-size: clamp(10px,1.5vw,12.5px); color: ${C.muted}; }
        .hero-trust-text strong { color: ${C.white}; }
        .hero-campus-pills { display: flex; gap: clamp(4px,1vw,7px); flex-wrap: wrap; }
        .campus-pill {
          font-size: clamp(8px,1.2vw,10px); font-weight: 700; color: ${C.off};
          background: ${C.elev}; border: 1px solid ${C.border};
          border-radius: 20px; padding: clamp(3px,0.5vw,4px) clamp(6px,1vw,10px);
          font-family: 'JetBrains Mono', monospace;
        }

        /* Hero visual — floating product stack */
        .hero-visual { position: relative; height: clamp(300px,40vw,480px); }
        .hero-card {
          position: absolute; background: ${C.surf}; border-radius: 18px;
          overflow: hidden; border: 1px solid ${C.border};
          box-shadow: 0 20px 50px rgba(0,0,0,.55);
          transition: transform .4s cubic-bezier(.22,1,.36,1);
          cursor: pointer;
        }
        .hero-card:hover { transform: translateY(-8px) scale(1.02) !important; z-index: 10 !important; }
        .hero-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero-card-label {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(0,0,0,.85), transparent);
          padding: 24px 14px 12px;
        }
        .hero-card-price { font-family: 'JetBrains Mono',monospace; font-size: 13px; font-weight: 700; color: ${C.amber}; }
        .hero-card-name  { font-size: 12px; color: rgba(255,255,255,.75); margin-top: 2px; }

        /* ── Ticker ── */
        .ticker-outer { 
          overflow: hidden; background: ${C.surf}; 
          border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border}; 
          padding: clamp(8px,1.5vw,12px) 0; 
        }
        .ticker-track { display: flex; gap: clamp(24px,4vw,48px); white-space: nowrap; animation: ticker 38s linear infinite; }
        .ticker-item  { font-size: clamp(11px,1.5vw,13px); color: ${C.off}; flex-shrink: 0; }

        /* ── Stats bar ── */
        .stats-bar { 
          background: ${C.surf}; border-bottom: 1px solid ${C.border}; 
          padding: clamp(24px,4vw,36px) clamp(16px,4vw,80px); 
        }
        .stats-inner { 
          max-width: 1280px; margin: 0 auto; 
          display: grid; grid-template-columns: repeat(4,1fr); gap: clamp(12px,2vw,24px); 
        }
        @media(max-width:640px){ 
          .stats-inner{grid-template-columns:repeat(2,1fr); gap: 20px;} 
        }
        .stat-item { border-left: 3px solid var(--sc); padding-left: clamp(12px,2vw,18px); }
        .stat-val { 
          font-size: clamp(24px,4vw,42px); font-weight: 900; 
          color: var(--sc); letter-spacing: -1px; line-height: 1; 
        }
        .stat-lbl { 
          font-size: clamp(9px,1.2vw,11px); font-weight: 600; color: ${C.muted}; 
          margin-top: 4px; letter-spacing: .12em; text-transform: uppercase; 
          font-family: 'JetBrains Mono',monospace; 
        }

        /* ── Listings section ── */
        .section { padding: clamp(40px,6vw,100px) clamp(16px,4vw,80px); overflow: hidden; width: 100%; max-width: 100vw; }
        .section-inner { max-width: 1280px; margin: 0 auto; }
        .section-eyebrow { 
          font-size: clamp(9px,1.3vw,10.5px); font-weight: 700; letter-spacing: .18em; 
          text-transform: uppercase; color: var(--ec); margin-bottom: clamp(10px,2vw,14px); 
          font-family: 'JetBrains Mono',monospace; 
        }
        .section-h2 { 
          font-size: clamp(22px,3.5vw,48px); font-weight: 800; line-height: 1.1; 
          letter-spacing: -1px; margin-bottom: clamp(10px,2vw,14px); 
        }
        .section-sub { 
          font-size: clamp(13px,2vw,15px); color: ${C.off}; line-height: 1.7; 
          max-width: 520px; margin-bottom: clamp(24px,4vw,36px); 
        }

        /* Filter pills */
        .filter-row { display: flex; gap: clamp(4px,1vw,8px); flex-wrap: wrap; margin-bottom: clamp(20px,3vw,32px); }
        .filter-pill {
          font-size: clamp(11px,1.5vw,12.5px); font-weight: 600; 
          padding: clamp(5px,1vw,7px) clamp(12px,2vw,16px); border-radius: 40px; cursor: pointer;
          border: 1.5px solid ${C.border}; background: none; color: ${C.off};
          transition: all .22s ease; font-family: 'Plus Jakarta Sans',sans-serif;
          white-space: nowrap;
        }
        .filter-pill:hover  { border-color: ${C.indigoL}; color: ${C.indigoL}; }
        .filter-pill.active { 
          background: linear-gradient(135deg,${C.indigo},${C.indigoL}); 
          border-color: transparent; color: #fff; box-shadow: 0 4px 16px ${C.indigoDim}; 
        }

        /* Product grid */
        .prod-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill,minmax(clamp(160px,25vw,220px),1fr)); 
          gap: clamp(12px,2vw,18px); 
        }
        @media(max-width:480px){
          .prod-grid{grid-template-columns: repeat(2,1fr); gap: 10px;}
        }
        .prod-card {
          background: ${C.surf}; border-radius: clamp(12px,2vw,18px); overflow: hidden;
          border: 1px solid ${C.border};
          transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s, border-color .22s;
          cursor: pointer; text-decoration: none; display: block;
          opacity: 0; animation: cardIn .5s ease forwards;
        }
        .prod-img-wrap { 
          position: relative; height: clamp(130px,20vw,180px); 
          background: ${C.elev}; overflow: hidden; 
        }
        .prod-img { 
          width: 100%; height: 100%; object-fit: cover; 
          transition: transform .4s ease; display: block; 
        }
        .prod-card:hover .prod-img { transform: scale(1.05); }
        .prod-img-placeholder { 
          width: 100%; height: 100%; display: flex; 
          align-items: center; justify-content: center; 
          font-size: clamp(28px,4vw,42px); 
        }
        .prod-badge {
          position: absolute; font-size: clamp(8px,1.1vw,9.5px); font-weight: 800;
          padding: clamp(2px,0.5vw,3px) clamp(5px,1vw,8px); 
          border-radius: 8px; letter-spacing: .03em;
        }
        .prod-overlay {
          position: absolute; inset: 0; background: rgba(99,102,241,.18);
          display: flex; align-items: center; justify-content: center;
          transition: opacity .22s;
        }
        .prod-overlay-text { 
          font-size: clamp(11px,1.5vw,13px); font-weight: 700; color: #fff; 
          background: ${C.indigo}; padding: clamp(5px,1vw,7px) clamp(12px,2vw,16px); 
          border-radius: 40px; 
        }
        .prod-info { 
          padding: clamp(10px,1.5vw,14px) clamp(12px,2vw,16px) clamp(12px,2vw,16px); 
          display: flex; flex-direction: column; gap: clamp(4px,1vw,6px); 
        }
        .prod-meta-row{ display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; }
        .prod-cat { 
          font-size: clamp(9px,1.1vw,10px); font-weight: 700; 
          color: ${C.muted}; text-transform: capitalize; 
        }
        .prod-campus { 
          font-size: clamp(8px,1vw,9.5px); font-weight: 700; color: ${C.indigoL}; 
          font-family: 'JetBrains Mono',monospace; background: ${C.indigoDim}; 
          padding: 2px 7px; border-radius: 8px; white-space: nowrap;
        }
        .prod-name { 
          font-size: clamp(12px,1.6vw,14px); font-weight: 700; color: ${C.white}; 
          line-height: 1.38; display: -webkit-box; -webkit-line-clamp: 2; 
          -webkit-box-orient: vertical; overflow: hidden; 
        }
        .prod-foot { 
          display: flex; align-items: flex-end; justify-content: space-between; 
          margin-top: clamp(2px,0.5vw,4px); 
        }
        .prod-original{ 
          font-size: clamp(9px,1.2vw,10.5px); color: ${C.muted}; 
          text-decoration: line-through; display: block; margin-bottom: 1px; 
          font-family: 'JetBrains Mono',monospace; 
        }
        .prod-price { 
          font-size: clamp(14px,2vw,17px); font-weight: 800; 
          font-family: 'JetBrains Mono',monospace; display: block; 
        }
        .prod-view-btn{ 
          font-size: clamp(10px,1.3vw,12px); font-weight: 700; 
          background: ${C.indigoDim}; color: ${C.indigoL}; 
          border: 1px solid ${C.indigo}30; padding: clamp(5px,1vw,7px) clamp(10px,1.5vw,13px); 
          border-radius: 10px; white-space: nowrap; transition: all .2s; 
        }
        .prod-card:hover .prod-view-btn { background: ${C.indigo}; color: #fff; border-color: transparent; }

        /* Skeleton */
        .sk-card { 
          background: ${C.surf}; border-radius: 18px; overflow: hidden; 
          border: 1px solid ${C.border}; 
          animation: shimmer 1.8s ease-in-out infinite; 
          background: linear-gradient(90deg,${C.surf} 25%,${C.elev} 50%,${C.surf} 75%); 
          background-size: 400% 100%; 
        }
        .sk-img  { height: clamp(130px,20vw,180px); background: ${C.elev}; }
        .sk-line { border-radius: 6px; background: ${C.elev}; }

        /* View all button */
        .view-all-wrap { display: flex; justify-content: center; margin-top: clamp(24px,4vw,36px); }
        .view-all-btn { 
          border: 1.5px solid ${C.border}; color: ${C.off}; 
          font-weight: 600; font-size: clamp(12px,2vw,14px); 
          padding: clamp(10px,2vw,12px) clamp(20px,3vw,28px); 
          border-radius: 12px; text-decoration: none; transition: all .22s; 
        }
        .view-all-btn:hover { border-color: ${C.indigoL}; color: ${C.indigoL}; }

        /* ── Cedi AI section ── */
        .ai-section {
          background: radial-gradient(ellipse at 60% 0%, rgba(16,185,129,.08) 0%, transparent 60%), ${C.surf};
          border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border};
        }
        .ai-split { 
          display: grid; grid-template-columns: 1fr 1fr; 
          gap: clamp(24px,5vw,72px); align-items: center; 
          max-width: 1280px; margin: 0 auto; 
        }
        @media(max-width:900px){ 
          .ai-split{grid-template-columns:1fr; gap: 32px;} 
          .ai-demos-stack{max-width: 500px; margin: 0 auto;}
        }
        .ai-orb {
          width: clamp(40px,5vw,56px); height: clamp(40px,5vw,56px); 
          border-radius: 50%; background: rgba(16,185,129,.1); 
          border: 1px solid rgba(16,185,129,.25);
          display: flex; align-items: center; justify-content: center; 
          font-size: clamp(18px,2.5vw,24px);
          margin-bottom: clamp(14px,2vw,22px); 
          animation: orbPulse 3s ease-in-out infinite;
        }
        .ai-feature-row { 
          display: flex; align-items: flex-start; gap: clamp(10px,1.5vw,14px); 
          padding: clamp(14px,2vw,18px) 0; border-bottom: 1px solid ${C.border}40; 
        }
        .ai-feature-row:last-child { border-bottom: none; }
        .ai-feature-icon { 
          width: clamp(32px,3vw,38px); height: clamp(32px,3vw,38px); 
          border-radius: 10px; background: rgba(16,185,129,.1); 
          display: flex; align-items: center; justify-content: center; 
          font-size: clamp(14px,2vw,17px); flex-shrink: 0; 
        }
        .ai-feature-title { font-size: clamp(13px,1.6vw,14px); font-weight: 700; color: ${C.white}; margin-bottom: 3px; }
        .ai-feature-desc  { font-size: clamp(11px,1.4vw,13px); color: ${C.off}; line-height: 1.6; }
        .ai-try-btn {
          display: inline-flex; align-items: center; gap: 8px; 
          margin-top: clamp(20px,3vw,28px);
          background: ${C.emerald}; color: #000; font-weight: 800; 
          font-size: clamp(12px,1.5vw,14px);
          padding: clamp(10px,1.5vw,13px) clamp(18px,2.5vw,24px); 
          border-radius: 14px; text-decoration: none;
          transition: all .22s; box-shadow: 0 6px 22px rgba(16,185,129,.25);
        }
        .ai-try-btn:hover { filter: brightness(1.08); transform: translateY(-2px); }

        /* Demo cards */
        .ai-demo-card {
          background: ${C.void}; border: 1px solid ${C.border};
          border-radius: 18px; overflow: hidden;
        }
        .ai-demo-q {
          display: flex; align-items: center; gap: 10px;
          padding: clamp(10px,1.5vw,14px) clamp(12px,2vw,16px); 
          border-bottom: 1px solid ${C.border}; background: ${C.elev};
        }
        .ai-demo-icon    { font-size: clamp(16px,2vw,18px); }
        .ai-demo-q-text  { font-size: clamp(12px,1.5vw,14px); font-weight: 600; color: ${C.white}; }
        .ai-demo-a { padding: clamp(10px,1.5vw,14px) clamp(12px,2vw,16px) clamp(12px,2vw,16px); }
        .ai-demo-a-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
        .ai-demo-sparkle { color: ${C.emerald}; font-size: 12px; }
        .ai-demo-a-name  { font-size: clamp(10px,1.2vw,11px); font-weight: 700; color: ${C.emerald}; text-transform: uppercase; letter-spacing: .06em; }
        .ai-demo-a-text  { font-size: clamp(11px,1.4vw,13.5px); color: ${C.off}; line-height: 1.65; margin-bottom: 12px; }
        .ai-demo-chips   { display: flex; gap: 7px; flex-wrap: wrap; }
        .ai-demo-chip    { 
          font-size: clamp(10px,1.2vw,11px); font-weight: 600; color: ${C.emerald}; 
          background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.2); 
          border-radius: 20px; padding: 4px 11px; 
        }
        .ai-demos-stack  { display: flex; flex-direction: column; gap: clamp(10px,1.5vw,14px); }

        /* ── Why section ── */
        .why-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill,minmax(clamp(250px,30vw,280px),1fr)); 
          gap: clamp(12px,1.5vw,16px); 
        }
        @media(max-width:640px){
          .why-grid{grid-template-columns: 1fr;}
        }
        .why-card {
          background: ${C.surf}; border: 1px solid ${C.border}; 
          border-radius: 18px; padding: clamp(20px,3vw,26px); 
          transition: all .28s ease;
        }
        .why-card:hover { 
          transform: translateY(-4px); border-color: var(--wc)30; 
          background: ${C.elev}; box-shadow: 0 16px 40px rgba(0,0,0,.4); 
        }
        .why-icon { 
          width: clamp(36px,4vw,44px); height: clamp(36px,4vw,44px); 
          border-radius: 13px; background: var(--wb); 
          display: flex; align-items: center; justify-content: center; 
          font-size: clamp(16px,2vw,20px); margin-bottom: clamp(12px,2vw,16px); 
        }
        .why-title{ font-size: clamp(13px,1.6vw,15px); font-weight: 700; color: ${C.white}; margin-bottom: 7px; }
        .why-desc { font-size: clamp(12px,1.4vw,13.5px); color: ${C.off}; line-height: 1.65; }

        /* ── CTA section ── */
        .cta-wrap {
          background: linear-gradient(135deg,${C.indigo} 0%,#4F46E5 40%,${C.coral} 100%);
          background-size: 200% 200%; animation: gradBG 8s ease infinite;
          border-radius: clamp(20px,3vw,28px); 
          padding: clamp(32px,5vw,80px) clamp(20px,4vw,80px);
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: .04;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .cta-dot-grid {
          position: absolute; inset: 0; pointer-events: none; opacity: .06;
          background-image: radial-gradient(circle,#fff 1px,transparent 1px);
          background-size: 28px 28px;
        }
        .cta-h2 { 
          font-size: clamp(24px,4vw,58px); font-weight: 900; color: #fff; 
          line-height: 1.05; letter-spacing: -1.5px; margin-bottom: clamp(12px,2vw,16px); 
          position: relative; 
        }
        .cta-sub { 
          font-size: clamp(13px,1.8vw,16px); color: rgba(255,255,255,.75); 
          max-width: 440px; margin: 0 auto clamp(24px,4vw,36px); 
          line-height: 1.7; position: relative; 
        }
        .cta-btns { 
          display: flex; gap: clamp(8px,1.5vw,12px); justify-content: center; 
          flex-wrap: wrap; position: relative; 
        }
        @media(max-width:480px){
          .cta-btns{flex-direction: column; align-items: center;}
          .cta-btns a{width: 100%; justify-content: center;}
        }
        .cta-btn-white { 
          background: #fff; color: #000; font-weight: 800; 
          font-size: clamp(12px,1.5vw,14px); 
          padding: clamp(10px,1.5vw,14px) clamp(20px,3vw,28px); 
          border-radius: 14px; text-decoration: none; 
          display: inline-flex; align-items: center; gap: 8px; 
          box-shadow: 0 8px 28px rgba(0,0,0,.2); transition: all .22s; 
        }
        .cta-btn-white:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,.3); }
        .cta-btn-ghost { 
          background: rgba(255,255,255,.12); color: #fff; font-weight: 700; 
          font-size: clamp(12px,1.5vw,14px); 
          padding: clamp(10px,1.5vw,14px) clamp(20px,3vw,28px); 
          border-radius: 14px; text-decoration: none; 
          display: inline-flex; align-items: center; gap: 8px; 
          border: 1.5px solid rgba(255,255,255,.3); 
          backdrop-filter: blur(8px); transition: all .22s; 
        }
        .cta-btn-ghost:hover { background: rgba(255,255,255,.2); }

        /* ── Newsletter ── */
        .nl-form { 
          display: flex; gap: 8px; max-width: 400px; 
          margin: clamp(18px,3vw,24px) auto 0; 
        }
        @media(max-width:480px){
          .nl-form{flex-direction: column; gap: 12px;}
        }
        .nl-input { 
          flex: 1; background: rgba(255,255,255,.1); 
          border: 1.5px solid rgba(255,255,255,.2); border-radius: 12px; 
          padding: clamp(10px,1.5vw,12px) clamp(12px,2vw,16px); 
          color: #fff; font-size: clamp(12px,1.5vw,14px); 
          font-family: 'Plus Jakarta Sans',sans-serif; outline: none; 
          min-width: 0;
        }
        .nl-input::placeholder { color: rgba(255,255,255,.45); }
        .nl-input:focus { 
          border-color: rgba(255,255,255,.5); 
          background: rgba(255,255,255,.14); 
        }
        .nl-btn { 
          background: #fff; color: ${C.indigo}; font-weight: 800; 
          font-size: clamp(11px,1.4vw,13px); 
          padding: clamp(10px,1.5vw,12px) clamp(14px,2vw,18px); 
          border-radius: 12px; border: none; cursor: pointer; 
          transition: all .2s; font-family: 'Plus Jakarta Sans',sans-serif; 
          flex-shrink: 0; white-space: nowrap;
        }
        .nl-btn:hover { transform: scale(1.03); }

        /* Additional mobile optimizations */
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
      <section ref={heroRef} style={{ background: `radial-gradient(ellipse at 30% 50%, rgba(99,102,241,.09) 0%, transparent 55%), ${C.void}` }}>
        <div className="hero-glow" style={{ width: isMobile ? 300 : 600, height: isMobile ? 300 : 600, top:'-20%', left:'-10%', background:`radial-gradient(circle, rgba(99,102,241,.08), transparent)`, animation:'indigoOrb 8s ease-in-out infinite' }}/>
        <div className="hero-glow" style={{ width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, bottom:'0', right:'5%', background:`radial-gradient(circle, rgba(245,158,11,.06), transparent)` }}/>

        <div className={`hero reveal ${heroVis ? 'shown' : ''}`}>
          <div>
            <div className="hero-eyebrow">
              <span className="live-dot"/>
              Live across 8 campuses in Ghana
            </div>

            <h1 className="hero-h1">
              Your Campus.<br/>
              <span className="hero-h1-line2">Your Marketplace.</span>
            </h1>

            <p className="hero-sub">
              CediMart connects students across Ghana's top universities — buy textbooks, sell electronics, discover food vendors, and grow a real business, all within walking distance.
            </p>

            <div className="hero-btns">
              <Link href="#listings" className="btn-primary">Browse Listings →</Link>
              <Link href="ai-assistant" className="btn-secondary">✦ Try CediAi</Link>
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


<div className="hero-visual">
  {products.length > 0 ? (
    products.slice(0, 4).map((product, i) => {
      const positions = [
        { width: isMobile ? 140 : 200, height: isMobile ? 160 : 220, top: 0,   left: isMobile ? 30 : 60,  transform: 'rotate(-6deg)', zIndex: 2 },
        { width: isMobile ? 130 : 185, height: isMobile ? 150 : 210, top: 40,  left: isMobile ? 150 : 240, transform: 'rotate(5deg)',  zIndex: 3 },
        { width: isMobile ? 135 : 190, height: isMobile ? 155 : 215, top: 210, left: 20,  transform: 'rotate(-3deg)', zIndex: 1 },
        { width: isMobile ? 125 : 175, height: isMobile ? 145 : 195, top: 220, left: 240, transform: 'rotate(8deg)',  zIndex: 0 },
      ];
      
      const pos = positions[i] || positions[0];
      const img = product.images?.[0] || product.image || null;
      const fallbackImg = 'https://placehold.co/400x300/1C1C2E/6B7280?text=No+Image';
      
      return (
        <Link 
          key={product._id || i} 
          href={`/product/${product._id}`}
          className="hero-card" 
          style={{ ...pos }}
        >
          <img 
            src={img || fallbackImg} 
            alt={product.name} 
            onError={e => { e.target.src = fallbackImg; }} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div className="hero-card-label">
            <div className="hero-card-price">
              GH₵ {Number(product.price).toLocaleString()}
            </div>
            <div className="hero-card-name">{product.name}</div>
          </div>
        </Link>
      );
    })
  ) : (
    // Fallback placeholder cards when no products loaded yet
    [
      { name: 'Loading...', price: '—', style: { width: isMobile ? 140 : 200, height: isMobile ? 160 : 220, top: 0, left: isMobile ? 30 : 60, transform: 'rotate(-6deg)', zIndex: 2 } },
      { name: 'Loading...', price: '—', style: { width: isMobile ? 130 : 185, height: isMobile ? 150 : 210, top: 40, left: isMobile ? 150 : 240, transform: 'rotate(5deg)', zIndex: 3 } },
      { name: 'Loading...', price: '—', style: { width: isMobile ? 135 : 190, height: isMobile ? 155 : 215, top: 210, left: 20, transform: 'rotate(-3deg)', zIndex: 1 } },
      { name: 'Loading...', price: '—', style: { width: isMobile ? 125 : 175, height: isMobile ? 145 : 195, top: 220, left: 240, transform: 'rotate(8deg)', zIndex: 0 } },
    ].map((card, i) => (
      <div key={i} className="hero-card" style={{ ...card.style }}>
        <div style={{ width: '100%', height: '100%', background: C.elev, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          📦
        </div>
        <div className="hero-card-label">
          <div className="hero-card-price">{card.price}</div>
          <div className="hero-card-name">{card.name}</div>
        </div>
      </div>
    ))
  )}
</div>
        </div>
      </section>

      <Ticker />

      <div className="stats-bar">
        <div className="stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item" style={{ '--sc': s.c }}>
              <div className="stat-val">{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <section id="listings" className="section" style={{ background: C.void }}>
        <div className="section-inner">
          <div ref={listRef} className={`reveal ${listVis ? 'shown' : ''}`}>
            <p className="section-eyebrow" style={{ '--ec': C.amber }}>— Browse</p>
            <h2 className="section-h2">
              What's selling on campus
              <span style={{ color: C.amber }}> right now.</span>
            </h2>
            <p className="section-sub">
              Fresh listings added daily by verified student sellers — from course materials and electronics to food and fashion.
            </p>
          </div>

          <div className="filter-row">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`filter-pill${activeFilter === cat.key ? ' active' : ''}`}
                onClick={() => setActiveFilter(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loadingProds ? (
            <div className="prod-grid">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 0', color: C.muted }}>
              <p style={{ fontSize:42, marginBottom:12 }}>📦</p>
              <p style={{ fontSize:16 }}>No listings found for this category right now.</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((product, i) => (
                <ProductCard key={product._id || i} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="view-all-wrap">
            <Link href="/listings" className="view-all-btn">View all listings →</Link>
          </div>
        </div>
      </section>

      <section id="ai-assistant" className="section ai-section" ref={aiRef}>
        <div className="section-inner">
          <div className="ai-split">
            <div className={`reveal ${aiVis ? 'shown' : ''}`}>
              <div className="ai-orb">✦</div>
              <p className="section-eyebrow" style={{ '--ec': C.emerald }}>— Cedi AI</p>
              <h2 className="section-h2" style={{ color: C.white }}>
                CediAi — your{' '}
                <span style={{ color: C.emerald }}>AI shopping assistant.</span>
              </h2>
              <p className="section-sub">
                Type anything. "Find me a laptop under GH₵3000," "Who sells Jollof near Legon?" — Cedi reads your intent and surfaces the best matching listings from across campus, instantly.
              </p>

              {[
                { icon:'🧠', title:'Natural language search', desc:'No keywords needed. Ask like you would a friend who knows every listing.' },
                { icon:'📦', title:'Rich product results',    desc:'Gets back images, prices, conditions, and campus locations — not just links.' },
                { icon:'💬', title:'Follow-up questions',    desc:'"Show me cheaper ones" or "only KNUST sellers" — Cedi remembers the context.' },
              ].map((f, i) => (
                <div key={i} className="ai-feature-row">
                  <div className="ai-feature-icon">{f.icon}</div>
                  <div>
                    <div className="ai-feature-title">{f.title}</div>
                    <div className="ai-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}

              <Link href="/ai-assistant" className="ai-try-btn">
                ✦ Try CediAi — it's free
              </Link>
            </div>

            <div className="ai-demos-stack">
              {AI_DEMOS.slice(0, 3).map((demo, i) => (
                <AiDemoCard key={i} query={demo.q} icon={demo.icon} delay={i * 100} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: C.void }} ref={whyRef}>
        <div className="section-inner">
          <div className={`reveal ${whyVis ? 'shown' : ''}`} style={{ textAlign:'center', maxWidth:540, margin:'0 auto 52px' }}>
            <p className="section-eyebrow" style={{ '--ec': C.coral, textAlign:'center' }}>— Why CediMart</p>
            <h2 className="section-h2">Built specifically<br/>
              <span style={{ color: C.coral }}>for campus life.</span>
            </h2>
            <p className="section-sub" style={{ margin:'0 auto', textAlign:'center' }}>
              Not a clone of Jumia. Not a WhatsApp group. A marketplace designed from the ground up for how students buy and sell.
            </p>
          </div>

          <div className="why-grid">
            {WHY_ITEMS.map((item, i) => (
              <div key={i} className={`why-card reveal ${whyVis ? 'shown' : ''}`}
                style={{ '--wc': item.color, '--wb': item.color + '15', transitionDelay:`${i * 60}ms` }}>
                <div className="why-icon">{item.icon}</div>
                <div className="why-title">{item.title}</div>
                <div className="why-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="download" className="section" ref={ctaRef} style={{ background: C.surf }}>
        <div className="section-inner">
          <div className={`cta-wrap reveal ${ctaVis ? 'shown' : ''}`}>
            <div className="cta-noise" />
            <div className="cta-dot-grid" />
            <h2 className="cta-h2">Your campus marketplace<br/>is waiting.</h2>
            <p className="cta-sub">Join 10,000+ students already buying, selling, and growing on CediMart. Free forever.</p>
            <div className="cta-btns">
              <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="cta-btn-white">
                🍎 App Store
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="cta-btn-ghost">
                ▶ Google Play
              </a>
            </div>
            <form
              className="nl-form"
              onSubmit={e => { e.preventDefault(); setEmailDone(true); setEmail(''); }}
            >
              <input
                type="email" required placeholder="Get launch updates by email"
                className="nl-input" value={email} onChange={e => setEmail(e.target.value)}
              />
              <button type="submit" className="nl-btn">
                {emailDone ? '✓ Done' : 'Notify me'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}