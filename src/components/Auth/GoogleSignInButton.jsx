// src/components/auth/GoogleSignInButton.jsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

const MIN_WIDTH = 200;   // Google's documented minimum
const MAX_WIDTH = 400;   // Google's documented maximum
const DEFAULT_WIDTH = 320;

export default function GoogleSignInButton({
  onCredential,
  onError,
  disabled = false,
  text = 'continue_with',
  width,
}) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);
  const lastRenderedWidthRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [internalError, setInternalError] = useState('');

  // Compute the actual width available to the button. Falls back to the
  // prop if provided, otherwise measures the container.
  const computeWidth = useCallback(() => {
    if (typeof width === 'number' && width > 0) {
      return Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
    }
    if (!containerRef.current) return DEFAULT_WIDTH;
    const w = containerRef.current.clientWidth;
    return Math.min(Math.max(w, MIN_WIDTH), MAX_WIDTH);
  }, [width]);

  // Render (or re-render) the button at the given width.
  const renderButton = useCallback((w) => {
    if (!buttonRef.current) return;
    if (!window.google?.accounts?.id) return;

    // Clear existing content so a re-render doesn't stack buttons.
    buttonRef.current.innerHTML = '';

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'rectangular',
      logo_alignment: 'left',
      width: w,
    });

    lastRenderedWidthRef.current = w;
  }, [text]);

  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      '997070470806-0e9on0oijf1lqimg0ldqb0pfjgu2osfq.apps.googleusercontent.com';

    if (!clientId) {
      setInternalError('Google Client ID is not configured.');
      onError?.('Google Client ID is not configured.');
      return;
    }

    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      if (!window.google?.accounts?.id) {
        setTimeout(init, 120);
        return;
      }
      if (!containerRef.current) return;

      // One-time initialization
      if (!initializedRef.current) {
        initializedRef.current = true;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) {
              onError?.('Google did not return a credential.');
              return;
            }
            onCredential?.(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          // Keep the picker anchored to our button rather than top-right.
          ux_mode: 'popup',
        });

        window.google.accounts.id.disableAutoSelect();

        setReady(true);
      }

      // (Re)render at the correct width
      const w = computeWidth();
      renderButton(w);
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [onCredential, onError, computeWidth, renderButton]);

  // Re-render when the container resizes (rotation, sidebar open/close, etc.)
  useEffect(() => {
    if (!ready || !containerRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      const w = computeWidth();
      if (Math.abs(w - lastRenderedWidthRef.current) < 8) return; // ignore tiny jitters
      renderButton(w);
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [ready, computeWidth, renderButton]);

  return (
    <div className={`gsi-wrap${disabled ? ' is-disabled' : ''}`}>
      {!ready && (
        <div className="gsi-skeleton" aria-hidden="true">
          <Loader2 size={16} strokeWidth={2.4} className="gsi-spin" />
          <span>Loading Google…</span>
        </div>
      )}

      {/* The outer div is what we measure; the inner div is where Google
          injects its iframe. Keeping them separate prevents Google's iframe
          from affecting our measured width. */}
      <div ref={containerRef} className="gsi-measure">
        <div
          ref={buttonRef}
          className="gsi-button"
          style={{ display: ready ? 'block' : 'none' }}
        />
      </div>

      {disabled && ready && <div className="gsi-overlay" aria-hidden="true" />}

      {internalError && <p className="gsi-error">{internalError}</p>}
    </div>
  );
}