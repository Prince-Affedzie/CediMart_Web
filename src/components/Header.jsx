// src/components/Header.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import icon from '@/app/icon.jpg';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Listings', href: '/listings' },
    { label: 'AI Assistant', href: '/ai-assistant' },
    { label: 'Sell', href: '/sell' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50">
      <style>{`
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 5vw, 80px);
          height: 64px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px) saturate(160%);
          border-bottom: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .nav-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(13, 148, 136, 0.2);
          flex-shrink: 0;
        }
        .nav-logo-mark img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .nav-logo-text {
          font-size: 18px;
          font-weight: 800;
          color: #0D9488 !important;
          letter-spacing: -0.3px;
        }
        .nav-logo-text span {
          color: #F97316 !important;
        }

        /* Desktop links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .nav-link {
          font-size: 13.5px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: #0D9488;
        }

        /* Desktop CTA */
        .nav-cta-desktop {
          background: linear-gradient(135deg, #0D9488, #14B8A6);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 22px;
          border-radius: 40px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.22s ease;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nav-cta-desktop:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
        }

        /* Hamburger */
        .nav-hamburger {
          display: none;
          background: none;
          border: none;
          color: #475569;
          cursor: pointer;
          padding: 8px;
          z-index: 60;
        }

        /* Mobile menu overlay */
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(4px);
          z-index: 55;
        }

        /* Mobile menu panel */
        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          max-width: 80vw;
          background: #FFFFFF;
          border-left: 1px solid #E2E8F0;
          z-index: 56;
          padding: 80px 24px 32px;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
        }
        .mobile-menu.active {
          display: flex;
        }
        .mobile-menu-overlay.active {
          display: block;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          font-size: 15px;
          font-weight: 600;
          color: #475569;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .mobile-nav-link:hover {
          background: #F0FDFA;
          color: #0D9488;
        }
        .mobile-nav-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }
        .mobile-nav-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          padding: 14px;
          background: linear-gradient(135deg, #0D9488, #14B8A6);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);
        }
        .mobile-menu-divider {
          height: 1px;
          background: #E2E8F0;
          margin: 8px 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links,
          .nav-cta-desktop {
            display: none;
          }
          .nav-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: #F1F5F9;
            border: 1px solid #E2E8F0;
          }
        }
      `}</style>

      <nav className="nav">
        {/* Logo — using real app icon */}
        <Link href="/" className="nav-logo">
          <div className="nav-logo-mark">
            <Image 
              src={icon} 
              alt="CediMart" 
              width={34} 
              height={34} 
              priority
            />
          </div>
          <span className="nav-logo-text">
            Cedi<span>Mart</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link href="/download" className="nav-cta-desktop">
          Download App ↗
        </Link>

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`mobile-menu-overlay ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        {navLinks.map((link, i) => (
          <Link
            key={link.label}
            href={link.href}
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <span className="mobile-nav-icon">
              {['🛍️', '🤖', '📖', '💬'][i]}
            </span>
            {link.label}
          </Link>
        ))}

        <div className="mobile-menu-divider" />

        <Link
          href="/download"
          className="mobile-nav-cta"
          onClick={() => setMenuOpen(false)}
        >
          📲 Download App
        </Link>
      </div>
    </header>
  );
}