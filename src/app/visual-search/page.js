// src/app/visual-search/page.js
import { Suspense } from 'react';
import VisualSearchClient from './VisualSearchClient';

export const dynamic = 'force-dynamic';

export default function VisualSearchPage() {
  return (
    <Suspense fallback={null}>
      <VisualSearchClient />
    </Suspense>
  );
}