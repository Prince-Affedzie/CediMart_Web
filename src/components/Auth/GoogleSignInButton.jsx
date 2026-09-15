// src/components/auth/GoogleSignInButton.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Renders Google's official sign-in button via the Google Identity Services
 * library. On successful auth, hands the raw JWT credential back to the
 * caller — same shape the mobile app receives from GoogleSignin.signIn().
 *
 * Props:
 *   - onCredential(credential: string): called with the JWT id_token
 *   - onError(message: string): called on GIS errors
 *   - disabled: boolean — visually disable the wrapper
 *   - text: 'continue_with' | 'signup_with' | 'signin_with'
 *   - width: number — pixels; defaults to 320
 */
export default function GoogleSignInButton({
  onCredential,
  onError,
  disabled = false,
  text = 'continue_with',
  width = 320,
}) {
  const containerRef = useRef(null);
  const initializedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [internalError, setInternalError] = useState('');

  useEffect(() => {
    const clientId = process.env.GOOGLE_CLIENT_ID || '997070470806-0e9on0oijf1lqimg0ldqb0pfjgu2osfq.apps.googleusercontent.com'
    if (!clientId) {
      setInternalError('Google Client ID is not configured.');
      onError?.('Google Client ID is not configured.');
      return;
    }

    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      if (initializedRef.current) return;
      if (!window.google?.accounts?.id) {
        // Script not ready yet — try again on next tick
        setTimeout(init, 120);
        return;
      }
      if (!containerRef.current) return;

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
      });

      // Render the official Google button
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width,
      });

      // Opt out of One Tap for this session so it doesn't collide with our button
      window.google.accounts.id.disableAutoSelect();

      setReady(true);
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [onCredential, onError, text, width]);

  const isDisabled = disabled;

  return (
    <div className={`gsi-wrap${isDisabled ? ' is-disabled' : ''}`}>
      {!ready && (
        <div className="gsi-skeleton" aria-hidden="true">
          <Loader2 size={16} strokeWidth={2.4} className="gsi-spin" />
          <span>Loading Google…</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="gsi-button"
        style={{ display: ready ? 'block' : 'none' }}
      />
      {isDisabled && ready && (
        <div className="gsi-overlay" aria-hidden="true" />
      )}
      {internalError && (
        <p className="gsi-error">{internalError}</p>
      )}
    </div>
  );
}