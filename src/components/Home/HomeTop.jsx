import Link from 'next/link';
import { ChevronRight, Store, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '@/constants/listings/categories';
import HeroCarousel from './HeroCarousel';
import './home-top.css';

export default function HomeTop() {
  return (
    <section className="ht">
      {/* Left: category sidebar (desktop only) */}
      <aside className="ht-cats" aria-label="Categories">
        <h2 className="ht-cats-title">Categories</h2>
        <ul>
          {CATEGORIES.slice(0, 10).map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.key}>
                <Link href={`/categories/${encodeURIComponent(c.key)}`} className="ht-cat">
                  {Icon && <Icon size={17} strokeWidth={2} />}
                  <span>{c.label}</span>
                  <ChevronRight size={14} className="ht-cat-arrow" />
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href="/listings" className="ht-cats-all">All categories →</Link>
      </aside>

      {/* Center: hero */}
      <div className="ht-hero">
        <HeroCarousel />
      </div>

      {/* Right: promo cards (large desktop only). Adjust the hrefs. */}
      <div className="ht-promos">
        <Link href="/sell" className="ht-promo ht-promo-sell">
          <Store size={26} />
          <strong>Sell on CediMart</strong>
          <span>List an item in minutes and reach a wide audience of customers. It's free.</span>
        </Link>
        <Link href="/how-it-works" className="ht-promo ht-promo-escrow">
          <ShieldCheck size={26} />
          <strong>Shop with escrow</strong>
          <span>We hold your money until you recieve your Item. Secure payment protection</span>
        </Link>
      </div>
    </section>
  );
}