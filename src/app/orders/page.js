// src/app/orders/page.js
import { Suspense } from 'react';
import OrdersClient from './OrdersClient';

export const metadata = {
  title: 'My Orders · CediMart',
  description: 'Track and manage your CediMart orders',
};

function OrdersFallback() {
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
      Loading orders…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<OrdersFallback />}>
      <OrdersClient />
    </Suspense>
  );
}