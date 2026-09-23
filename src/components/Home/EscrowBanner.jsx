// src/components/Home/EscrowBanner.jsx
'use client';

import Link from 'next/link';

export default function EscrowBanner() {
  return (
    <section
      className="escrow-banner"
      style={{
        // Inline fallback — guarantees the banner looks right even if the
        // stylesheet isn't loaded on this route.
        margin: '40px 0',
        background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
        borderRadius: 20,
        padding: 'clamp(28px, 4vw, 44px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="escrow-banner-content" style={{ maxWidth: 560, position: 'relative', zIndex: 1 }}>
        <span
          className="escrow-banner-tag"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,.18)',
            border: '1px solid rgba(255,255,255,.3)',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            padding: '5px 11px',
            borderRadius: 20,
            marginBottom: 14,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Secure transactions
        </span>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-.5px', marginBottom: 10, color: '#fff' }}>
          Your money is safe with us
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, marginBottom: 22 }}>
          We hold your payment securely until you receive your order. Sellers only get paid after
          you confirm delivery.
        </p>
        <Link
          href="/listings"
          className="escrow-banner-btn"
          style={{
            display: 'inline-block',
            background: '#fff',
            color: '#0D9488',
            fontSize: 14,
            fontWeight: 800,
            padding: '12px 22px',
            borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          Shop with confidence →
        </Link>
      </div>
      <div className="escrow-banner-art" aria-hidden="true" style={{ fontSize: 'clamp(60px, 10vw, 120px)', opacity: .25, flexShrink: 0 }}>
        🛍️
      </div>
    </section>
  );
}