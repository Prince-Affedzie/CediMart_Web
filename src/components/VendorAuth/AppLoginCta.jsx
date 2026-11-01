// src/components/VendorAuth/AppLoginCta.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';

const APP_SCHEME = 'cedimart://';

function usePlatform() {
  const [platform, setPlatform] = useState(null); // null until mounted, avoids a hydration mismatch
  useEffect(() => {
    const ua = navigator.userAgent;
    const ipadOs = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1; // iPadOS pretends to be a Mac
    if (/iPhone|iPad|iPod/i.test(ua) || ipadOs) setPlatform('ios');
    else if (/Android/i.test(ua)) setPlatform('android');
    else setPlatform('desktop');
  }, []);
  return platform;
}

// Try the app; if the page is still in front after a moment, the app isn't installed → open the store.
function useAppOpener(platform, appStoreUrl, playStoreUrl) {
  return useCallback(() => {
    const storeUrl = platform === 'ios' ? appStoreUrl : playStoreUrl;
    let left = false;
    const onHide = () => { if (document.hidden) left = true; };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);

    window.location.href = APP_SCHEME;

    setTimeout(() => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      if (!left && !document.hidden) window.location.href = storeUrl;
    }, 1600);
  }, [platform, appStoreUrl, playStoreUrl]);
}

export default function OpenAppButton({ appStoreUrl, playStoreUrl }) {
  const platform = usePlatform();
  const open = useAppOpener(platform, appStoreUrl, playStoreUrl);
  if (platform !== 'ios' && platform !== 'android') return null;

  return (
    <div className="vl-open" id="vl-hero-cta">
      <button type="button" className="vl-open-btn" onClick={open}>
        <ExternalLink size={18} strokeWidth={2.4} /> Open the CediMart app
      </button>
      <p className="vl-open-hint">Don’t have it yet? We’ll take you to the store.</p>
    </div>
  );
}

// Bottom bar on phones, shown once the main button has scrolled out of view
export function StickyOpenApp({ appStoreUrl, playStoreUrl }) {
  const platform = usePlatform();
  const open = useAppOpener(platform, appStoreUrl, playStoreUrl);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById('vl-hero-cta');
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 });
    io.observe(target);
    return () => io.disconnect();
  }, [platform]);

  if (platform !== 'ios' && platform !== 'android') return null;

  return (
    <div className={`vl-sticky${visible ? ' is-visible' : ''}`}>
      <span className="vl-sticky-text">
        <strong>Your shop is waiting</strong>
        <small>Log in as Vendor in the app</small>
      </span>
      <button type="button" className="vl-sticky-btn" onClick={open}>
        <ExternalLink size={15} strokeWidth={2.4} /> Open app
      </button>
    </div>
  );
}