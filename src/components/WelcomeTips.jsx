// src/components/Home/WelcomeTips.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  Clapperboard,
  Store,
  Zap,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

// npm install lucide-react

const TIPS = [
  {
    icon: ShieldCheck,
    tone: 'teal',
    badge: 'Escrow protection',
    title: 'Shop safely with escrow',
    text: 'We hold your payment until your order arrives. The seller is only paid after you confirm delivery.',
  },
  {
    icon: Clapperboard,
    tone: 'violet',
    badge: 'Feeds',
    title: 'Discover products in Feeds',
    text: 'Swipe through short, interactive videos from sellers. See products in action, then buy right from the video.',
  },
  {
    icon: Store,
    tone: 'amber',
    badge: 'Vendors & products',
    title: 'A wide range to choose from',
    text: 'Browse many vendors and thousands of products in one place, from everyday items to unique finds.',
  },
  {
    icon: Zap,
    tone: 'rose',
    badge: 'Instant delivery',
    title: 'Get your order fast',
    text: 'Choose instant delivery on eligible items and have your purchase on its way within minutes.',
  },
];

export default function WelcomeTips({
  delay = 1500,
  storageKey = 'welcome-tips-seen',
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Show once per visitor, after a short delay
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === '1';
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [delay, storageKey]);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const tip = TIPS[index];
  const Icon = tip.icon;
  const isLast = index === TIPS.length - 1;

  return (
    <div
      className="wt"
      role="dialog"
      aria-label="Welcome tips"
      aria-live="polite"
    >
      <style>{`
        .wt {
          --wt-brand: #0D9488;
          --wt-deep: #0F766E;
          --wt-ink: #042F2E;
          position: fixed;
          left: 24px;
          bottom: 24px;
          z-index: 1000;
          width: min(360px, calc(100vw - 32px));
          padding: 20px;
          border-radius: 20px;
          background: #fff;
          color: var(--wt-ink);
          border: 1px solid #DCEBE9;
          box-shadow: 0 24px 48px -16px rgba(4,47,46,.35), 0 4px 12px rgba(4,47,46,.08);
          animation: wt-in .45s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes wt-in {
          from { opacity: 0; transform: translateY(16px) scale(.97); }
          to   { opacity: 1; transform: none; }
        }

        /* little pointer, like a tooltip */
        .wt::after {
          content: '';
          position: absolute;
          left: 30px;
          bottom: -7px;
          width: 14px;
          height: 14px;
          background: #fff;
          border-right: 1px solid #DCEBE9;
          border-bottom: 1px solid #DCEBE9;
          transform: rotate(45deg);
        }

        .wt-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .wt-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 600;
          padding: 4px 10px 4px 4px;
          border-radius: 999px;
        }
        .wt-badge-icon {
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          color: #fff;
        }
        .wt-teal   .wt-badge { background: #CCFBF1; color: #0F766E; }
        .wt-teal   .wt-badge-icon { background: #0D9488; }
        .wt-violet .wt-badge { background: #EDE9FE; color: #6D28D9; }
        .wt-violet .wt-badge-icon { background: #7C3AED; }
        .wt-amber  .wt-badge { background: #FEF3C7; color: #B45309; }
        .wt-amber  .wt-badge-icon { background: #D97706; }
        .wt-rose   .wt-badge { background: #FFE4E6; color: #BE123C; }
        .wt-rose   .wt-badge-icon { background: #E11D48; }

        .wt-close {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #5B7573;
          cursor: pointer;
        }
        .wt-close:hover { background: #F0F6F5; color: var(--wt-ink); }

        .wt-title { margin: 0 0 6px; font-size: 18px; font-weight: 800; letter-spacing: -.01em; }
        .wt-text  { margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #4B6563; }

        .wt-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .wt-dots { display: flex; gap: 6px; }
        .wt-dot {
          width: 7px; height: 7px; padding: 0; border: 0; border-radius: 999px;
          background: #CFE3E0; cursor: pointer;
          transition: width .2s ease, background .2s ease;
        }
        .wt-dot[aria-current='true'] { width: 20px; background: var(--wt-brand); }

        .wt-actions { display: flex; align-items: center; gap: 8px; }
        .wt-back {
          display: grid; place-items: center; width: 36px; height: 36px;
          border: 1px solid #DCEBE9; border-radius: 10px; background: #fff;
          color: var(--wt-ink); cursor: pointer;
        }
        .wt-back:hover { background: #F0F6F5; }
        .wt-next {
          display: inline-flex; align-items: center; gap: 6px;
          height: 36px; padding: 0 14px; border: 0; border-radius: 10px;
          background: var(--wt-brand); color: #fff;
          font-size: 13.5px; font-weight: 700; cursor: pointer;
        }
        .wt-next:hover { background: var(--wt-deep); }

        .wt button:focus-visible { outline: 3px solid #5EEAD4; outline-offset: 2px; }

        @media (max-width: 480px) {
          .wt { left: 16px; bottom: 16px; padding: 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .wt { animation: none; }
          .wt-dot { transition: none; }
        }
      `}</style>

      <div className={`wt-${tip.tone}`}>
        <div className="wt-top">
          <span className="wt-badge">
            <span className="wt-badge-icon" aria-hidden="true">
              <Icon size={14} strokeWidth={2.4} />
            </span>
            {tip.badge}
          </span>
          <button className="wt-close" onClick={close} aria-label="Close tips">
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        <h3 className="wt-title">{tip.title}</h3>
        <p className="wt-text">{tip.text}</p>

        <div className="wt-bottom">
          <div className="wt-dots">
            {TIPS.map((t, i) => (
              <button
                key={t.badge}
                className="wt-dot"
                aria-label={`Go to tip ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>

          <div className="wt-actions">
            {index > 0 && (
              <button
                className="wt-back"
                onClick={() => setIndex(index - 1)}
                aria-label="Previous tip"
              >
                <ArrowLeft size={16} strokeWidth={2.4} />
              </button>
            )}
            {isLast ? (
              <button className="wt-next" onClick={close}>
                Start shopping
                <Check size={16} strokeWidth={2.6} aria-hidden="true" />
              </button>
            ) : (
              <button className="wt-next" onClick={() => setIndex(index + 1)}>
                Next
                <ArrowRight size={16} strokeWidth={2.6} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}