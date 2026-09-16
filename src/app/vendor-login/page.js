// src/app/vendor-login/page.js
import Link from 'next/link';
import {
  ChevronLeft,
  Store,
  Smartphone,
  CheckCircle2,
  Apple,
  Play,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import './vendor-login.css';

export const metadata = {
  title: 'Vendor Login · CediMart',
  description: 'Sign in to your CediMart vendor account in the app.',
};

const APP_STORE_URL = 'https://apps.apple.com/us/app/cedimart/id6762318566';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.freshyfood.factory';

const HIGHLIGHTS = [
  {
    icon: TrendingUp,
    title: 'See live sales',
    desc: 'Real-time views, saves, and conversion on every listing.',
    color: '#0D9488',
    bg: '#F0FDFA',
  },
  {
    icon: MessageCircle,
    title: 'Chat with buyers',
    desc: 'Negotiate, answer questions, close deals — all in-app.',
    color: '#7E22CE',
    bg: '#F3E8FF',
  },
  {
    icon: ShieldCheck,
    title: 'Manage payouts',
    desc: 'Track earnings and withdrawals securely from one screen.',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

export default function VendorLoginPage() {
  return (
    <div className="vl-page">
      {/* Nav */}
      <div className="vl-nav">
        <Link href="/login" className="vl-back" aria-label="Go back">
          <ChevronLeft size={18} strokeWidth={2.4} />
          Back to shopper login
        </Link>
        <span className="vl-nav-title">Vendor Login</span>
        <span className="vl-nav-spacer" aria-hidden="true" />
      </div>

      <div className="vl-shell">
        {/* Hero */}
        <section className="vl-hero">
          <div className="vl-hero-badge">
            <Store size={13} strokeWidth={2.6} />
            <span>VENDOR PORTAL</span>
          </div>

          <h1 className="vl-hero-title">
            Vendor login lives
            <br />
            in the <span className="vl-hero-title-accent">app</span>
          </h1>

          <p className="vl-hero-sub">
            Your vendor dashboard — listings, orders, chats, payouts — is
            built into the CediMart app for speed and security. Download
            it, then tap <strong>Login as Vendor</strong>.
          </p>
        </section>

        {/* Download card */}
        <section className="vl-download">
          <div className="vl-download-icon">
            <Smartphone size={34} strokeWidth={1.8} />
          </div>

          <h2 className="vl-download-title">
            Get the CediMart app
          </h2>
          <p className="vl-download-sub">
            Free on iOS and Android. Open it and choose{' '}
            <strong>Vendor</strong> on the login screen.
          </p>

          <div className="vl-store-buttons">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="vl-store-btn"
            >
              <Apple size={24} strokeWidth={2} className="vl-store-icon" />
              <span className="vl-store-text">
                <span className="vl-store-label">Download on the</span>
                <span className="vl-store-name">App Store</span>
              </span>
            </a>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="vl-store-btn"
            >
              <Play size={22} strokeWidth={2.2} className="vl-store-icon" />
              <span className="vl-store-text">
                <span className="vl-store-label">Get it on</span>
                <span className="vl-store-name">Google Play</span>
              </span>
            </a>
          </div>

          <div className="vl-download-note">
            <CheckCircle2 size={14} strokeWidth={2.4} />
            <span>Already have the app? Just open it and tap Vendor.</span>
          </div>
        </section>

        {/* Highlights */}
        <section className="vl-highlights">
          <h2 className="vl-highlights-title">What you get in the app</h2>
          <div className="vl-highlights-list">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.title}
                  className="vl-highlight"
                  style={{ '--hl-color': h.color, '--hl-bg': h.bg }}
                >
                  <span className="vl-highlight-icon">
                    <Icon size={20} strokeWidth={2.2} />
                  </span>
                  <div className="vl-highlight-body">
                    <p className="vl-highlight-title">{h.title}</p>
                    <p className="vl-highlight-desc">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer note */}
        <div className="vl-footer">
          <p>
            Not a vendor yet?{' '}
            <Link href="/vendor-signup" className="vl-footer-link">
              Sign up to sell on CediMart
            </Link>
          </p>
          <p className="vl-footer-sub">
            Shopping instead?{' '}
            <Link href="/login" className="vl-footer-link">
              Log in as a shopper
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}