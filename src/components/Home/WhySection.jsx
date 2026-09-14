// src/components/Home/WhySection.jsx
import {
  ShieldCheck,
  Bike,
  Lock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

const WHY_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Verified Sellers',
    color: '#0D9488',
    desc: 'Every vendor submits a national ID and student card. A green badge means they passed full verification — no anonymous accounts.',
  },
  {
    icon: Bike,
    title: 'Same-Day Delivery',
    color: '#F97316',
    desc: 'Order before 3pm and your item arrives on campus the same day. Campus-to-campus, hostel-to-hostel — usually within hours.',
  },
  {
    icon: Lock,
    title: 'Secured Transactions',
    color: '#0F766E',
    desc: 'Payments are held in escrow until you confirm you received the item as described. Your money only moves when you say it should.',
  },
  {
    icon: ShieldAlert,
    title: 'Zero Fraud Policy',
    color: '#DC2626',
    desc: 'Every account is tied to a verified identity. Report a bad transaction and we freeze the seller\'s account within 24 hours — no exceptions.',
  },
  {
    icon: Sparkles,
    title: 'Quality at Student Prices',
    color: '#059669',
    desc: 'Second-hand doesn\'t mean worn out. Every listing shows condition, real photos, and seller history — so you know exactly what you\'re getting.',
  },
];

export default function WhySection({ reveal, sectionRef }) {
  return (
    <section
      className="section"
      style={{ background: 'var(--void)' }}
      ref={sectionRef}
    >
      <div className="section-inner">
        <div
          className={`reveal ${reveal ? 'shown' : ''}`}
          style={{
            textAlign: 'center',
            maxWidth: 540,
            margin: '0 auto 52px',
          }}
        >
          <p
            className="section-eyebrow"
            style={{ '--ec': '#DC2626', textAlign: 'center' }}
          >
            — Why CediMart
          </p>
          <h2 className="section-h2">
            Built to make campus
            <br />
            <span style={{ color: '#DC2626' }}>buying and selling safe.</span>
          </h2>
          <p
            className="section-sub"
            style={{ margin: '0 auto', textAlign: 'center' }}
          >
            Real verification, real protection, real delivery. CediMart is the
            only marketplace designed around how students actually trade — quick,
            local, and trustworthy.
          </p>
        </div>

        <div className="why-grid">
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`why-card reveal ${reveal ? 'shown' : ''}`}
                style={{
                  '--wc': item.color,
                  '--wb': item.color + '12',
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div className="why-icon">
                  <Icon size={26} strokeWidth={1.9} />
                </div>
                <div className="why-title">{item.title}</div>
                <div className="why-desc">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}