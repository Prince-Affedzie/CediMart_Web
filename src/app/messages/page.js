// src/app/messages/page.js
import { Suspense } from 'react';
import MessagesClient from './MessagesClient';

export const metadata = {
  title: 'Messages – CediMart',
  robots: { index: false, follow: false }, // private page, keep it out of search
};

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesClient />
    </Suspense>
  );
}