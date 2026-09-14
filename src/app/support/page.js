// src/app/support/page.js
import { Suspense } from 'react';
import SupportClient from './SupportClient';

export const metadata = {
  title: 'Help & Support · CediMart',
  description: 'Get help with buying, selling, delivery, payments, and more on CediMart',
};

function SupportFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8',
        fontSize: 15,
        fontWeight: 500,
      }}
    >
      Loading support…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SupportFallback />}>
      <SupportClient />
    </Suspense>
  );
}