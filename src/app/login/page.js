// src/app/login/page.js
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const metadata = {
  title: 'Login · CediMart',
  description: 'Sign in to your CediMart account',
};

function LoginFallback() {
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
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}