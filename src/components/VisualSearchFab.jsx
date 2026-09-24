'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera } from 'lucide-react';
import './VisualSearchFab.css';

export default function VisualSearchFab() {
  const pathname = usePathname();

  if (pathname?.startsWith('/visual-search')) return null;

  return (
    <Link
      href="/visual-search"
      className="vs-fab"
      aria-label="Visual search — find products by photo"
    >
      <span className="vs-fab-halo" aria-hidden="true" />
      <Camera size={18} strokeWidth={2.4} className="vs-fab-icon" />
      <span className="vs-fab-label">Visual Search</span>
      <span className="vs-fab-sparkle" aria-hidden="true">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 9.7 9.7 2 12l7.7 2.3L12 22l2.3-7.7L22 12l-7.7-2.3z" />
        </svg>
      </span>
    </Link>
  );
}