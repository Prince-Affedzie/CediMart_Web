// src/app/order/[id]/page.js
import { Suspense } from 'react';
import OrderDetailClient from './OrderDetailClient';

export const metadata = {
  title: 'Order Details · CediMart',
  description: 'View your order details, track delivery, and manage your order',
};

function OrderDetailFallback() {
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
      Loading order…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<OrderDetailFallback />}>
      <OrderDetailClient />
    </Suspense>
  );
}