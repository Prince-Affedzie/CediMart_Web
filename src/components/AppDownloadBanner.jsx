// src/components/AppDownloadBanner.jsx
'use client';

import { useEffect, useState } from 'react';
import { X, Smartphone, Apple, Play } from 'lucide-react';
import './AppDownloadBanner.css';

const DISMISS_KEY = 'cedimart:app-banner-dismissed';
const APP_STORE_URL = 'https://apps.apple.com/us/app/cedimart/id6762318566';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.freshyfood.factory';

export default function AppDownloadBanner() {
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  //  Show the banner only when:
  //    1. We're in the browser (not SSR)
  //    2. The viewport is mobile-width
  //    3. The user hasn't dismissed it in this browser
  //  We also re-check on resize so a phone rotated into landscape
  //  still hides the banner on the desktop-style breakpoint.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const check = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
      setVisible(isMobile && !dismissed);
    };

    check();

    const mq = window.matchMedia('(max-width: 768px)');
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  //  Lock body scroll while the bottom sheet is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (sheetOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [sheetOpen]);

  const dismiss = (e) => {
    e.stopPropagation();
    try { window.localStorage.setItem(DISMISS_KEY, '1'); } catch {}
    setVisible(false);
  };

  const openSheet = () => setSheetOpen(true);
  const closeSheet = () => setSheetOpen(false);

  if (!visible && !sheetOpen) return null;

  return (
    <>
      {visible && (
        <button
          type="button"
          className="adb"
          onClick={openSheet}
          aria-label="Download the CediMart app"
        >
          <span className="adb-icon" aria-hidden="true">
            <Smartphone size={14} strokeWidth={2.4} />
          </span>

          <span className="adb-text">
            <strong>CediMart</strong> is better in the app
          </span>

          <span className="adb-cta" aria-hidden="true">Get app</span>

          <span
            className="adb-close"
            role="button"
            tabIndex={0}
            onClick={dismiss}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismiss(e); }}
            aria-label="Dismiss"
          >
            <X size={12} strokeWidth={2.6} />
          </span>
        </button>
      )}

      {sheetOpen && (
        <div className="adb-sheet-backdrop" onClick={closeSheet}>
          <div className="adb-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="adb-sheet-handle" />

            <div className="adb-sheet-head">
              <h2 className="adb-sheet-title">Get the CediMart app</h2>
              <p className="adb-sheet-sub">
                Faster checkout, in-app chat, and video-first discovery — all in one place.
              </p>
            </div>

            <div className="adb-sheet-links">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="adb-store"
              >
                <Apple size={22} strokeWidth={2} fill="currentColor" />
                <span className="adb-store-text">
                  <span className="adb-store-small">Download on the</span>
                  <span className="adb-store-big">App Store</span>
                </span>
              </a>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="adb-store"
              >
                <Play size={20} strokeWidth={2} fill="currentColor" />
                <span className="adb-store-text">
                  <span className="adb-store-small">Get it on</span>
                  <span className="adb-store-big">Google Play</span>
                </span>
              </a>
            </div>

            <button
              type="button"
              className="adb-sheet-cancel"
              onClick={closeSheet}
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}