// src/app/checkout/page.js
import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Checkout · CediMart',
  description: 'Complete your order securely on CediMart',
};

function CheckoutFallback() {
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
      Preparing checkout…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutClient />
    </Suspense>
  );
}