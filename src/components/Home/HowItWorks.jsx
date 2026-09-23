// src/components/Home/HowItWorks.jsx
import { MessageCircle, FileText, Wallet, Truck } from 'lucide-react';

const STEPS = [
  {
    Icon: MessageCircle,
    title: 'Send your list',
    desc: 'WhatsApp us your foodstuff list and quantities — a typed list or a photo of your handwritten one works.',
  },
  {
    Icon: FileText,
    title: 'Get one quotation',
    desc: 'We check prices across our partnered farms and supplier network, then send back a single, clear quote.',
  },
  {
    Icon: Wallet,
    title: 'Approve & pay',
    desc: "Confirm the price and pay. We only purchase once you've approved — no surprises, no hidden markups.",
  },
  {
    Icon: Truck,
    title: 'Sourced, checked, delivered',
    desc: 'We buy the items, inspect for quantity and quality, consolidate everything, and deliver to your kitchen.',
  },
];

export default function HowItWorks({ reveal, sectionRef }) {
  return (
    <section className="section how-section" id="how-it-works" ref={sectionRef}>
      <div className={`section-inner reveal ${reveal ? 'shown' : ''}`}>
        <div className="how-head">
          <span className="section-eyebrow" style={{ '--ec': 'var(--brand)' }}>
            How it works
          </span>
          <h2 className="section-h2">From list to delivery, in four steps</h2>
          <p className="section-sub">
            First orders usually go out within 24 hours. Save your list once,
            then reorder the same essentials in a single message every week.
          </p>
        </div>

        <ol className="how-timeline">
          {STEPS.map((s, i) => (
            <li className="how-step" key={s.title}>
              <div className="how-step-marker">
                <span className="how-step-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="how-step-line" aria-hidden="true" />
              </div>
              <div className="how-step-body">
                <div className="how-step-icon">
                  <s.Icon size={20} strokeWidth={2} />
                </div>
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}