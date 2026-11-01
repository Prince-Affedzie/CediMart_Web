// src/app/vendor-login/page.js
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronDown,
  Store,
  Smartphone,
  CheckCircle2,
  Apple,
  Play,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
  ShoppingBag,
  Wallet,
  Zap,
} from 'lucide-react';
import OpenAppButton, { StickyOpenApp } from '@/components/VendorAuth/AppLoginCta';
import './vendor-login.css';

export const metadata = {
  title: 'Vendor Login · CediMart',
  description:
    'Log in to your CediMart vendor account in the app: check orders, reply to buyers and track your payouts.',
  alternates: { canonical: '/vendor-login' },
};

const APP_STORE_URL = 'https://apps.apple.com/us/app/cedimart/id6762318566';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.freshyfood.factory';

const STEPS = [
  {
    n: '1',
    title: 'Open the CediMart app',
    desc: 'Don’t have it on this phone yet? Download it free from the App Store or Google Play.',
  },
  {
    n: '2',
    title: 'Tap “Login as Vendor”',
    desc: 'Choose the Vendor option on the login screen, not the shopper one.',
  },
  {
    n: '3',
    title: 'Land in your dashboard',
    desc: 'Your listings, orders, chats and payouts are right where you left them.',
  },
];

const HIGHLIGHTS = [
  {
    icon: TrendingUp,
    title: 'Know what’s working',
    desc: 'Live views, saves and conversion on every listing, so you can push what sells.',
    color: '#0D9488',
    bg: '#F0FDFA',
  },
  {
    icon: MessageCircle,
    title: 'Close deals faster',
    desc: 'Answer buyers, negotiate and confirm orders in one in-app chat.',
    color: '#7E22CE',
    bg: '#F3E8FF',
  },
  {
    icon: ShieldCheck,
    title: 'See your money',
    desc: 'Track earnings and withdrawals securely from one screen.',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

const FAQS = [
  {
    q: 'Why can’t I log in on the website?',
    a: 'Your vendor dashboard (listings, orders, chats and payouts) is built into the app for speed and security, so vendor login happens there.',
  },
  {
    q: 'Which login option do I choose?',
    a: 'Choose Vendor on the app’s login screen. The shopper login won’t open your shop.',
  },
  {
    q: 'I can’t remember my password.',
    a: 'Use the forgot-password option on the app’s login screen to reset it.',
  },
  {
    q: 'I don’t have a vendor account yet.',
    a: 'You can create one in a couple of minutes. It’s free to join, with no listing fees.',
    link: { href: '/vendor-signup', label: 'See how to start selling →' },
  },
];

function StoreButtons() {
  return (
    <div className="vl-store-buttons">
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="vl-store-btn">
        <Apple size={24} strokeWidth={2} className="vl-store-icon" />
        <span className="vl-store-text">
          <span className="vl-store-label">Download on the</span>
          <span className="vl-store-name">App Store</span>
        </span>
      </a>
      <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="vl-store-btn">
        <Play size={22} strokeWidth={2.2} className="vl-store-icon" />
        <span className="vl-store-text">
          <span className="vl-store-label">Get it on</span>
          <span className="vl-store-name">Google Play</span>
        </span>
      </a>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <div className="vl-page">
      {/* Nav */}
      <div className="vl-nav">
        <Link href="/login" className="vl-back" aria-label="Back to shopper login">
          <ChevronLeft size={18} strokeWidth={2.4} />
          Shopper login
        </Link>
        <span className="vl-nav-title">Vendor Login</span>
        <span className="vl-nav-spacer" aria-hidden="true" />
      </div>

      <div className="vl-shell">
        {/* ═════════ Hero ═════════ */}
        <section className="vl-hero">
          <div className="vl-hero-copy">
            <div className="vl-hero-badge">
              <Store size={13} strokeWidth={2.6} />
              <span>VENDOR PORTAL</span>
            </div>

            <h1 className="vl-hero-title">
              Your shop is
              <br />
              <span className="vl-hero-title-accent">waiting for you.</span>
            </h1>

            <p className="vl-hero-sub">
              Check orders, reply to buyers and track your payouts. Your vendor dashboard lives in
              the CediMart app, one tap away.
            </p>

            <OpenAppButton appStoreUrl={APP_STORE_URL} playStoreUrl={PLAY_STORE_URL} />

            <div className="vl-hero-stores">
              <p className="vl-hero-stores-label">New phone, or don’t have the app?</p>
              <StoreButtons />
            </div>
          </div>

          {/* Decorative dashboard mock */}
          <div className="vl-hero-visual" aria-hidden="true">
            <div className="vl-phone">
              <div className="vl-phone-notch" />
              <div className="vl-phone-screen">
                <div className="vl-mock-head">
                  <span className="vl-mock-dot" />
                  <b>Your shop</b>
                </div>
                <div className="vl-mock-row is-order">
                  <ShoppingBag size={16} strokeWidth={2.4} />
                  <span><b>New order</b><small>Ready for delivery</small></span>
                </div>
                <div className="vl-mock-row is-chat">
                  <MessageCircle size={16} strokeWidth={2.4} />
                  <span><b>New message</b><small>“Is it still available?”</small></span>
                </div>
                <div className="vl-mock-row is-pay">
                  <Wallet size={16} strokeWidth={2.4} />
                  <span><b>Payout released</b><small>Delivery confirmed</small></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════ Steps ═════════ */}
        <section className="vl-block">
          <h2 className="vl-section-title">Log in in 3 quick steps</h2>
          <ol className="vl-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="vl-step">
                <span className="vl-step-num">{s.n}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ═════════ Highlights ═════════ */}
        <section className="vl-highlights">
          <h2 className="vl-section-title">What’s waiting for you in the app</h2>
          <div className="vl-highlights-list">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.title}
                  className="vl-highlight"
                  style={{ '--hl-color': h.color, '--hl-bg': h.bg }}
                >
                  <span className="vl-highlight-icon"><Icon size={20} strokeWidth={2.2} /></span>
                  <div className="vl-highlight-body">
                    <p className="vl-highlight-title">{h.title}</p>
                    <p className="vl-highlight-desc">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═════════ FAQ ═════════ */}
        <section className="vl-faq">
          <h2 className="vl-section-title">Stuck? Quick answers.</h2>
          <div className="vl-faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="vl-faq-item">
                <summary>
                  <span>{f.q}</span>
                  <ChevronDown size={18} strokeWidth={2.4} />
                </summary>
                <p>{f.a}</p>
                {f.link && (
                  <p className="vl-faq-link"><Link href={f.link.href}>{f.link.label}</Link></p>
                )}
              </details>
            ))}
          </div>
        </section>

        {/* ═════════ Closing card ═════════ */}
        <section className="vl-download">
          <div className="vl-download-icon"><Smartphone size={34} strokeWidth={1.8} /></div>
          <h2 className="vl-download-title">Every minute offline is a sale you can’t answer</h2>
          <p className="vl-download-sub">
            Open the app and choose <strong>Login as Vendor</strong>. It’s free on iOS and Android.
          </p>
          <StoreButtons />
          <div className="vl-download-note">
            <CheckCircle2 size={14} strokeWidth={2.4} />
            <span>Already have the app? Just open it and tap Vendor.</span>
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
            <Link href="/login" className="vl-footer-link">Log in as a shopper</Link>
          </p>
        </div>
      </div>

      <StickyOpenApp appStoreUrl={APP_STORE_URL} playStoreUrl={PLAY_STORE_URL} />
    </div>
  );
}