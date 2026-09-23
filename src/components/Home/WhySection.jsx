// src/components/Home/WhySection.jsx
import {
  ShieldCheck,
  Truck,
  Lock,
  BadgeCheck,
} from 'lucide-react';

const WHY_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Verified Sellers',
    color: '#0D9488',
    desc: 'Every seller submits a government ID. A green badge means they passed full verification — no anonymous accounts.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    color: '#F97316',
    desc: 'Order before 3pm and most items arrive the same day within your city, door to door.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    color: '#0F766E',
    desc: 'Payments are held in escrow until you confirm the item arrived as described. Your money only moves when you say so.',
  },
  {
    icon: BadgeCheck,
    title: 'Buyer Protection',
    color: '#059669',
    desc: 'Every listing shows condition, real photos, and seller history. Report an issue and we act within 24 hours.',
  },
];

export default function WhySection() {
  return (
    <section className="section" style={{ background: 'var(--void)' }}>
      <div className="section-inner">
        <div style={{ maxWidth: 540, marginBottom: 32 }}>
          <h2 className="section-h2">Built for safe buying and selling.</h2>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            Real verification, real protection, real delivery — wherever you are in Ghana.
          </p>
        </div>

        <div className="why-strip">
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="why-item" style={{ '--wc': item.color, '--wb': item.color + '14' }}>
                <div className="why-icon">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="why-title">{item.title}</div>
                  <div className="why-desc">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}