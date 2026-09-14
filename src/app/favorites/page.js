// src/app/favorites/page.js
import { Suspense } from 'react';
import FavoritesClient from './FavoritesClient';

export const metadata = {
  title: 'My Favorites · CediMart',
  description: 'Products you have saved for later on CediMart',
};

function FavoritesFallback() {
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
      Loading favorites…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<FavoritesFallback />}>
      <FavoritesClient />
    </Suspense>
  );
}