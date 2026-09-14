// src/components/Home/CtaSection.jsx
'use client';

import { useState } from 'react';
import { Apple, Play } from 'lucide-react';

export default function CtaSection({ reveal, sectionRef }) {
  const [email, setEmail] = useState('');
  const [emailDone, setEmailDone] = useState(false);

  return (
    <section id="download" className="section" ref={sectionRef} style={{ background: 'var(--surf)' }}>
      <div className="section-inner">
        <div className={`cta-wrap reveal ${reveal ? 'shown' : ''}`}>
          <h2 className="cta-h2">Your campus marketplace<br />is waiting.</h2>
          <p className="cta-sub">Join 10,000+ students already buying, selling, and growing on CediMart. Free forever.</p>
          <div className="cta-btns">
            <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="cta-btn-white">
              <Apple size={28} className="dl-btn-icon" /> App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="cta-btn-ghost">
              <Play size={28} className="dl-btn-icon" fill="currentColor" /> Google Play
            </a>
          </div>
          <form className="nl-form" onSubmit={(e) => { e.preventDefault(); setEmailDone(true); setEmail(''); }}>
            <input
              type="email"
              required
              placeholder="Get launch updates by email"
              className="nl-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="nl-btn">{emailDone ? '✓ Done' : 'Notify me'}</button>
          </form>
        </div>
      </div>
    </section>
  );
}