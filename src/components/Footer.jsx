// src/components/Footer.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail, MapPin, Smartphone,
} from 'lucide-react';
import { FiInstagram, FiTwitter, FiLinkedin, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  //  Every link points to a real route. No dead anchors — dead links hurt
  //  SEO and make the footer feel like filler.
  const COLUMNS = [
    {
      title: 'Product',
      links: [
        { label: 'Browse listings', href: '/listings' },
        { label: 'Vendors',         href: '/vendors' },
        { label: 'CediAi',          href: '/ai-assistant' },
        { label: 'Mobile app',      href: '/download' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About',   href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Sell on CediMart', href: '/sell' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help center',      href: '/support' },
        { label: 'Privacy policy',   href: '/privacy' },
        { label: 'Terms of service', href: '/terms' },
      ],
    },
  ];

  const SOCIALS = [
    { label: 'Instagram', href: 'https://instagram.com/cedimart', Icon: FiInstagram },
    { label: 'Twitter',   href: 'https://twitter.com/cedimart',   Icon: FiTwitter },
    { label: 'LinkedIn',  href: 'https://linkedin.com/company/cedimart', Icon: FiLinkedin },
    { label: 'YouTube',   href: 'https://youtube.com/@cedimart',  Icon: FiYoutube },
  ];
  
  return (
    <div className="footer-wrap">
      <style>{`
        /* ═══════════════════════════════════════════════════════════
           FOOTER
           Palette matches the rest of the app: teal for accents,
           neutral dark surface, muted text for links.
           ═══════════════════════════════════════════════════════════ */
        .footer {
          background: #0F172A;                 /* slate-900, matches --text token family */
          border-top: 1px solid rgba(148, 163, 184, 0.14);
          padding: 64px clamp(20px, 5vw, 80px) 32px;
          color: #CBD5E1;
        }

        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Grid ── */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
        }

        /* ── Logo ── */
        .footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          margin-bottom: 14px;
        }
        .footer-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #0D9488, #14B8A6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: -0.5px;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.28);
        }
        .footer-logo-text {
          font-size: 17.5px;
          font-weight: 800;
          color: #F1F5F9;
          letter-spacing: -0.3px;
        }
        .footer-logo-text span { color: #14B8A6; }

        /* ── Brand blurb ── */
        .footer-brand-sub {
          font-size: 13px;
          color: #94A3B8;
          line-height: 1.7;
          max-width: 300px;
          margin: 0 0 16px;
        }

        /* ── Small badges under the blurb ── */
        .footer-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: #5EEAD4;
          background: rgba(13, 148, 136, 0.12);
          border: 1px solid rgba(20, 184, 166, 0.25);
          padding: 4px 9px;
          border-radius: 20px;
          letter-spacing: 0.02em;
        }

        /* ── Column headers and links ── */
        .footer-col-title {
          font-size: 10px;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin: 0 0 16px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .footer-link {
          font-size: 13.5px;
          color: #CBD5E1;
          text-decoration: none;
          transition: color 0.15s ease;
          width: fit-content;
        }
        .footer-link:hover {
          color: #5EEAD4;                     /* teal-300 — clearly interactive */
        }

        /* ── Bottom bar ── */
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.14);
          padding-top: 24px;
        }

        .footer-copy {
          font-size: 12px;
          color: #64748B;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          margin: 0;
        }

        .footer-socials {
          display: flex;
          gap: 8px;
        }

        .footer-social {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(148, 163, 184, 0.08);
          border: 1px solid rgba(148, 163, 184, 0.15);
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s;
        }
        .footer-social:hover {
          background: rgba(13, 148, 136, 0.16);
          color: #5EEAD4;
          border-color: rgba(20, 184, 166, 0.4);
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          .footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            {/* ── Brand column ── */}
            <div>
              <Link href="/" className="footer-logo">
                <span className="footer-logo-mark">C</span>
                <span className="footer-logo-text">
                  Cedi<span>Mart</span>
                </span>
              </Link>
              <p className="footer-brand-sub">
                Ghana&apos;s social commerce marketplace. Buy from verified
                sellers, watch product videos, chat with vendors, and get
                items delivered anywhere in the country.
              </p>
              <div className="footer-badges">
                <span className="footer-badge">
                  <MapPin size={11} strokeWidth={2.4} />
                  Made in Ghana
                </span>
                <span className="footer-badge">
                  <Smartphone size={11} strokeWidth={2.4} />
                  Available on iOS &amp; Android
                </span>
              </div>
            </div>

            {/* ── Link columns ── */}
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="footer-col-title">{col.title}</p>
                <div className="footer-links">
                  {col.links.map((link) => (
                    <Link key={link.href} href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              {currentYear
                ? `© ${currentYear} CediMart · All rights reserved`
                : '© CediMart · All rights reserved'}
            </p>

            <div className="footer-socials">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social"
                  aria-label={label}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}