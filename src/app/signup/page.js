// src/app/signup/page.js
import { Suspense } from 'react';
import SignUpClient from './SignUpClient';

export const metadata = {
  title: 'Create Account · CediMart',
  description: 'Join CediMart — buy and sell on your campus',
};

function SignUpFallback() {
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
      Loading…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpClient />
    </Suspense>
  );
}