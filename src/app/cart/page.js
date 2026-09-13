// src/app/cart/page.js
import { Suspense } from 'react';
import CartClient from './CartClient';


function CartFallback() {
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
      Loading cart…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CartFallback />}>
      <CartClient />
    </Suspense>
  );
}