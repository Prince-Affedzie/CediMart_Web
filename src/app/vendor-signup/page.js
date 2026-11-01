// src/app/vendor-signup/page.js
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronDown,
  Store,
  ShieldCheck,
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
  Check,
  X,
  Lock,
  Wallet,
  Quote,
} from 'lucide-react';
import StickyCta from '@/components/VendorSignup/StickyCta';
import './vendor-signup.css';

export const metadata = {
  title: 'Sell on CediMart · Free to join, paid securely',
  description:
    'Stop chasing buyers. List in under a minute, sell with video, chat in-app and get paid safely through escrow. Free to join, no listing fees.',
  alternates: { canonical: '/vendor-signup' },
};

const APP_STORE_URL = 'https://apps.apple.com/us/app/cedimart/id6762318566';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.freshyfood.factory';

// ── Fill these with REAL numbers and quotes. Each section stays hidden while its list is empty. ──
// e.g. { value: '1,200+', label: 'Active shoppers' }
const STATS = [];
// e.g. { quote: 'I sold my first item in a day.', name: 'Ama', role: 'Fashion seller, UG' }
const TESTIMONIALS = [];

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
    desc: 'Sell to your city or ship nationwide. Shoppers in every major city can find your shop.',
    color: '#0D9488',
    bg: '#F0FDFA',
  },
  {
    icon: ShieldCheck,
    title: 'Get paid, guaranteed',
    desc: 'Buyers pay upfront and the money is held in escrow. You’re paid as soon as delivery is confirmed.',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: MessageCircle,
    title: 'Chat without giving out your number',
    desc: 'Talk to buyers inside the app. Your phone number stays private.',
    color: '#7E22CE',
    bg: '#F3E8FF',
  },
  {
    icon: Video,
    title: 'Show it, don’t just post it',
    desc: 'Short product videos and 24-hour stories show buyers exactly what they’re getting.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
  },
  {
    icon: Users,
    title: 'Build customers who come back',
    desc: 'Your shop gets followers and repeat buyers, not just one-off listings that scroll away.',
    color: '#DC2626',
    bg: '#FEF2F2',
  },
];

const BEFORE = [
  'Reposting the same photos again and again',
  'Giving your personal number to strangers',
  'Worrying about fake payment alerts',
  'Customers who vanish when your post scrolls away',
];

const AFTER = [
  'Listings that stay live and searchable',
  'In-app chat: your number stays private',
  'Payment held in escrow, released on delivery',
  'A shop with followers who come back',
];

const PAY_STEPS = [
  {
    icon: Lock,
    title: 'Buyer pays upfront',
    desc: 'Their money is held safely in escrow, not sent to you yet.',
  },
  {
    icon: Smartphone,
    title: 'You deliver the order',
    desc: 'Agree delivery details in the in-app chat.',
  },
  {
    icon: Wallet,
    title: 'You get paid',
    desc: 'Once the buyer confirms delivery, the money is released to you.',
  },
];

const STEPS = [
  { n: '01', title: 'Download the app', desc: 'Free on iOS and Android.', tag: 'Free' },
  {
    n: '02',
    title: 'Create a vendor account',
    desc: 'Tap “Vendor Sign Up” on the welcome screen and fill a short form.',
    tag: '≈ 2 minutes',
  },
  {
    n: '03',
    title: 'Verify your ID',
    desc: 'Upload a clear photo of a government-issued ID. We review it within 24 hours.',
    tag: '≤ 24 hours',
  },
  {
    n: '04',
    title: 'Start selling',
    desc: 'List your first item, post a video if you like, and go live straight away.',
    tag: 'You’re live',
  },
];

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes. Joining is free and there are no listing fees.',
  },
  {
    q: 'When do I get paid?',
    a: 'Buyers pay upfront and the money is held in escrow. As soon as the buyer confirms delivery, you get paid.',
  },
  {
    q: 'Will buyers see my phone number?',
    a: 'No. You chat with buyers inside the app, and your phone number stays private.',
  },
  {
    q: 'Why do I have to verify my ID?',
    a: 'It keeps scammers out and makes buyers trust you. It’s a one-time upload of a government-issued ID, and we review it within 24 hours.',
  },
  {
    q: 'Why can’t I sign up on the website?',
    a: 'Identity checks and secure payments happen inside the app, so vendor accounts are created there. Download it, then tap “Vendor Sign Up” on the welcome screen.',
  },
  {
    q: 'I’m not sure yet. Can I try it first?',
    a: 'Yes. Create a shopper account first and upgrade to selling later, right inside the app.',
  },
];

const faqJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}).replace(/</g, '\\u003c');

function StoreButtons({ variant = 'light' }) {
  return (
    <div className={`vs-store-buttons is-${variant}`}>
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="vs-store-btn">
        <Apple size={24} strokeWidth={2} className="vs-store-icon" />
        <span className="vs-store-text">
          <span className="vs-store-label">Download on the</span>
          <span className="vs-store-name">App Store</span>
        </span>
      </a>
      <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="vs-store-btn">
        <Play size={22} strokeWidth={2.2} className="vs-store-icon" />
        <span className="vs-store-text">
          <span className="vs-store-label">Get it on</span>
          <span className="vs-store-name">Google Play</span>
        </span>
      </a>
    </div>
  );
}

export default function VendorSignupPage() {
  return (
    <div className="vs-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />

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
        {/* ═════════ Hero ═════════ */}
        <section className="vs-hero">
          <div className="vs-hero-copy">
            <div className="vs-hero-badge">
              <Store size={13} strokeWidth={2.6} />
              <span>FOR SELLERS · FREE TO JOIN</span>
            </div>

            <h1 className="vs-hero-title">
              Stop chasing buyers.
              <br />
              <span className="vs-hero-title-accent">Let them find you.</span>
            </h1>

            <p className="vs-hero-sub">
              Open your CediMart shop and get in front of shoppers across Ghana who are already
              looking to buy. List in under a minute, chat safely, and get paid through escrow.
            </p>

            <StoreButtons variant="dark" />

            <ul className="vs-hero-trust">
              <li><CheckCircle2 size={15} strokeWidth={2.4} /> No listing fees. Ever.</li>
              <li><CheckCircle2 size={15} strokeWidth={2.4} /> Paid when delivery is confirmed</li>
              <li><CheckCircle2 size={15} strokeWidth={2.4} /> Your number stays private</li>
            </ul>
          </div>

          {/* Decorative phone mock */}
          <div className="vs-hero-visual" aria-hidden="true">
            <div className="vs-phone">
              <div className="vs-phone-notch" />
              <div className="vs-phone-screen">
                <div className="vs-mock-toast">
                  <ShieldCheck size={18} strokeWidth={2.4} />
                  <span>
                    <strong>Payment secured</strong>
                    <small>Held in escrow until delivery</small>
                  </span>
                </div>

                <div className="vs-mock-card">
                  <span className="vs-mock-img" />
                  <span className="vs-mock-info">
                    <b>Laptop, like new</b>
                    <i>GH₵ 850.00</i>
                  </span>
                </div>

                <div className="vs-mock-chat">
                  <span className="vs-mock-bubble">Hi! Is it still available?</span>
                  <span className="vs-mock-bubble is-me">Yes. I can deliver today.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════ Real numbers (hidden until STATS is filled) ═════════ */}
        {STATS.length > 0 && (
          <section className="vs-stats" aria-label="CediMart in numbers">
            {STATS.map((s) => (
              <div key={s.label} className="vs-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </section>
        )}

        {/* ═════════ Before / after ═════════ */}
        <section className="vs-compare">
          <h2 className="vs-section-title">Selling shouldn’t feel like this</h2>
          <p className="vs-section-sub">Sound familiar? Here’s what changes when you sell on CediMart.</p>

          <div className="vs-compare-grid">
            <div className="vs-compare-col is-before">
              <h3>Selling on status &amp; DMs</h3>
              <ul>
                {BEFORE.map((t) => (
                  <li key={t}><X size={16} strokeWidth={2.6} /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="vs-compare-col is-after">
              <h3>Selling on CediMart</h3>
              <ul>
                {AFTER.map((t) => (
                  <li key={t}><Check size={16} strokeWidth={2.8} /> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═════════ Perks ═════════ */}
        <section className="vs-block">
          <h2 className="vs-section-title">Everything you need to sell more</h2>
          <div className="vs-perks">
            {PERKS.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.title}
                  className="vs-perk"
                  style={{ '--perk-color': perk.color, '--perk-bg': perk.bg }}
                >
                  <span className="vs-perk-icon"><Icon size={20} strokeWidth={2.2} /></span>
                  <h3 className="vs-perk-title">{perk.title}</h3>
                  <p className="vs-perk-desc">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═════════ Escrow explainer ═════════ */}
        <section className="vs-escrow">
          <div className="vs-escrow-head">
            <span className="vs-escrow-tag"><ShieldCheck size={13} strokeWidth={2.6} /> ESCROW PROTECTION</span>
            <h2>No more “I’ll pay you later.”</h2>
            <p>The buyer’s money is secured before you deliver, so you never ship on trust alone.</p>
          </div>
          <ol className="vs-pay-steps">
            {PAY_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="vs-pay-step">
                  <span className="vs-pay-icon"><Icon size={20} strokeWidth={2.2} /></span>
                  <span className="vs-pay-n">Step {i + 1}</span>
                  <strong>{s.title}</strong>
                  <p>{s.desc}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ═════════ Testimonials (hidden until filled) ═════════ */}
        {TESTIMONIALS.length > 0 && (
          <section className="vs-block">
            <h2 className="vs-section-title">Sellers like you</h2>
            <div className="vs-quotes">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="vs-quote">
                  <Quote size={20} strokeWidth={2} />
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <strong>{t.name}</strong>
                    {t.role && <span>{t.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ═════════ How it works ═════════ */}
        <section id="how-it-works" className="vs-steps">
          <h2 className="vs-section-title">Open your shop in 4 steps</h2>
          <div className="vs-steps-list">
            {STEPS.map((step) => (
              <div key={step.n} className="vs-step">
                <span className="vs-step-num">{step.n}</span>
                <div className="vs-step-body">
                  <p className="vs-step-title">{step.title}</p>
                  <p className="vs-step-desc">{step.desc}</p>
                </div>
                <span className="vs-step-tag">{step.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═════════ FAQ ═════════ */}
        <section className="vs-faq">
          <h2 className="vs-section-title">Questions? Answered.</h2>
          <div className="vs-faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="vs-faq-item">
                <summary>
                  <span>{f.q}</span>
                  <ChevronDown size={18} strokeWidth={2.4} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ═════════ Final CTA ═════════ */}
        <section className="vs-download" id="download">
          <div className="vs-download-icon"><Smartphone size={34} strokeWidth={1.8} /></div>
          <h2 className="vs-download-title">Your shop is 4 steps away</h2>
          <p className="vs-download-sub">
            Download CediMart, tap <strong>Vendor Sign Up</strong> on the welcome screen, and start
            selling. It’s free, and verification takes under 24 hours.
          </p>
          <StoreButtons variant="light" />
          <p className="vs-download-note">
            Free forever to join <ArrowRight size={13} strokeWidth={2.6} /> no listing fees
          </p>
        </section>

        {/* Footer note */}
        <div className="vs-footer">
          <p>
            Already have a shopper account?{' '}
            <Link href="/login" className="vs-footer-link">Sign in here</Link>
          </p>
          <p className="vs-footer-sub">
            Not sure yet?{' '}
            <Link href="/signup" className="vs-footer-link">Create a shopper account</Link>{' '}
            first. You can always upgrade to selling later in the app.
          </p>
        </div>
      </div>

      <StickyCta appStoreUrl={APP_STORE_URL} playStoreUrl={PLAY_STORE_URL} />
    </div>
  );
}