// src/app/account/page.js
'use client';

import { Suspense, useState, useEffect } from 'react';
import AccountClient from './AccountClient';


function AccountFallback() {
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
      Loading profile…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountClient />
    </Suspense>
  );
}