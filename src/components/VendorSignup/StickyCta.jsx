// src/components/VendorSignup/StickyCta.jsx
'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

export default function StickyCta({ appStoreUrl, playStoreUrl }) {
  const [href, setHref] = useState(playStoreUrl);
  const [hidden, setHidden] = useState(false);

  // Send iPhone users to the App Store, everyone else to Google Play
  useEffect(() => {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) setHref(appStoreUrl);
  }, [appStoreUrl]);

  // The bar is redundant once the page's own download section is on screen
  useEffect(() => {
    const target = document.getElementById('download');
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.2 });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`vs-sticky${hidden ? ' is-hidden' : ''}`}>
      <span className="vs-sticky-text">
        <strong>Start selling today</strong>
        <small>Free to join · No listing fees</small>
      </span>
      <a href={href} target="_blank" rel="noopener noreferrer" className="vs-sticky-btn">
        <Smartphone size={16} strokeWidth={2.4} /> Get the app
      </a>
    </div>
  );
}