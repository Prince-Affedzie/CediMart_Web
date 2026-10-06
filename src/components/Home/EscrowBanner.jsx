// src/components/Home/EscrowBanner.jsx
'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Wallet,
  Truck,
  BadgeCheck,
  ArrowRight,
  Headset,
} from 'lucide-react';

// npm install lucide-react

const STEPS = [
  {
    icon: Wallet,
    title: 'You pay into escrow',
    text: 'Your money goes to us, not straight to the seller.',
  },
  {
    icon: Truck,
    title: 'Seller ships your order',
    text: 'They send it knowing the payment is already secured.',
  },
  {
    icon: BadgeCheck,
    title: 'You confirm, seller is paid',
    text: 'Funds are released only after you confirm delivery.',
  },
];

const TRUST = [
  { icon: Lock, label: 'Funds held securely' },
  { icon: ShieldCheck, label: 'Buyer protection' },
  { icon: Headset, label: 'Dispute support' },
];

export default function EscrowBanner() {
  return (
    <section className="eb" aria-labelledby="eb-title">
      <style>{`
        .eb {
          --eb-ink: #042F2E;
          --eb-deep: #0F766E;
          --eb-brand: #0D9488;
          --eb-mint: #99F6E4;
          position: relative;
          overflow: hidden;
          margin: 40px 0;
          padding: clamp(28px, 4.5vw, 52px);
          border-radius: 24px;
          color: #fff;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          align-items: center;
          gap: clamp(28px, 5vw, 56px);
          background:
            radial-gradient(900px 420px at 100% 0%, rgba(153,246,228,.22), transparent 60%),
            radial-gradient(600px 360px at 0% 110%, rgba(4,47,46,.55), transparent 65%),
            linear-gradient(135deg, var(--eb-brand) 0%, var(--eb-deep) 55%, #115E59 100%);
          box-shadow: 0 24px 48px -24px rgba(4,47,46,.55);
        }

        /* Soft concentric rings behind the card */
        .eb::before,
        .eb::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.12);
          pointer-events: none;
        }
        .eb::before { width: 520px; height: 520px; right: -140px; top: -180px; }
        .eb::after  { width: 340px; height: 340px; right: -50px;  top: -90px; }

        .eb-content { position: relative; z-index: 1; max-width: 540px; }

        .eb-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 8px;
          margin-bottom: 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.28);
          backdrop-filter: blur(6px);
        }
        .eb-tag-icon {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          color: var(--eb-deep);
        }

        .eb-title {
          margin: 0 0 12px;
          font-size: clamp(26px, 3.4vw, 40px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -.02em;
          color: #fff;
        }
        .eb-text {
          margin: 0 0 24px;
          max-width: 46ch;
          font-size: 15.5px;
          line-height: 1.65;
          color: rgba(255,255,255,.86);
        }

        .eb-trust {
          list-style: none;
          margin: 0 0 28px;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 10px 22px;
        }
        .eb-trust li {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,.92);
        }
        .eb-trust svg { color: var(--eb-mint); flex-shrink: 0; }

        .eb-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 22px;
          border-radius: 12px;
          background: #fff;
          color: var(--eb-deep);
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 20px -8px rgba(4,47,46,.6);
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .eb-btn svg { transition: transform .18s ease; }
        .eb-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 24px -8px rgba(4,47,46,.65); }
        .eb-btn:hover svg { transform: translateX(3px); }
        .eb-btn:focus-visible { outline: 3px solid var(--eb-mint); outline-offset: 3px; }

        /* The flow card — the one memorable element */
        .eb-flow {
          position: relative;
          z-index: 1;
          padding: 22px;
          border-radius: 20px;
          background: rgba(255,255,255,.96);
          color: var(--eb-ink);
          box-shadow: 0 24px 48px -20px rgba(4,47,46,.6);
        }
        .eb-flow-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid #E2EFEE;
          font-size: 14px;
          font-weight: 700;
        }
        .eb-flow-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #0F766E;
          background: #CCFBF1;
        }

        .eb-steps { list-style: none; margin: 0; padding: 0; }
        .eb-step {
          position: relative;
          display: flex;
          gap: 14px;
          padding-bottom: 20px;
        }
        .eb-step:last-child { padding-bottom: 0; }
        /* connecting line between step icons */
        .eb-step:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 19px;
          top: 42px;
          bottom: 2px;
          width: 2px;
          background: repeating-linear-gradient(
            to bottom, #99D5CE 0 4px, transparent 4px 8px
          );
        }
        .eb-step-icon {
          flex-shrink: 0;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #F0FDFA;
          border: 1px solid #BFEDE6;
          color: var(--eb-deep);
        }
        .eb-step:last-child .eb-step-icon {
          background: var(--eb-brand);
          border-color: var(--eb-brand);
          color: #fff;
        }
        .eb-step-title { margin: 1px 0 2px; font-size: 14.5px; font-weight: 700; }
        .eb-step-text { margin: 0; font-size: 13.5px; line-height: 1.5; color: #4B6563; }

        @media (max-width: 860px) {
          .eb { grid-template-columns: 1fr; }
          .eb-content { max-width: none; }
        }
        @media (max-width: 480px) {
          .eb { border-radius: 18px; }
          .eb-flow { padding: 18px; }
          .eb-btn { width: 100%; justify-content: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .eb-btn, .eb-btn svg { transition: none; }
          .eb-btn:hover, .eb-btn:hover svg { transform: none; }
        }
      `}</style>

      <div className="eb-content">
        <span className="eb-tag">
          <span className="eb-tag-icon" aria-hidden="true">
            <ShieldCheck size={14} strokeWidth={2.4} />
          </span>
          Secure transactions
        </span>

        <h2 id="eb-title" className="eb-title">
          Your money is safe with us
        </h2>
        <p className="eb-text">
          We hold your payment securely until your order arrives. Sellers only
          get paid after you confirm delivery.
        </p>

        <ul className="eb-trust">
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label}>
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>

        <Link href="/listings" className="eb-btn">
          Shop with confidence
          <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </div>

      <div className="eb-flow">
        <div className="eb-flow-head">
          How escrow protects you
          <span className="eb-flow-badge">
            <Lock size={12} strokeWidth={2.6} aria-hidden="true" />
            Escrow protected
          </span>
        </div>

        <ol className="eb-steps">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li className="eb-step" key={title}>
              <span className="eb-step-icon" aria-hidden="true">
                <Icon size={20} strokeWidth={2} />
              </span>
              <div>
                <h3 className="eb-step-title">{title}</h3>
                <p className="eb-step-text">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}