// src/components/Home/AiSection.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const AI_DEMOS = [
  { q: 'Find me a laptop under GH₵3000', icon: '💻' },
  { q: 'Best headphones under GH₵300', icon: '🎧' },
  { q: 'Dresses for Hall Week', icon: '👗' },
];

const AI_FEATURES = [
  { icon: '🧠', title: 'Natural language search', desc: 'No keywords needed. Ask like you would a friend who knows every listing.' },
  { icon: '📦', title: 'Rich product results', desc: 'Gets back images, prices, conditions, and campus locations — not just links.' },
  { icon: '💬', title: 'Follow-up questions', desc: '"Show me cheaper ones" or "only KNUST sellers" — Cedi remembers the context.' },
];

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

function AiDemoCard({ query, icon, delay = 0 }) {
  const [ref, vis] = useReveal(0.2);
  return (
    <div ref={ref} className={`ai-demo-card reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="ai-demo-q"><span className="ai-demo-icon">{icon}</span><span className="ai-demo-q-text">{query}</span></div>
      <div className="ai-demo-a">
        <div className="ai-demo-a-header"><span className="ai-demo-sparkle">✦</span><span className="ai-demo-a-name">Ask Cedi</span></div>
        <p className="ai-demo-a-text">I found <span style={{ color: '#059669', fontWeight: 700 }}>4 listings</span> that match — let me show you the best options with prices, conditions, and campus locations.</p>
        <div className="ai-demo-chips">
          <span className="ai-demo-chip">📦 3 results</span>
          <span className="ai-demo-chip">🏫 2 campuses</span>
          <span className="ai-demo-chip">✅ All verified</span>
        </div>
      </div>
    </div>
  );
}

export default function AiSection() {
  const [sectionRef, vis] = useReveal(0.08);
  return (
    <section id="ai-assistant-demo" className="section ai-section" ref={sectionRef}>
      <div className="section-inner">
        <div className="ai-split">
          <div className={`reveal ${vis ? 'shown' : ''}`}>
            <div className="ai-orb">✦</div>
            <p className="section-eyebrow" style={{ '--ec': '#0D9488' }}>— Cedi AI</p>
            <h2 className="section-h2">CediAi — your <span style={{ color: '#0D9488' }}>AI shopping assistant.</span></h2>
            <p className="section-sub">Type anything. "Find me a laptop under GH₵3000," "Who sells Jollof near Legon?" — Cedi reads your intent and surfaces the best matching listings from across campus, instantly.</p>
            {AI_FEATURES.map((f, i) => (
              <div key={i} className="ai-feature-row">
                <div className="ai-feature-icon">{f.icon}</div>
                <div>
                  <div className="ai-feature-title">{f.title}</div>
                  <div className="ai-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
            <Link href="/ai-assistant" className="ai-try-btn">✦ Try CediAi — it's free</Link>
          </div>
          <div className="ai-demos-stack">
            {AI_DEMOS.map((demo, i) => (
              <AiDemoCard key={i} query={demo.q} icon={demo.icon} delay={i * 100} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}