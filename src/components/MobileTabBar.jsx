// src/components/MobileTabBar.jsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Store, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const TABS = [
  { key: 'home',    label: 'Home',    href: '/',         icon: Home },
  { key: 'shop',    label: 'Shop',    href: '/listings', icon: Store },
  { key: 'cart',    label: 'Cart',    href: '/cart',     icon: ShoppingCart, showBadge: true },
  { key: 'profile', label: 'Profile', href: '/account',  icon: User, requiresAuth: true },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const isActive = (tab) => {
    if (tab.href === '/') return pathname === '/';
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
  };

  const handleProfilePress = (e) => {
    if (tab.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      router.push('/login?redirect=/account');
    }
  };

  return (
    <>
      <style>{`
        .mtb-wrap {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 400;
          display: none;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid #E2E8F0;
          box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.06);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .mtb-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          height: 60px;
          max-width: 560px;
          margin: 0 auto;
        }

        .mtb-tab {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          color: #94A3B8;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: color 0.18s ease, transform 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .mtb-tab:active {
          transform: scale(0.94);
        }

        .mtb-tab.is-active {
          color: #0D9488;
        }

        .mtb-tab-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 26px;
          transition: background 0.2s ease;
          border-radius: 8px;
        }

        .mtb-tab.is-active .mtb-tab-icon-wrap {
          background: rgba(13, 148, 136, 0.08);
        }

        /* Small active indicator above the icon */
        .mtb-tab.is-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 2px;
          border-radius: 0 0 2px 2px;
          background: #0D9488;
        }

        .mtb-badge {
          position: absolute;
          top: -2px;
          right: -6px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 8px;
          background: #F97316;
          color: #FFFFFF;
          font-size: 9.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFFFFF;
          line-height: 1;
        }

        /* ── Show only on mobile ── */
        @media (max-width: 768px) {
          .mtb-wrap { display: block; }
        }
      `}</style>

      <nav className="mtb-wrap" aria-label="Primary navigation">
        <div className="mtb-row">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab);
            const showBadge = tab.showBadge && cartCount > 0;

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`mtb-tab${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => {
                  if (tab.requiresAuth && !isAuthenticated) handleProfilePress(e);
                }}
              >
                <span className="mtb-tab-icon-wrap">
                  <Icon size={24} strokeWidth={active ? 2.4 : 2} />
                  {showBadge && (
                    <span className="mtb-badge">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}