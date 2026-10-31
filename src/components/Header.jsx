// src/components/Header.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home as HomeIcon,
  Store,
  Package,
  Bot,
  BookOpen,
  MessageCircle,
  Smartphone,
  ShoppingCart,
  Heart,
  User as UserIcon,
} from 'lucide-react';
import HomeSearchBar from '@/components/Home/HomeSearchBar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// Desktop navbar: kept short so the search bar has room.
const DESKTOP_LINKS = [
  { label: 'Home',     href: '/',         icon: HomeIcon },
  { label: 'Vendors',  href: '/vendors',  icon: Store },
  { label: 'Listings', href: '/listings', icon: Package },
];

// Mobile drawer: the full list.
const MOBILE_LINKS = [
  { label: 'Home',         href: '/',             icon: HomeIcon },
  { label: 'Vendors',      href: '/vendors',      icon: Store },
  { label: 'Listings',     href: '/listings',     icon: Package },
  { label: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { label: 'About',        href: '/about',        icon: BookOpen },
  { label: 'Contact',      href: '/contact',      icon: MessageCircle },
];

// Pages where the navbar search bar is hidden.
// Each entry also covers its sub-routes (e.g. '/cart' covers '/cart/anything').
const HIDE_SEARCH_ON = [
  '/feed',         // full-screen video, has its own search
  '/listings',     // has its own search box in the page top bar
  '/cart',
  '/checkout',
  '/login',
  '/register',
  '/account',
  '/ai-assistant',
  '/vendor',
  '/vendor-login',
  '/vendor-signup',
  '/orders','/account','/auth','/messages',
  '/product','/privacy-policy','/sell','/vendors','/visual-search','/about',
  '/support','/payment','/order-confirmed','/download','/favorites','/contact'


];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const { cartCount = 0 } = useCart();
  const { isAuthenticated, user } = useAuth();

  // If logged out, force counters to zero — don't trust stale cart state.
  const safeCartCount = isAuthenticated ? cartCount : 0;
  const favoritesCount = isAuthenticated
    ? user?.favorites?.length || user?.favoritesCount || 0
    : 0;

  // Lock background scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close the mobile drawer on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const hideSearch = HIDE_SEARCH_ON.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  return (
    <header className="sticky top-0 z-[200]">
      <style>{`
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 5vw, 80px);
          min-height: 64px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px) saturate(160%);
          border-bottom: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          gap: 16px;
          position: relative;
          z-index: 200;
        }

        /* Left cluster: hamburger (mobile) + logo */
        .nav-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
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

        /* Search (sits between logo and links on desktop) */
        .nav-search {
          flex: 1 1 360px;
          min-width: 0;
          max-width: 600px;
        }

        /* Desktop links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }
        /* When search is hidden, links take the free space and sit in the middle */
        .nav.no-search .nav-links {
          flex: 1;
          justify-content: center;
        }
        .nav-link {
          font-size: 13.5px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: color 0.18s, background 0.18s;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          position: relative;
        }
        .nav-link:hover {
          color: #0D9488;
          background: #F0FDFA;
        }
        .nav-link.active {
          color: #0D9488;
          background: #F0FDFA;
          font-weight: 700;
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 12px;
          right: 12px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #0D9488, #14B8A6);
        }
        .nav-link-icon {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        /* Right cluster: counters + login */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .nav-counter {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #475569;
          text-decoration: none;
          transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.18s;
        }
        .nav-counter:hover {
          background: #F0FDFA;
          color: #0D9488;
          border-color: #99F6E4;
          transform: translateY(-1px);
        }
        .nav-counter.is-empty {
          color: #94A3B8;
        }

        .nav-counter-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9px;
          background: #F97316;
          color: #fff;
          font-size: 10.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-variant-numeric: tabular-nums;
          border: 2px solid #FFFFFF;
          box-sizing: content-box;
        }
        .nav-counter-badge.is-zero {
          display: none;
        }
        .nav-counter-badge.brand {
          background: #0D9488;
        }

        .nav-login {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #0D9488, #14B8A6);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 40px;
          text-decoration: none;
          transition: all 0.22s ease;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);
          white-space: nowrap;
        }
        .nav-login:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
        }

        /* Hamburger (mobile only, on the left) */
        .nav-hamburger {
          display: none;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          color: #475569;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        /* Mobile menu overlay */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(3px);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.28s ease;
        }
        .mobile-menu-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile menu panel */
        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 50px;
          width: min(82vw, 300px);
          background: #FFFFFF;
          border-right: 1px solid #E2E8F0;
          z-index: 999;
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
          padding-bottom: 12px;
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
        .mobile-nav-link:hover,
        .mobile-nav-link.active {
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
          flex-shrink: 0;
          color: #0D9488;
        }

        /* ── Footer block: tightened & raised ── */
        .mobile-menu-foot {
          flex-shrink: 0;
          padding: 10px 18px calc(12px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid #E2E8F0;
          background: #FFFFFF;
          box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.04);
          bottom: 54px;
        }
        .mobile-nav-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px;
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

        /* Tighten desktop a little on mid-size screens so search keeps room */
        @media (max-width: 1100px) {
          .nav { gap: 12px; }
          .nav-link { padding: 8px 9px; }
          .nav-link-icon { display: none; }
        }

        /* Mobile / tablet: two rows — [menu, logo ... cart, heart, login] then [search] */
        @media (max-width: 900px) {
          .nav {
            flex-wrap: wrap;
            row-gap: 10px;
            padding-top: 10px;
            padding-bottom: 10px;
          }
          .nav-links { display: none; }
          .nav-hamburger { display: flex; }

          .nav-left   { order: 1; }
          .nav-right  { order: 2; }
          .nav-search { order: 3; flex: 1 0 100%; max-width: none; }

          /* No search row on these pages: back to a single compact row */
          .nav.no-search {
            flex-wrap: nowrap;
            row-gap: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
        }

        /* Hide login text on very small screens, keep icon */
        @media (max-width: 420px) {
          .nav-login span { display: none; }
          .nav-login { padding: 10px 12px; }
        }
      `}</style>

      <nav className={`nav${hideSearch ? ' no-search' : ''}`}>
        {/* ── LEFT: hamburger + logo ── */}
        <div className="nav-left">
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href="/" className="nav-logo">
            <span className="nav-logo-text">
              Cedi<span>Mart</span>
            </span>
          </Link>
        </div>

        {/* ── SEARCH (hidden on some pages) ── */}
        {!hideSearch && (
          <div className="nav-search">
            <HomeSearchBar variant="nav" />
          </div>
        )}

        {/* ── Desktop links ── */}
        <div className="nav-links">
          {DESKTOP_LINKS.map((link) => {
            const IconComponent = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`nav-link${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <IconComponent size={15} className="nav-link-icon" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── RIGHT: cart + favorites + login ── */}
        <div className="nav-right">
          <Link
            href="/cart"
            className={`nav-counter${safeCartCount === 0 ? ' is-empty' : ''}`}
            aria-label={`Cart, ${safeCartCount} item${safeCartCount === 1 ? '' : 's'}`}
            title="Cart"
          >
            <ShoppingCart size={18} strokeWidth={2.2} />
            <span
              className={`nav-counter-badge${safeCartCount === 0 ? ' is-zero' : ''}`}
            >
              {safeCartCount}
            </span>
          </Link>

          <Link
            href="/favorites"
            className={`nav-counter${favoritesCount === 0 ? ' is-empty' : ''}`}
            aria-label={`Favorites, ${favoritesCount} item${favoritesCount === 1 ? '' : 's'}`}
            title="Favorites"
          >
            <Heart size={18} strokeWidth={2.2} />
            <span
              className={`nav-counter-badge brand${
                favoritesCount === 0 ? ' is-zero' : ''
              }`}
            >
              {favoritesCount}
            </span>
          </Link>

          {!isAuthenticated && (
            <Link href="/login" className="nav-login">
              <UserIcon size={14} strokeWidth={2.4} />
              <span>Login</span>
            </Link>
          )}
        </div>
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
            <span className="nav-logo-text">
              Cedi<span>Mart</span>
            </span>
          </Link>
          <button
            className="mobile-menu-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mobile-menu-body">
          {MOBILE_LINKS.map((link, i) => {
            const IconComponent = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`mobile-nav-link${active ? ' active' : ''}`}
                style={{ transitionDelay: menuOpen ? `${i * 45}ms` : '0ms' }}
                onClick={closeMenu}
                aria-current={active ? 'page' : undefined}
              >
                <span className="mobile-nav-icon-chip">
                  <IconComponent size={16} />
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Footer block — raised up */}
        <div className="mobile-menu-foot">
          <Link
            href="/download"
            className="mobile-nav-cta"
            onClick={closeMenu}
          >
            <Smartphone size={16} />
            Download App
          </Link>
        </div>
      </div>
    </header>
  );
}