// src/components/Header.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import icon from '@/app/icon.jpg';

const NAV_LINKS = [
  { label: 'Listings',     href: '/listings',     icon: '🛍️' },
  { label: 'AI Assistant', href: '/ai-assistant',  icon: '🤖' },
  //{ label: 'Sell',         href: '/sell',          icon: '💰' },
  { label: 'About',        href: '/about',         icon: '📖' },
  { label: 'Contact',      href: '/contact',       icon: '💬' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock background scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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

        /* Mobile menu overlay — fades rather than hard-toggling so the drawer feels smooth */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(3px);
          z-index: 55;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.28s ease;
        }
        .mobile-menu-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile menu panel — slides in from the LEFT, the conventional side for
           primary navigation (right-side panels read as notifications/cart). */
        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(82vw, 300px);
          background: #FFFFFF;
          border-right: 1px solid #E2E8F0;
          z-index: 56;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 10px 0 40px rgba(0, 0, 0, 0.12);
        }
        .mobile-menu.active {
          transform: translateX(0);
        }

        .mobile-menu-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid #E2E8F0;
          flex-shrink: 0;
        }
        .mobile-menu-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .mobile-menu-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px 12px 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 12px;
          font-size: 14.5px;
          font-weight: 600;
          color: #475569;
          text-decoration: none;
          border-radius: 12px;
          border-left: 3px solid transparent;
          opacity: 0;
          transform: translateX(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease, background 0.18s, color 0.18s, border-color 0.18s;
        }
        .mobile-menu.active .mobile-nav-link {
          opacity: 1;
          transform: translateX(0);
        }
        .mobile-nav-link:hover {
          background: #F0FDFA;
          color: #0D9488;
          border-left-color: #0D9488;
        }
        .mobile-nav-icon-chip {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #F0FDFA;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .mobile-menu-foot {
          flex-shrink: 0;
          padding: 14px 18px calc(18px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid #E2E8F0;
        }
        .mobile-nav-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #0D9488, #14B8A6);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .mobile-nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(13, 148, 136, 0.32);
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
          {NAV_LINKS.map((link) => (
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
        onClick={closeMenu}
      />

      {/* Mobile menu panel (left drawer) */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-head">
          <Link href="/" className="nav-logo" onClick={closeMenu}>
            <div className="nav-logo-mark">
              <Image src={icon} alt="CediMart" width={34} height={34} />
            </div>
            <span className="nav-logo-text">Cedi<span>Mart</span></span>
          </Link>
          <button className="mobile-menu-close" onClick={closeMenu} aria-label="Close menu">
            <FaTimes size={15} />
          </button>
        </div>

        <div className="mobile-menu-body">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className="mobile-nav-link"
              style={{ transitionDelay: menuOpen ? `${i * 45}ms` : '0ms' }}
              onClick={closeMenu}
            >
              <span className="mobile-nav-icon-chip">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mobile-menu-foot">
          <Link href="/download" className="mobile-nav-cta" onClick={closeMenu}>
            📲 Download App
          </Link>
        </div>
      </div>
    </header>
  );
}