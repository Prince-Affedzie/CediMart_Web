// src/app/sell/page.js
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

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ value, label, icon, delay = 0 }) {
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
      if (current >= numValue) { setCount(numValue); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [vis, value]);

  return (
    <div ref={ref} className={`se-stat reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <span className="se-stat-icon">{icon}</span>
      <span className="se-stat-value">{count.toLocaleString()}{value.replace(/[0-9]/g, '')}</span>
      <span className="se-stat-label">{label}</span>
    </div>
  );
}

// ─── Benefit Card ──────────────────────────────────────────────────────────────
function BenefitCard({ icon, title, description, color, delay = 0 }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} className={`se-benefit reveal ${vis ? 'shown' : ''}`} style={{ '--bc': color, transitionDelay: `${delay}ms` }}>
      <div className="se-benefit-icon" style={{ background: `${color}18`, color }}>{icon}</div>
      <h3 className="se-benefit-title">{title}</h3>
      <p className="se-benefit-desc">{description}</p>
    </div>
  );
}

// ─── Step Card ─────────────────────────────────────────────────────────────────
function StepCard({ number, title, description, emoji, delay = 0 }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} className={`se-step reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="se-step-number">{number}</div>
      <div className="se-step-emoji">{emoji}</div>
      <h3 className="se-step-title">{title}</h3>
      <p className="se-step-desc">{description}</p>
    </div>
  );
}

// ─── Testimonial Card ──────────────────────────────────────────────────────────
function TestimonialCard({ name, campus, text, emoji, delay = 0 }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} className={`se-testimonial reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <p className="se-testimonial-text">"{text}"</p>
      <div className="se-testimonial-author">
        <span className="se-testimonial-emoji">{emoji}</span>
        <div>
          <span className="se-testimonial-name">{name}</span>
          <span className="se-testimonial-campus">{campus}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SellPage() {
  const [heroRef, heroVis] = useReveal(0.05);
  const [benefitsRef, benefitsVis] = useReveal(0.1);
  const [stepsRef, stepsVis] = useReveal(0.1);
  const [testimonialsRef, testimonialsVis] = useReveal(0.1);
  const [faqRef, faqVis] = useReveal(0.1);
  const [activeFaq, setActiveFaq] = useState(null);

  const benefits = [
    { icon: '🚀', title: 'List in 60 Seconds', description: 'Snap a photo, set a price, and your item is live. Our AI can even write your description for you.', color: C.emerald },
    { icon: '👥', title: 'Reach 10,000+ Students', description: 'Your products are visible to thousands of active buyers across 8 campuses in Ghana.', color: C.indigo },
    { icon: '🛡️', title: 'Verified Badge', description: 'Get a green verified badge that builds instant trust with buyers and increases your sales.', color: C.amber },
    { icon: '📊', title: 'Track Performance', description: 'See real-time views, inquiries, and sales data for every product you list.', color: C.coral },
    { icon: '💬', title: 'In-App Chat', description: 'Communicate with buyers securely without sharing your personal phone number.', color: C.indigoL },
    { icon: '💰', title: 'Keep 100% of Sales', description: 'No listing fees, no commission, no hidden charges. What you earn is yours to keep.', color: '#34D399' },
  ];

  const steps = [
    { number: '01', title: 'Create Your Account', description: 'Sign up with your phone number in under 2 minutes. No paperwork, no waiting.', emoji: '📝' },
    { number: '02', title: 'List Your Products', description: 'Upload photos, add details (or let AI do it), and publish. Your items go live instantly.', emoji: '📸' },
    { number: '03', title: 'Start Earning', description: 'Buyers find your listings, chat with you, and you arrange meet-ups. You keep every cedi.', emoji: '💵' },
  ];

  const testimonials = [
    { name: 'Kwame O.', campus: 'KNUST', text: 'I sold my old textbooks within 48 hours of listing. Made enough to buy new ones for the semester. CediMart is a lifesaver!', emoji: '👨🏾‍🎓' },
    { name: 'Serwaa A.', campus: 'UG', text: 'Started selling homemade snacks as a side hustle. Now I get 20+ orders weekly through CediMart. The app makes it so easy.', emoji: '👩🏾‍🍳' },
    { name: 'Yaw B.', campus: 'UPSA', text: 'Built a small phone accessories business just from listing on CediMart. The AI helped me write better descriptions that actually sell.', emoji: '👨🏾‍💼' },
  ];

  const faqs = [
    { q: 'Is it really free to sell?', a: 'Yes! CediMart charges zero listing fees and zero commission. Every cedi you earn is yours. We believe students should keep 100% of what they make.' },
    { q: 'How do I get verified?', a: 'After signing up, submit your national ID and student card through the app. Our team reviews it within 24 hours. Once approved, you get a green verified badge.' },
    { q: 'What can I sell?', a: 'Almost anything! Electronics, fashion, books, food, services, hostel items, and more. If students need it, you can sell it. We have 15+ categories.' },
    { q: 'How do buyers pay me?', a: 'Buyers contact you through in-app chat. You arrange meet-up or delivery on campus and get paid directly — cash or Mobile Money. CediMart doesn\'t hold your money.' },
  ];

  return (
    <>
      <style>{sellStyles}</style>
      <div className="se-page">
        {/* ══════════════════════ HERO ══════════════════════ */}
        <section ref={heroRef} className="se-hero">
          <div className="se-hero-bg">
            <div className="se-hero-orb" style={{ top: '-15%', right: '-5%', background: 'radial-gradient(circle, rgba(99,102,241,.12), transparent)' }} />
            <div className="se-hero-orb" style={{ bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(16,185,129,.1), transparent)' }} />
          </div>
          <div className={`se-hero-content reveal ${heroVis ? 'shown' : ''}`}>
            <div className="se-hero-badge">
              <span className="se-hero-badge-dot" />
              Start earning today — no fees, no catch
            </div>
            <h1 className="se-hero-title">
              Turn your stuff into
              <span className="se-hero-highlight"> extra cash.</span>
            </h1>
            <p className="se-hero-subtitle">
              Join 2,500+ student sellers on CediMart. List anything in 60 seconds, reach thousands of buyers across Ghana's campuses, and keep every cedi you earn.
            </p>
            <div className="se-hero-btns">
              <Link href="/vendor/signup" className="se-hero-btn primary">
                Start Selling — It's Free →
              </Link>
              <Link href="/vendor/login" className="se-hero-btn secondary">
                I Already Have an Account
              </Link>
            </div>
            <div className="se-hero-trust">
              <span>✅ No listing fees</span>
              <span className="se-hero-trust-dot">·</span>
              <span>✅ 0% commission</span>
              <span className="se-hero-trust-dot">·</span>
              <span>✅ Live in minutes</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════ STATS ══════════════════════ */}
        <section className="se-stats-strip">
          <div className="se-stats-inner">
            <AnimatedCounter value="2500+" label="Active Sellers" icon="👥" delay={0} />
            <AnimatedCounter value="50000+" label="Products Listed" icon="📦" delay={100} />
            <AnimatedCounter value="10000+" label="Active Buyers" icon="🛒" delay={200} />
            <AnimatedCounter value="0%" label="Commission Fees" icon="💰" delay={300} />
          </div>
        </section>

        {/* ══════════════════════ BENEFITS ══════════════════════ */}
        <section ref={benefitsRef} className="se-section">
          <div className="se-section-inner">
            <div className={`reveal ${benefitsVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="se-eyebrow">— Why Sell on CediMart</p>
              <h2 className="se-section-title">
                Built for student
                <span style={{ color: C.emerald }}> entrepreneurs.</span>
              </h2>
              <p className="se-section-sub">
                Everything you need to start and grow your campus business — completely free.
              </p>
            </div>
            <div className="se-benefits-grid">
              {benefits.map((b, i) => <BenefitCard key={i} {...b} delay={i * 80} />)}
            </div>
          </div>
        </section>

        {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
        <section ref={stepsRef} className="se-section se-steps-section">
          <div className="se-section-inner">
            <div className={`reveal ${stepsVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="se-eyebrow">— How It Works</p>
              <h2 className="se-section-title">
                Start selling in
                <span style={{ color: C.amber }}> 3 simple steps.</span>
              </h2>
            </div>
            <div className="se-steps-grid">
              {steps.map((s, i) => <StepCard key={i} {...s} delay={i * 120} />)}
            </div>
            <div className="se-steps-cta">
              <Link href="/vendor/signup" className="se-hero-btn primary">Create Your Free Account →</Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
        <section ref={testimonialsRef} className="se-section">
          <div className="se-section-inner">
            <div className={`reveal ${testimonialsVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 40 }}>
              <p className="se-eyebrow">— Success Stories</p>
              <h2 className="se-section-title">
                Hear from student
                <span style={{ color: C.coral }}> sellers like you.</span>
              </h2>
            </div>
            <div className="se-testimonials-grid">
              {testimonials.map((t, i) => <TestimonialCard key={i} {...t} delay={i * 100} />)}
            </div>
          </div>
        </section>

        {/* ══════════════════════ FAQ ══════════════════════ */}
        <section ref={faqRef} className="se-section se-faq-section">
          <div className="se-section-inner">
            <div className={`reveal ${faqVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 36 }}>
              <p className="se-eyebrow">— FAQ</p>
              <h2 className="se-section-title">
                Got questions?
                <span style={{ color: C.indigoL }}> We've got answers.</span>
              </h2>
            </div>
            <div className="se-faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className={`se-faq-item ${activeFaq === i ? 'open' : ''}`}>
                  <button className="se-faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    <span className="se-faq-arrow">▼</span>
                  </button>
                  <div className="se-faq-a"><p>{faq.a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ BOTTOM CTA ══════════════════════ */}
        <section className="se-section">
          <div className="se-section-inner">
            <div className="se-bottom-cta">
              <div className="se-bottom-cta-glow" />
              <h2 className="se-bottom-cta-title">Ready to start earning?</h2>
              <p className="se-bottom-cta-sub">
                Join thousands of students already making money on CediMart. It's free, fast, and takes less than 2 minutes to set up.
              </p>
              <div className="se-bottom-cta-btns">
                <Link href="/vendor/signup" className="se-bottom-btn primary">
                  🚀 Create Your Vendor Account
                </Link>
                <Link href="/vendor/login" className="se-bottom-btn secondary">
                  Sign In to Existing Account
                </Link>
              </div>
              <p className="se-bottom-note">
                📱 For the full selling experience with AI product descriptions, order management, and analytics —{' '}
                <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer">download the app</a>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
// ─── Styles ────────────────────────────────────────────────────────────────────
const sellStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  .se-page{background:${C.void};color:${C.white};font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden}
  .reveal{transition:opacity .6s ease,transform .6s cubic-bezier(.22,1,.36,1)}
  .reveal:not(.shown){opacity:0;transform:translateY(24px)}
  .reveal.shown{opacity:1;transform:translateY(0)}

  /* ── Hero ── */
  .se-hero{position:relative;padding:clamp(60px,10vw,120px) clamp(20px,5vw,80px);text-align:center;overflow:hidden}
  .se-hero-bg{position:absolute;inset:0;pointer-events:none}
  .se-hero-orb{position:absolute;width:500px;height:500px;border-radius:50%;filter:blur(100px)}
  .se-hero-content{position:relative;z-index:1;max-width:750px;margin:0 auto}
  .se-hero-badge{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.emerald};background:${C.emeraldDim};border:1px solid rgba(16,185,129,.25);border-radius:40px;padding:6px 16px;margin-bottom:24px}
  .se-hero-badge-dot{width:6px;height:6px;border-radius:50%;background:${C.emerald}}
  .se-hero-title{font-size:clamp(36px,5.5vw,68px);font-weight:900;line-height:1.06;letter-spacing:-1.5px;margin-bottom:18px}
  .se-hero-highlight{display:block;background:linear-gradient(135deg,${C.emerald},${C.indigoL});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .se-hero-subtitle{font-size:clamp(14px,2vw,17px);color:${C.off};line-height:1.7;max-width:550px;margin:0 auto 32px}
  .se-hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:24px}
  .se-hero-btn{padding:14px 28px;border-radius:14px;font-weight:700;font-size:14px;text-decoration:none;transition:all .22s;display:inline-flex;align-items:center;gap:8px}
  .se-hero-btn.primary{background:linear-gradient(135deg,${C.emerald},#34D399);color:#000;box-shadow:0 8px 28px rgba(16,185,129,.25)}
  .se-hero-btn.primary:hover{filter:brightness(1.08);transform:translateY(-2px);box-shadow:0 14px 36px rgba(16,185,129,.35)}
  .se-hero-btn.secondary{background:${C.surf};color:${C.white};border:1.5px solid ${C.border}}
  .se-hero-btn.secondary:hover{border-color:${C.emerald};color:${C.emerald};background:${C.emeraldDim}}
  .se-hero-trust{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;font-size:12px;color:${C.muted};font-weight:600}
  .se-hero-trust-dot{color:${C.border}}
  @media(max-width:480px){.se-hero-btns{flex-direction:column}.se-hero-btn{justify-content:center}}

  /* ── Stats Strip ── */
  .se-stats-strip{background:${C.surf};border-top:1px solid ${C.border};border-bottom:1px solid ${C.border};padding:clamp(32px,5vw,50px) clamp(20px,5vw,80px)}
  .se-stats-inner{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  @media(max-width:640px){.se-stats-inner{grid-template-columns:repeat(2,1fr);gap:16px}}
  .se-stat{text-align:center;padding:20px 12px}
  .se-stat-icon{font-size:28px;display:block;margin-bottom:8px}
  .se-stat-value{display:block;font-size:clamp(24px,3.5vw,36px);font-weight:900;font-family:'JetBrains Mono',monospace;color:${C.amber}}
  .se-stat-label{font-size:11px;color:${C.muted};font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}

  /* ── Sections ── */
  .se-section{padding:clamp(48px,8vw,90px) clamp(20px,5vw,80px)}
  .se-section-inner{max-width:1100px;margin:0 auto}
  .se-eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${C.muted};margin-bottom:14px;font-family:'JetBrains Mono',monospace}
  .se-section-title{font-size:clamp(24px,3.5vw,40px);font-weight:800;line-height:1.12;letter-spacing:-.5px;margin-bottom:14px}
  .se-section-sub{font-size:15px;color:${C.off};max-width:500px;margin:0 auto}

  /* ── Benefits ── */
  .se-benefits-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
  @media(max-width:480px){.se-benefits-grid{grid-template-columns:1fr}}
  .se-benefit{background:${C.surf};border:1px solid ${C.border};border-radius:18px;padding:clamp(20px,3vw,28px);transition:all .3s;border-top:3px solid var(--bc,${C.emerald})}
  .se-benefit:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.3)}
  .se-benefit-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
  .se-benefit-title{font-size:16px;font-weight:700;margin-bottom:8px}
  .se-benefit-desc{font-size:13.5px;color:${C.off};line-height:1.6}

  /* ── Steps ── */
  .se-steps-section{background:${C.surf};border-top:1px solid ${C.border};border-bottom:1px solid ${C.border}}
  .se-steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:36px}
  @media(max-width:640px){.se-steps-grid{grid-template-columns:1fr;max-width:350px;margin:0 auto 36px}}
  .se-step{text-align:center;padding:28px 20px;background:${C.void};border:1px solid ${C.border};border-radius:20px;transition:all .3s}
  .se-step:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.25)}
  .se-step-number{font-size:12px;font-weight:800;color:${C.indigoL};font-family:'JetBrains Mono',monospace;margin-bottom:12px}
  .se-step-emoji{font-size:40px;margin-bottom:14px}
  .se-step-title{font-size:16px;font-weight:700;margin-bottom:8px}
  .se-step-desc{font-size:13px;color:${C.off};line-height:1.6}
  .se-steps-cta{text-align:center}

  /* ── Testimonials ── */
  .se-testimonials-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
  @media(max-width:480px){.se-testimonials-grid{grid-template-columns:1fr}}
  .se-testimonial{background:${C.surf};border:1px solid ${C.border};border-radius:18px;padding:clamp(20px,3vw,24px);transition:all .3s}
  .se-testimonial:hover{border-color:${C.amber};box-shadow:0 8px 24px rgba(0,0,0,.2)}
  .se-testimonial-text{font-size:14px;color:${C.off};line-height:1.7;margin-bottom:16px;font-style:italic}
  .se-testimonial-author{display:flex;align-items:center;gap:10px}
  .se-testimonial-emoji{font-size:24px}
  .se-testimonial-name{display:block;font-size:13px;font-weight:700;color:${C.white}}
  .se-testimonial-campus{font-size:11px;color:${C.muted}}

  /* ── FAQ ── */
  .se-faq-section{background:${C.surf};border-top:1px solid ${C.border};border-bottom:1px solid ${C.border}}
  .se-faq-list{max-width:650px;margin:0 auto;display:flex;flex-direction:column;gap:8px}
  .se-faq-item{background:${C.void};border:1px solid ${C.border};border-radius:14px;overflow:hidden}
  .se-faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;background:none;border:none;color:${C.white};font-size:14px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;text-align:left;transition:background .2s}
  .se-faq-q:hover{background:${C.elev}}
  .se-faq-arrow{font-size:10px;color:${C.muted};transition:transform .3s;flex-shrink:0}
  .se-faq-item.open .se-faq-arrow{transform:rotate(180deg);color:${C.emerald}}
  .se-faq-a{max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease}
  .se-faq-item.open .se-faq-a{max-height:250px;padding:0 20px 16px}
  .se-faq-a p{font-size:13.5px;color:${C.off};line-height:1.7}

  /* ── Bottom CTA ── */
  .se-bottom-cta{background:linear-gradient(135deg,${C.indigo} 0%,#4F46E5 50%,${C.coral} 100%);border-radius:28px;padding:clamp(40px,6vw,70px) clamp(24px,5vw,60px);text-align:center;position:relative;overflow:hidden}
  .se-bottom-cta-glow{position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.05);filter:blur(80px);top:-50%;left:50%;transform:translateX(-50%);pointer-events:none}
  .se-bottom-cta-title{font-size:clamp(26px,4vw,42px);font-weight:900;color:#fff;margin-bottom:12px;position:relative}
  .se-bottom-cta-sub{font-size:15px;color:rgba(255,255,255,.7);max-width:480px;margin:0 auto 28px;line-height:1.6;position:relative}
  .se-bottom-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative}
  @media(max-width:480px){.se-bottom-cta-btns{flex-direction:column}}
  .se-bottom-btn{padding:14px 28px;border-radius:14px;font-weight:700;font-size:14px;text-decoration:none;transition:all .22s;display:inline-flex;align-items:center;justify-content:center;gap:8px}
  .se-bottom-btn.primary{background:#fff;color:#000;box-shadow:0 8px 28px rgba(0,0,0,.2)}
  .se-bottom-btn.primary:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(0,0,0,.3)}
  .se-bottom-btn.secondary{background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.3)}
  .se-bottom-btn.secondary:hover{background:rgba(255,255,255,.2)}
  .se-bottom-note{font-size:12px;color:rgba(255,255,255,.5);margin-top:20px;position:relative;line-height:1.5}
  .se-bottom-note a{color:rgba(255,255,255,.8);font-weight:600}
`;