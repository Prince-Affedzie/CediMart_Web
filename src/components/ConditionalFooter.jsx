// src/components/ConditionalFooter.jsx
'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

// Routes where the footer should NOT appear.
// Use plain string prefixes — matched with `.startsWith()`.
// Order matters: longer prefixes first if you have overlaps.
const HIDDEN_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify',
  '/vendor-login',
  '/vendor-signup',
  '/cart',
  '/checkout',
  '/orders',
  '/order',
  '/favorites',
  '/account',
  '/product',
];

export default function ConditionalFooter() {
  const pathname = usePathname();

  const hidden = HIDDEN_PREFIXES.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (hidden) return null;
  return <Footer />;
}