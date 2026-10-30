import { ShieldCheck, BadgeCheck, MessageCircle, Zap } from 'lucide-react';

const ITEMS = [
  { icon: ShieldCheck,   title: 'Escrow-protected',    sub: 'Money held until you confirm' },
  { icon: BadgeCheck,    title: 'Verified sellers',    sub: 'Real vendors, real products' },
  { icon: MessageCircle, title: 'Chat before you buy', sub: 'Negotiate directly' },
  { icon: Zap,           title: 'Sell in minutes',     sub: 'Free to list' },
];

export default function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Why CediMart">
      {ITEMS.map(({ icon: Icon, title, sub }) => (
        <div key={title} className="trust-item">
          <Icon size={22} strokeWidth={2} />
          <div><strong>{title}</strong><span>{sub}</span></div>
        </div>
      ))}
    </section>
  );
}