// src/app/listings/page.js
import { Suspense } from 'react';
import ListingsClient from './ListingsClient';

//  Static shell that Next can pre-render at build time. The client component
//  below is the only thing that touches useSearchParams, and it's wrapped in
//  Suspense — which is what prevents the classic
//  "useSearchParams() should be wrapped in a suspense boundary" build error.
export const dynamic = 'force-dynamic';

export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsFallback />}>
      <ListingsClient />
    </Suspense>
  );
}

//  A simple skeleton that matches the eventual layout so there's no layout
//  shift when the real component hydrates.
function ListingsFallback() {
  return (
    <div className="lp-page" aria-hidden="true">
      <div className="lp-topbar">
        <div className="lp-topbar-inner">
          <div className="lp-topbar-left">
            <h1 className="lp-topbar-title">Shop</h1>
            <span className="lp-topbar-count">Loading…</span>
          </div>
        </div>
      </div>
      <div className="lp-shell">
        <div className="lp-right">
          <main className="lp-main">
            <div className="lp-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="lp-skeleton-card" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}