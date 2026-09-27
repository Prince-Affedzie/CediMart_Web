// src/app/vendor-signup/page.js
import Link from 'next/link';
import {
  ChevronLeft,
  Store,
  ShieldCheck,
  TrendingUp,
  Zap,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  Apple,
  Play,
  ArrowRight,
  Video,
  Users,
  MapPin,
} from 'lucide-react';
import './vendor-signup.css';

export const metadata = {
  title: 'Sell on CediMart · Ghana\'s Social Commerce Marketplace',
  description:
    'Start selling to buyers across Ghana — free to join, no listing fees. Listing tools, video posts, in-app chat, and secure escrow payments.',
};

const APP_STORE_URL = 'https://apps.apple.com/us/app/cedimart/id6762318566';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.freshyfood.factory';

const PERKS = [
  {
    icon: Zap,
    title: 'List in under a minute',
    desc: 'Snap a photo, set your price, publish. Your item goes live instantly.',
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    icon: MapPin,
    title: 'Reach buyers across Ghana',
    desc: 'Sell to your city or ship nationwide. Buyers in every major city discover your shop.',
    color: '#0D9488',
    bg: '#F0FDFA',
  },
  {
    icon: ShieldCheck,
    title: 'Secure escrow payments',
    desc: 'Buyers pay upfront — you get paid as soon as delivery is confirmed.',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: MessageCircle,
    title: 'In-app chat',
    desc: 'Talk to buyers directly. Your phone number stays private.',
    color: '#7E22CE',
    bg: '#F3E8FF',
  },
  {
    icon: Video,
    title: 'Sell with video',
    desc: 'Post short product videos and 24-hour stories to showcase what you sell.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
  },
  {
    icon: Users,
    title: 'Build a real audience',
    desc: 'Your shop gets followers and repeat customers — not just one-off listings.',
    color: '#DC2626',
    bg: '#FEF2F2',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Download the app',
    desc: 'Free on iOS and Android.',
  },
  {
    n: '02',
    title: 'Create a vendor account',
    desc: 'Tap "Vendor Sign Up" on the welcome screen. Fill a short form — takes 2 minutes.',
  },
  {
    n: '03',
    title: 'Verify your ID',
    desc: 'Upload a clear photo of a government-issued ID. We review it within 24 hours.',
  },
  {
    n: '04',
    title: 'Start selling',
    desc: 'List your first item, post a video if you want, and go live immediately.',
  },
];

export default function VendorSignupPage() {
  return (
    <div className="vs-page">
      {/* Nav */}
      <div className="vs-nav">
        <Link href="/" className="vs-back" aria-label="Go back">
          <ChevronLeft size={18} strokeWidth={2.4} />
          Back
        </Link>
        <span className="vs-nav-title">Vendor Sign Up</span>
        <span className="vs-nav-spacer" aria-hidden="true" />
      </div>

      <div className="vs-shell">
        {/* Hero */}
        <section className="vs-hero">
          <div className="vs-hero-badge">
            <Store size={13} strokeWidth={2.6} />
            <span>FOR SELLERS</span>
          </div>

          <h1 className="vs-hero-title">
            Start selling on
            <br />
            <span className="vs-hero-title-accent">CediMart</span>
          </h1>

          <p className="vs-hero-sub">
            Everything you need to run a real business — listing tools,
            video posts, in-app chat, secure payments, and an audience
            of buyers across Ghana.
          </p>

          <div className="vs-hero-pill">
            <CheckCircle2 size={15} strokeWidth={2.4} />
            <span>Free to join. No listing fees. Ever.</span>
          </div>
        </section>

        {/* Perks */}
        <section className="vs-perks">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="vs-perk"
                style={{ '--perk-color': perk.color, '--perk-bg': perk.bg }}
              >
                <span className="vs-perk-icon">
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <h3 className="vs-perk-title">{perk.title}</h3>
                <p className="vs-perk-desc">{perk.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Download CTA */}
        <section className="vs-download">
          <div className="vs-download-icon">
            <Smartphone size={34} strokeWidth={1.8} />
          </div>

          <h2 className="vs-download-title">
            Vendor accounts are created in the app
          </h2>
          <p className="vs-download-sub">
            We use the app to verify your identity, handle payments
            securely, and give you the tools to list, chat, and grow
            your audience. Download it, then tap{' '}
            <strong>Vendor Sign Up</strong> on the welcome screen.
          </p>

          <div className="vs-store-buttons">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="vs-store-btn"
            >
              <Apple size={24} strokeWidth={2} className="vs-store-icon" />
              <span className="vs-store-text">
                <span className="vs-store-label">Download on the</span>
                <span className="vs-store-name">App Store</span>
              </span>
            </a>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="vs-store-btn"
            >
              <Play size={22} strokeWidth={2.2} className="vs-store-icon" />
              <span className="vs-store-text">
                <span className="vs-store-label">Get it on</span>
                <span className="vs-store-name">Google Play</span>
              </span>
            </a>
          </div>
        </section>

        {/* Steps */}
        <section className="vs-steps">
          <h2 className="vs-steps-title">How it works</h2>
          <div className="vs-steps-list">
            {STEPS.map((step) => (
              <div key={step.n} className="vs-step">
                <span className="vs-step-num">{step.n}</span>
                <div className="vs-step-body">
                  <p className="vs-step-title">{step.title}</p>
                  <p className="vs-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="vs-footer">
          <p>
            Already have a shopper account?{' '}
            <Link href="/login" className="vs-footer-link">
              Sign in here
            </Link>
          </p>
          <p className="vs-footer-sub">
            Not sure yet?{' '}
            <Link href="/signup" className="vs-footer-link">
              Create a shopper account
            </Link>{' '}
            first — you can always upgrade to selling later in the app.
          </p>
        </div>
      </div>
    </div>
  );
}