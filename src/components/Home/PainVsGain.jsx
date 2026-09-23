// src/components/Home/PainVsGain.jsx
import { X, Check, PhoneCall, MapPin, TrendingUp, AlertTriangle, FileText, Truck } from 'lucide-react';

const PAIN = [
  { Icon: PhoneCall,     text: 'Calling 5–6 different suppliers every week' },
  { Icon: MapPin,        text: 'Sending staff to the market in traffic' },
  { Icon: TrendingUp,    text: 'Prices changing without notice' },
  { Icon: AlertTriangle, text: 'Wrong quantity, bad quality, missing items' },
  { Icon: FileText,      text: 'No single record of what you spent' },
];

const GAIN = [
  { Icon: PhoneCall,     text: 'One WhatsApp list, once a week' },
  { Icon: Truck,         text: 'Delivered to your kitchen door' },
  { Icon: TrendingUp,    text: 'One fixed quotation before we buy' },
  { Icon: Check,         text: 'Quantity & quality checked before delivery' },
  { Icon: FileText,      text: 'One clear invoice per order' },
];

export default function PainVsGain({ reveal, sectionRef }) {
  return (
    <section className="section pain-gain-section" ref={sectionRef}>
      <div className={`section-inner reveal ${reveal ? 'shown' : ''}`}>
        <div className="pain-gain-intro">
          <span className="section-eyebrow" style={{ '--ec': 'var(--coral)' }}>
            The sourcing problem
          </span>
          <h2 className="section-h2">
            Your kitchen shouldn't be a sourcing department
          </h2>
          <p className="section-sub">
            Feeding a food business means sourcing, negotiating, coordinating,
            and checking — every single week. CediMart takes that entire job
            off your plate.
          </p>
        </div>

        <div className="pain-gain-split">
          <div className="pain-gain-col pain-col">
            <span className="pain-gain-label bad">The old way</span>
            <h3 className="pain-gain-title">The weekly sourcing scramble</h3>
            <ul className="pain-gain-list">
              {PAIN.map(({ Icon, text }) => (
                <li key={text} className="pain-gain-item">
                  <span className="pain-gain-icon bad">
                    <X size={15} strokeWidth={2.5} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pain-gain-divider" aria-hidden="true" />

          <div className="pain-gain-col gain-col">
            <span className="pain-gain-label good">The CediMart way</span>
            <h3 className="pain-gain-title">Sourcing & coordination, handled</h3>
            <ul className="pain-gain-list">
              {GAIN.map(({ Icon, text }) => (
                <li key={text} className="pain-gain-item">
                  <span className="pain-gain-icon good">
                    <Check size={15} strokeWidth={2.5} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}