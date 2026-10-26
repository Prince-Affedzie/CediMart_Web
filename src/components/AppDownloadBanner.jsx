// src/components/AppDownloadBanner.jsx
'use client';

import { useEffect, useState } from 'react';
import { X, Smartphone, Apple, Play, Sparkles, Tag, Store, MessageCircle } from 'lucide-react';
import './AppDownloadBanner.css';

const DISMISS_KEY = 'cedimart:app-banner-dismissed';
const WELCOME_KEY = 'cedimart:app-welcome-seen';
const APP_STORE_URL = 'https://apps.apple.com/us/app/cedimart/id6762318566';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.freshyfood.factory';

//  How long to wait before showing the strip on a repeat visit. Long
//  enough that the user has glanced at the page, short enough that
//  they haven't committed to scrolling yet.
const STRIP_DELAY_MS = 1500;

//  How long to wait before showing the centre-screen welcome popup
//  on a first visit. Slightly longer so the page can paint first.
const WELCOME_DELAY_MS = 2500;

export default function AppDownloadBanner() {
  const [visible, setVisible] = useState(false);          // strip
  const [welcomeOpen, setWelcomeOpen] = useState(false);  // first-visit modal
  const [sheetOpen, setSheetOpen] = useState(false);      // store picker

  //  Decide which mode to show:
  //    - First visit in this browser  → centre-screen welcome popup
  //    - Repeat visit (welcome seen)  → thin strip at the top
  //    - Already dismissed the strip  → show nothing
  //  Both are mobile-only (max-width: 768px) and gated on localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 768px)');
    let stripTimer;
    let welcomeTimer;

    const evaluate = () => {
      clearTimeout(stripTimer);
      clearTimeout(welcomeTimer);

      if (!mq.matches) {
        setVisible(false);
        setWelcomeOpen(false);
        return;
      }

      let dismissed = false;
      let welcomeSeen = false;
      try {
        dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
        welcomeSeen = window.localStorage.getItem(WELCOME_KEY) === '1';
      } catch {}

      if (dismissed && welcomeSeen) {
        setVisible(false);
        setWelcomeOpen(false);
        return;
      }

      if (!welcomeSeen) {
        welcomeTimer = setTimeout(() => {
          //  Re-check: user might have dismissed the strip in the
          //  meantime, or resized the window.
          if (mq.matches) setWelcomeOpen(true);
        }, WELCOME_DELAY_MS);
      } else if (!dismissed) {
        stripTimer = setTimeout(() => {
          if (mq.matches) setVisible(true);
        }, STRIP_DELAY_MS);
      }
    };

    evaluate();
    mq.addEventListener('change', evaluate);
    return () => {
      clearTimeout(stripTimer);
      clearTimeout(welcomeTimer);
      mq.removeEventListener('change', evaluate);
    };
  }, []);

  //  Lock body scroll while any overlay is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (sheetOpen || welcomeOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [sheetOpen, welcomeOpen]);

  //  Escape key closes whatever's open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!sheetOpen && !welcomeOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (sheetOpen) setSheetOpen(false);
        else if (welcomeOpen) dismissWelcome();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheetOpen, welcomeOpen]);

  const dismissStrip = (e) => {
    if (e) e.stopPropagation();
    try { window.localStorage.setItem(DISMISS_KEY, '1'); } catch {}
    setVisible(false);
  };

  const dismissWelcome = () => {
    try { window.localStorage.setItem(WELCOME_KEY, '1'); } catch {}
    setWelcomeOpen(false);
  };

  const dismissWelcomeForever = () => {
    try {
      window.localStorage.setItem(WELCOME_KEY, '1');
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setWelcomeOpen(false);
    setVisible(false);
  };

  const openSheet = () => setSheetOpen(true);
  const closeSheet = () => setSheetOpen(false);

  const goToStore = (url) => {
    //  Marking welcome as seen here means the popup won't reappear
    //  even if the user bounces back without installing.
    try {
      window.localStorage.setItem(WELCOME_KEY, '1');
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!visible && !sheetOpen && !welcomeOpen) return null;

  return (
    <>
      {/* ─── FIRST-VISIT WELCOME POPUP ─────────────────────────────── */}
      {welcomeOpen && !sheetOpen && (
        <div className="adb-welcome-backdrop" onClick={dismissWelcome}>
          <div
            className="adb-welcome"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adb-welcome-title"
          >
            <button
              type="button"
              className="adb-welcome-close"
              onClick={dismissWelcome}
              aria-label="Close"
            >
              <X size={16} strokeWidth={2.4} />
            </button>

            <div className="adb-welcome-badge">
              <Sparkles size={13} strokeWidth={2.4} />
              <span>Now nationwide</span>
            </div>

            <h2 id="adb-welcome-title" className="adb-welcome-title">
              Shop Ghana in the app
            </h2>
            <p className="adb-welcome-sub">
              Get the full CediMart experience — social shopping, exclusive
              app-only discounts, and a storefront to sell to buyers across Ghana.
            </p>

            <ul className="adb-welcome-points">
              <li>
                <MessageCircle size={15} strokeWidth={2.2} />
                <span>Chat and negotiate directly with sellers</span>
              </li>
              <li>
                <Tag size={15} strokeWidth={2.2} />
                <span>Unlock app-only deals and discounts</span>
              </li>
              <li>
                <Store size={15} strokeWidth={2.2} />
                <span>Open a free storefront and sell nationwide</span>
              </li>
            </ul>

            <div className="adb-welcome-stores">
              <button
                type="button"
                className="adb-store"
                onClick={() => goToStore(APP_STORE_URL)}
              >
                <Apple size={22} strokeWidth={2} fill="currentColor" />
                <span className="adb-store-text">
                  <span className="adb-store-small">Download on the</span>
                  <span className="adb-store-big">App Store</span>
                </span>
              </button>

              <button
                type="button"
                className="adb-store"
                onClick={() => goToStore(PLAY_STORE_URL)}
              >
                <Play size={20} strokeWidth={2} fill="currentColor" />
                <span className="adb-store-text">
                  <span className="adb-store-small">Get it on</span>
                  <span className="adb-store-big">Google Play</span>
                </span>
              </button>
            </div>

            <button
              type="button"
              className="adb-welcome-skip"
              onClick={dismissWelcome}
            >
              Continue browsing the web
            </button>
          </div>
        </div>
      )}

      {/* ─── REPEAT-VISIT STRIP ────────────────────────────────────── */}
      {visible && !welcomeOpen && (
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
            <strong>Shop, chat &amp; sell</strong> — get the CediMart app
          </span>

          <span className="adb-cta" aria-hidden="true">Get app</span>

          <span
            className="adb-close"
            role="button"
            tabIndex={0}
            onClick={dismissStrip}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismissStrip(e); }}
            aria-label="Dismiss"
          >
            <X size={12} strokeWidth={2.6} />
          </span>
        </button>
      )}

      {/* ─── STORE PICKER SHEET (from strip) ───────────────────────── */}
      {sheetOpen && (
        <div className="adb-sheet-backdrop" onClick={closeSheet}>
          <div
            className="adb-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adb-sheet-title"
          >
            <div className="adb-sheet-handle" />

            <div className="adb-sheet-head">
              <h2 id="adb-sheet-title" className="adb-sheet-title">
                Get the CediMart app
              </h2>
              <p className="adb-sheet-sub">
                Social shopping, app-only discounts, and a storefront to sell
                across Ghana — all in one place.
              </p>
            </div>

            <div className="adb-sheet-links">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="adb-store"
                onClick={() => {
                  try {
                    window.localStorage.setItem(WELCOME_KEY, '1');
                    window.localStorage.setItem(DISMISS_KEY, '1');
                  } catch {}
                }}
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
                onClick={() => {
                  try {
                    window.localStorage.setItem(WELCOME_KEY, '1');
                    window.localStorage.setItem(DISMISS_KEY, '1');
                  } catch {}
                }}
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