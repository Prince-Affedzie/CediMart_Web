// src/app/contact/page.js
'use client';

import { useState, useRef, useEffect } from 'react';
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

// ─── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ question, answer, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const [ref, vis] = useReveal(0.1);

  return (
    <div ref={ref} className={`faq-item reveal ${vis ? 'shown' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <span className={`faq-arrow ${open ? 'open' : ''}`}>▼</span>
      </button>
      <div className={`faq-answer ${open ? 'open' : ''}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [heroRef, heroVis] = useReveal(0.05);
  const [formRef, formVis] = useReveal(0.1);
  const [infoRef, infoVis] = useReveal(0.1);
  const [faqRef, faqVis] = useReveal(0.1);

  const handleChange = (e) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formState.name || !formState.email || !formState.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: '📧', title: 'Email', value: 'hello@cedimart.com', desc: 'We reply within 24 hours', link: 'mailto:hello@cedimart.com' },
    { icon: '📱', title: 'Phone / WhatsApp', value: '+233 50 567 1577', desc: 'Mon–Fri, 9am–5pm GMT', link: 'https://wa.me/233501234567' },
    { icon: '📍', title: 'Office', value: 'University of Ghana, Legon', desc: 'Accra, Ghana', link: 'https://maps.google.com/?q=University+of+Ghana+Legon' },
    { icon: '🐦', title: 'Social Media', value: '@cedimart_official', desc: 'Follow us for updates', link: 'https://twitter.com/cedimart' },
  ];

  const faqs = [
    { question: 'How do I list an item on CediMart?', answer: 'Listing an item is easy! Download the CediMart app, create an account, and tap the "Sell" button. Upload photos, add a description and price, and your listing goes live within minutes. All listings are reviewed to ensure quality.' },
    { question: 'Is CediMart available on all campuses?', answer: 'CediMart is currently available at 8 campuses across Ghana: UG, KNUST, UCC, UPSA, GIMPA, ATU, UEW, and Ashesi. We\'re expanding to more campuses soon!' },
    { question: 'How are sellers verified?', answer: 'Every seller submits their national ID and student card for verification. Verified sellers receive a green badge on their profile, helping buyers shop with confidence.' },
    { question: 'Is CediMart free to use?', answer: 'Yes! CediMart is completely free for buyers. Sellers can list items for free as well. We believe in making campus commerce accessible to every student.' },
    { question: 'How does CediAI work?', answer: 'CediAI is our smart shopping assistant. Simply type what you\'re looking for in natural language — like "Find me a laptop under GHS 4000" — and CediAI will search all listings to find the best matches for you.' },
    { question: 'What if I have a problem with my order?', answer: 'We have a dedicated support team ready to help. Use the in-app reporting feature or contact us directly through this page. We take every issue seriously and work to resolve them quickly.' },
  ];

  return (
    <>
      <style>{contactStyles}</style>

      <div className="ct-page">
        {/* ══════════════════════ HERO ══════════════════════ */}
        <section ref={heroRef} className="ct-hero">
          <div className="ct-hero-bg">
            <div className="ct-hero-orb" style={{ top: '-20%', left: '-5%', background: 'radial-gradient(circle, rgba(99,102,241,.1), transparent)' }} />
            <div className="ct-hero-orb" style={{ bottom: '-15%', right: '-5%', background: 'radial-gradient(circle, rgba(16,185,129,.08), transparent)' }} />
          </div>
          
          <div className={`ct-hero-content reveal ${heroVis ? 'shown' : ''}`}>
            <div className="ct-hero-icon">💬</div>
            <h1 className="ct-hero-title">Get in touch</h1>
            <p className="ct-hero-subtitle">
              Have a question, suggestion, or just want to say hello? We'd love to hear from you. Our team is here to help.
            </p>
          </div>
        </section>

        {/* ══════════════════════ MAIN CONTENT ══════════════════════ */}
        <section className="ct-section">
          <div className="ct-section-inner">
            <div className="ct-grid">
              {/* Contact Form */}
              <div ref={formRef} className={`ct-form-wrap reveal ${formVis ? 'shown' : ''}`}>
                {submitted ? (
                  <div className="ct-success">
                    <div className="ct-success-icon">✅</div>
                    <h2>Message Sent!</h2>
                    <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button className="ct-submit-btn" onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', subject: '', message: '' }); }}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="ct-form-title">Send us a message</h2>
                    <p className="ct-form-subtitle">Fill out the form below and we'll get back to you as soon as possible.</p>
                    
                    {error && <div className="ct-error">{error}</div>}
                    
                    <form className="ct-form" onSubmit={handleSubmit}>
                      <div className="ct-form-row">
                        <div className="ct-form-group">
                          <label htmlFor="name" className="ct-label">Name <span className="ct-required">*</span></label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            className="ct-input"
                            placeholder="Your full name"
                            value={formState.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="ct-form-group">
                          <label htmlFor="email" className="ct-label">Email <span className="ct-required">*</span></label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="ct-input"
                            placeholder="your@email.com"
                            value={formState.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="ct-form-group">
                        <label htmlFor="subject" className="ct-label">Subject</label>
                        <select
                          id="subject"
                          name="subject"
                          className="ct-input ct-select"
                          value={formState.subject}
                          onChange={handleChange}
                        >
                          <option value="">Select a topic</option>
                          <option value="general">General Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="verification">Seller Verification</option>
                          <option value="partnership">Partnership</option>
                          <option value="bug">Report a Bug</option>
                          <option value="feature">Feature Request</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="ct-form-group">
                        <label htmlFor="message" className="ct-label">Message <span className="ct-required">*</span></label>
                        <textarea
                          id="message"
                          name="message"
                          className="ct-input ct-textarea"
                          placeholder="Tell us how we can help..."
                          rows={5}
                          value={formState.message}
                          onChange={handleChange}
                        />
                      </div>

                      <button type="submit" className="ct-submit-btn" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="ct-spinner" />
                            Sending...
                          </>
                        ) : (
                          'Send Message →'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Contact Info */}
              <div ref={infoRef} className={`ct-info-wrap reveal ${infoVis ? 'shown' : ''}`}>
                <div className="ct-info-section">
                  <h3 className="ct-info-title">Contact Information</h3>
                  <div className="ct-info-cards">
                    {contactInfo.map((info, i) => (
                      <a key={i} href={info.link} target="_blank" rel="noopener noreferrer" className="ct-info-card">
                        <div className="ct-info-icon">{info.icon}</div>
                        <div className="ct-info-content">
                          <span className="ct-info-label">{info.title}</span>
                          <span className="ct-info-value">{info.value}</span>
                          <span className="ct-info-desc">{info.desc}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="ct-info-section">
                  <h3 className="ct-info-title">Quick Links</h3>
                  <div className="ct-quick-links">
                    <Link href="/about" className="ct-quick-link">
                      <span>📖</span>
                      <div>
                        <strong>About Us</strong>
                        <p>Learn more about our story and mission</p>
                      </div>
                      <span className="ct-link-arrow">→</span>
                    </Link>
                    <Link href="/listings" className="ct-quick-link">
                      <span>🛍️</span>
                      <div>
                        <strong>Browse Listings</strong>
                        <p>Explore what's available on campus</p>
                      </div>
                      <span className="ct-link-arrow">→</span>
                    </Link>
                    <Link href="/ai-assistant" className="ct-quick-link">
                      <span>🤖</span>
                      <div>
                        <strong>Try CediAI</strong>
                        <p>Let AI help you find what you need</p>
                      </div>
                      <span className="ct-link-arrow">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ FAQ ══════════════════════ */}
        <section ref={faqRef} className="ct-section ct-faq-section">
          <div className="ct-section-inner">
            <div className={`reveal ${faqVis ? 'shown' : ''}`} style={{ textAlign: 'center', marginBottom: 40 }}>
              <p className="ct-eyebrow">— FAQ</p>
              <h2 className="ct-section-title">
                Frequently asked
                <span style={{ color: C.emerald }}> questions.</span>
              </h2>
            </div>

            <div className="ct-faq-list">
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.question} answer={faq.answer} delay={i * 60} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ BOTTOM CTA ══════════════════════ */}
        <section className="ct-section">
          <div className="ct-section-inner">
            <div className="ct-bottom-cta">
              <div className="ct-bottom-cta-bg" />
              <h2 className="ct-bottom-cta-title">Prefer the full experience?</h2>
              <p className="ct-bottom-cta-subtitle">
                Download the CediMart app for seamless buying, selling, and chatting with verified students.
              </p>
              <div className="ct-bottom-cta-btns">
                <a href="https://apps.apple.com/us/app/cedimart/id6762318566" target="_blank" rel="noopener noreferrer" className="ct-bottom-btn primary">
                  🍎 App Store
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.freshyfood.factory" target="_blank" rel="noopener noreferrer" className="ct-bottom-btn secondary">
                  ▶ Google Play
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const contactStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ct-page {
    background: ${C.void};
    color: ${C.white};
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
  }

  /* ── Reveal ── */
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
  .ct-hero {
    position: relative;
    padding: clamp(60px,8vw,100px) clamp(20px,5vw,80px) clamp(40px,6vw,80px);
    text-align: center;
    overflow: hidden;
  }
  .ct-hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .ct-hero-orb {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    filter: blur(80px);
  }
  .ct-hero-content {
    position: relative;
    z-index: 1;
    max-width: 600px;
    margin: 0 auto;
  }
  .ct-hero-icon {
    font-size: 56px;
    margin-bottom: 20px;
  }
  .ct-hero-title {
    font-size: clamp(32px,5vw,56px);
    font-weight: 900;
    letter-spacing: -1.5px;
    margin-bottom: 14px;
  }
  .ct-hero-subtitle {
    font-size: clamp(14px,2vw,17px);
    color: ${C.off};
    line-height: 1.7;
  }

  /* ── Section ── */
  .ct-section {
    padding: clamp(32px,5vw,60px) clamp(20px,5vw,80px);
  }
  .ct-section-inner {
    max-width: 1100px;
    margin: 0 auto;
  }
  .ct-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${C.muted};
    margin-bottom: 14px;
    font-family: 'JetBrains Mono', monospace;
  }
  .ct-section-title {
    font-size: clamp(24px,3.5vw,42px);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.5px;
    margin-bottom: 14px;
  }

  /* ── Grid ── */
  .ct-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: clamp(32px,5vw,60px);
    align-items: start;
  }
  @media (max-width: 768px) {
    .ct-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ── Form ── */
  .ct-form-wrap {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 24px;
    padding: clamp(24px,4vw,40px);
  }
  .ct-form-title {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 6px;
  }
  .ct-form-subtitle {
    font-size: 14px;
    color: ${C.off};
    margin-bottom: 24px;
  }
  .ct-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .ct-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 480px) {
    .ct-form-row {
      grid-template-columns: 1fr;
    }
  }
  .ct-form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ct-label {
    font-size: 13px;
    font-weight: 600;
    color: ${C.off};
  }
  .ct-required {
    color: ${C.coral};
  }
  .ct-input {
    background: ${C.elev};
    border: 1.5px solid ${C.border};
    border-radius: 12px;
    padding: 12px 16px;
    color: ${C.white};
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: all .2s;
  }
  .ct-input:focus {
    border-color: ${C.indigoL};
    box-shadow: 0 0 0 3px ${C.indigoDim};
  }
  .ct-input::placeholder {
    color: ${C.muted};
  }
  .ct-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2352525B' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
    cursor: pointer;
  }
  .ct-textarea {
    resize: vertical;
    min-height: 120px;
  }
  .ct-error {
    background: ${C.coralDim};
    border: 1px solid rgba(244,63,94,.3);
    color: ${C.coral};
    font-size: 13px;
    font-weight: 600;
    padding: 10px 14px;
    border-radius: 10px;
    margin-bottom: 4px;
  }
  .ct-submit-btn {
    background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL});
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    padding: 14px 28px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 8px 28px ${C.indigoDim};
    transition: all .22s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    align-self: flex-start;
  }
  .ct-submit-btn:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
  .ct-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .ct-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Success ── */
  .ct-success {
    text-align: center;
    padding: 20px 0;
  }
  .ct-success-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }
  .ct-success h2 {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 8px;
  }
  .ct-success p {
    font-size: 14px;
    color: ${C.off};
    margin-bottom: 24px;
  }

  /* ── Info Cards ── */
  .ct-info-wrap {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .ct-info-section {
    background: ${C.surf};
    border: 1px solid ${C.border};
    border-radius: 24px;
    padding: clamp(20px,3vw,28px);
  }
  .ct-info-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 16px;
    color: ${C.off};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .ct-info-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ct-info-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 14px;
    text-decoration: none;
    transition: all .2s;
  }
  .ct-info-card:hover {
    border-color: ${C.indigoL};
    transform: translateX(3px);
    box-shadow: 0 4px 16px rgba(0,0,0,.2);
  }
  .ct-info-icon {
    font-size: 28px;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${C.surf};
    border-radius: 12px;
  }
  .ct-info-content {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .ct-info-label {
    font-size: 10px;
    font-weight: 700;
    color: ${C.muted};
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .ct-info-value {
    font-size: 14px;
    font-weight: 600;
    color: ${C.white};
    margin: 2px 0;
  }
  .ct-info-desc {
    font-size: 11px;
    color: ${C.muted};
  }

  /* ── Quick Links ── */
  .ct-quick-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ct-quick-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: ${C.elev};
    border: 1px solid ${C.border};
    border-radius: 14px;
    text-decoration: none;
    transition: all .2s;
  }
  .ct-quick-link:hover {
    border-color: ${C.emerald};
    transform: translateX(3px);
  }
  .ct-quick-link > span:first-child {
    font-size: 24px;
    flex-shrink: 0;
  }
  .ct-quick-link div {
    flex: 1;
    min-width: 0;
  }
  .ct-quick-link strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: ${C.white};
  }
  .ct-quick-link p {
    font-size: 11px;
    color: ${C.muted};
    margin-top: 2px;
  }
  .ct-link-arrow {
    color: ${C.muted};
    font-size: 16px;
    transition: all .2s;
  }
  .ct-quick-link:hover .ct-link-arrow {
    color: ${C.emerald};
    transform: translateX(3px);
  }

  /* ── FAQ ── */
  .ct-faq-section {
    background: ${C.surf};
    border-top: 1px solid ${C.border};
    border-bottom: 1px solid ${C.border};
  }
  .ct-faq-list {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .faq-item {
    background: ${C.void};
    border: 1px solid ${C.border};
    border-radius: 14px;
    overflow: hidden;
  }
  .faq-question {
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
    transition: all .2s;
  }
  .faq-question:hover {
    background: ${C.elev};
  }
  .faq-arrow {
    font-size: 10px;
    color: ${C.muted};
    transition: transform .3s;
    flex-shrink: 0;
  }
  .faq-arrow.open {
    transform: rotate(180deg);
    color: ${C.emerald};
  }
  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height .35s ease, padding .35s ease;
  }
  .faq-answer.open {
    max-height: 300px;
    padding: 0 20px 16px;
  }
  .faq-answer p {
    font-size: 13.5px;
    color: ${C.off};
    line-height: 1.7;
  }

  /* ── Bottom CTA ── */
  .ct-bottom-cta {
    background: linear-gradient(135deg, ${C.indigo} 0%, #4F46E5 50%, ${C.coral} 100%);
    border-radius: 28px;
    padding: clamp(40px,6vw,60px) clamp(24px,5vw,50px);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .ct-bottom-cta-bg {
    position: absolute;
    inset: 0;
    opacity: .04;
    background-image: radial-gradient(circle, #fff 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .ct-bottom-cta-title {
    font-size: clamp(24px,4vw,38px);
    font-weight: 900;
    color: #fff;
    margin-bottom: 12px;
    position: relative;
  }
  .ct-bottom-cta-subtitle {
    font-size: 15px;
    color: rgba(255,255,255,.7);
    max-width: 420px;
    margin: 0 auto 24px;
    line-height: 1.6;
    position: relative;
  }
  .ct-bottom-cta-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
  }
  .ct-bottom-btn {
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
  .ct-bottom-btn.primary {
    background: #fff;
    color: #000;
    box-shadow: 0 8px 24px rgba(0,0,0,.2);
  }
  .ct-bottom-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,.3);
  }
  .ct-bottom-btn.secondary {
    background: rgba(255,255,255,.12);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,.3);
  }
  .ct-bottom-btn.secondary:hover {
    background: rgba(255,255,255,.2);
  }

  @media (max-width: 480px) {
    .ct-form-wrap {
      padding: 20px;
    }
    .ct-bottom-cta-btns {
      flex-direction: column;
    }
    .ct-bottom-btn {
      justify-content: center;
    }
  }
`;