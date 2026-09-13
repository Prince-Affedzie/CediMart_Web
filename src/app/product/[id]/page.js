// src/app/product/[id]/page.js
import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';

export const metadata = {
  title: 'Product · CediMart',
  description: 'View product details, seller information, and more on CediMart',
};

function ProductDetailFallback() {
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
      Loading product…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ProductDetailFallback />}>
      <ProductDetailClient />
    </Suspense>
  );
}