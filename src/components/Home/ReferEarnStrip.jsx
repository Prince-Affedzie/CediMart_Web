// src/components/Home/ReferEarnStrip.jsx
'use client';

import Link from 'next/link';

export default function ReferEarnStrip() {
  return (
    <div className="refer-strip">
      <div className="refer-strip-inner">
        <span className="refer-strip-icon">🎁</span>
        <span className="refer-strip-text">
          <strong>Refer a friend, earn GH₵10.</strong> They shop, you get paid.
        </span>
        <Link href="/refer" className="refer-strip-link">Learn how →</Link>
      </div>
    </div>
  );
}