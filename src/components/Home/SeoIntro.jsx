
import Link from 'next/link';
import { CATEGORIES } from '@/constants/listings/categories';

export default function SeoIntro() {
  return (
    <section className="seo-intro">
      <h1>Buy and Sell Online in Ghana with CediMart</h1>

      <p>
        CediMart is an online marketplace in Ghana that makes it
        easy for everyone to buy and sell products in one place.
        Whether you're an individual selling personal items, a
        business reaching new customers, or a shopper looking for
        great deals, CediMart connects buyers and sellers across
        Ghana. Explore phones, laptops, electronics, fashion,
        beauty products, home essentials, accessories and much more.
      </p>

      <p>
        Find products, compare offers, connect with sellers and
        shop with greater confidence. With features like in-app
        messaging and escrow-protected payments, CediMart helps
        make online transactions more convenient and secure.
        Sellers can list their products and reach potential
        customers beyond their immediate communities, while buyers
        can find a wide range of products from different sellers
        in one marketplace.
      </p>

      <div className="seo-intro-links">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/categories/${encodeURIComponent(c.key)}`}
          >
            {c.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
