// src/components/Home/CategoryNav.jsx
'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/data/General';

export default function CategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  return (
    <nav className="category-nav" aria-label="Departments">
      <div className="category-nav-inner">
        <Link href="/listings" className={`category-nav-item ${!activeCategory && pathname === '/listings' ? 'is-active' : ''}`}>
          All
        </Link>
        {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
          <Link
            key={cat.id}
            href={`/listings?category=${encodeURIComponent(cat.id)}`}
            className={`category-nav-item ${activeCategory === cat.id ? 'is-active' : ''}`}
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}