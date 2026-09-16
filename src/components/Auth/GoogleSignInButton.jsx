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
  const fitFrameRef = useRef(null);
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

  // Scale Google's rendered button down to fit when its actual content is
  // wider than the space we have — which happens once Google recognizes an
  // existing session and swaps to a wider "Continue as [Name]" chip that
  // needs more room than the plain button. We used to force the iframe's
  // CSS width down to match the container, but that just clips whatever
  // Google drew inside it (the logo, usually) instead of resizing it.
  // Scaling shrinks everything proportionally so nothing gets cut off.
  const fitToContainer = useCallback(() => {
    if (!buttonRef.current || !containerRef.current) return;
    const iframe = buttonRef.current.querySelector('iframe');
    const wrap = buttonRef.current.firstElementChild; // Google's own wrapper div
    if (!iframe || !wrap) return;

    const naturalWidth = parseFloat(iframe.getAttribute('width')) || iframe.getBoundingClientRect().width;
    const naturalHeight = parseFloat(iframe.getAttribute('height')) || iframe.getBoundingClientRect().height;
    const containerWidth = containerRef.current.clientWidth;
    if (!naturalWidth || !containerWidth) return;

    const scale = naturalWidth > containerWidth ? containerWidth / naturalWidth : 1;
    wrap.style.transform = scale < 1 ? `scale(${scale})` : '';
    wrap.style.transformOrigin = 'center';

    // Scaling shrinks the button visually but not the space its box
    // reserves in the page, so pull the reserved height in to match —
    // otherwise a shrunk button leaves a gap underneath it.
    buttonRef.current.style.minHeight = naturalHeight ? `${naturalHeight * scale}px` : '';
  }, []);

  // Render (or re-render) the button at the given width.
  const renderButton = useCallback((w) => {
    if (!buttonRef.current) return;
    if (!window.google?.accounts?.id) return;

    // Clear existing content so a re-render doesn't stack buttons.
    buttonRef.current.innerHTML = '';
    buttonRef.current.style.minHeight = '';

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

  // Watch for Google (re)drawing the button — including swapping to the
  // wider personalized chip after the initial render — and fit it to the
  // container whenever that happens.
  useEffect(() => {
    if (!ready || !buttonRef.current) return;
    if (typeof MutationObserver === 'undefined') return;

    const scheduleFit = () => {
      if (fitFrameRef.current) cancelAnimationFrame(fitFrameRef.current);
      fitFrameRef.current = requestAnimationFrame(fitToContainer);
    };

    const mo = new MutationObserver(scheduleFit);
    mo.observe(buttonRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['width', 'height'],
    });

    // Catch the initial render too, in case it lands before this observer
    // is attached.
    scheduleFit();

    return () => {
      mo.disconnect();
      if (fitFrameRef.current) cancelAnimationFrame(fitFrameRef.current);
    };
  }, [ready, fitToContainer]);

  // Re-render when the container resizes (rotation, sidebar open/close, etc.)
  useEffect(() => {
    if (!ready || !containerRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      const w = computeWidth();
      if (Math.abs(w - lastRenderedWidthRef.current) < 8) {
        // Same requested width, but the available space may still have
        // changed relative to it (e.g. orientation change) — refit rather
        // than skip entirely.
        fitToContainer();
        return;
      }
      renderButton(w);
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [ready, computeWidth, renderButton, fitToContainer]);

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
          style={{ display: ready ? 'flex' : 'none' }}
        />
      </div>

      {disabled && ready && <div className="gsi-overlay" aria-hidden="true" />}

      {internalError && <p className="gsi-error">{internalError}</p>}
    </div>
  );
}