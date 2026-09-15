// src/app/login/LoginClient.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/Auth/GoogleSignInButton';
import BrandLogo from '@/assets/cedimart_logo.png';
import './login.css';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    login: authLogin,
    google_login: googleLogin,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [topError, setTopError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const sessionExpired = searchParams.get('expired') === '1';
  const isLoading = loading || googleLoading;

  // If already signed in, bounce to the redirect target — but only after
  // auth has finished checking localStorage, otherwise we'd redirect on a
  // stale read.
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;
    const redirect = searchParams.get('redirect') || '/';
    router.replace(redirect);
  }, [isAuthenticated, authLoading, router, searchParams]);

  const validateForm = () => {
    const next = {};
    const trimmed = formData.phone.trim();
    if (!trimmed) next.phone = 'Phone number is required';
    else if (!/^[0-9]{10,15}$/.test(trimmed))
      next.phone = 'Please enter a valid phone number';
    if (!formData.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (topError) setTopError('');
  };

  // ── Google Login ────────────────────────────────────────────────────────
  const handleGoogleLogin = async (credential) => {
    if (isLoading) return;

    setGoogleLoading(true);
    setTopError('');

    try {
      const response = await googleLogin({ token: credential });

      if (response?.success) {
        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } else {
        setTopError(
          response?.error ||
            response?.message ||
            "Couldn't sign you in with Google. Please try again."
        );
      }
    } catch (err) {
      console.error('Google Login error:', err);
      setTopError(
        err?.response?.data?.message ||
          err?.message ||
          'An unexpected error occurred. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (message) => {
    setTopError(message || 'Google sign-in is unavailable right now.');
  };

  // ── Regular Login ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isLoading) return;
    if (!validateForm()) return;

    setLoading(true);
    setTopError('');

    try {
      const response = await authLogin({
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (response?.success) {
        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } else {
        setTopError(
          response?.error ||
            response?.message ||
            "Couldn't sign you in. Please check your details and try again."
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      setTopError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-page">
      {/* Back button */}
      <button
        type="button"
        className="lg-back"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ArrowLeft size={18} strokeWidth={2.4} />
      </button>

      <div className="lg-shell">
        <div className="lg-card">
          {/* Header */}
          <header className="lg-header">
            <div className="lg-logo-wrap">
              <Image
                src={BrandLogo}
                alt="CediMart"
                width={56}
                height={56}
                priority
                className="lg-logo"
              />
            </div>
            <h1 className="lg-title">Welcome Back</h1>
            <p className="lg-subtitle">Sign in to your account to continue</p>
          </header>

          {/* Vendor banner */}
          <Link href="/vendor-login" className="lg-vendor-banner">
            <div className="lg-vendor-accent" />
            <div className="lg-vendor-content">
              <div className="lg-vendor-title-row">
                <span className="lg-vendor-title">Selling on CediMart?</span>
                <span className="lg-vendor-badge">VENDOR</span>
              </div>
            </div>
            <div className="lg-vendor-cta">
              <span className="lg-vendor-cta-left">
                Login as Vendor Here
                <ArrowRight size={16} strokeWidth={2.6} />
              </span>
              <span className="lg-vendor-cta-right">It&apos;s free!</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="lg-divider-row">
            <span className="lg-divider" />
            <span className="lg-divider-text">For Buyers</span>
            <span className="lg-divider" />
          </div>

          {/* Session expired banner */}
          {sessionExpired && !topError && (
            <div className="lg-error-banner" role="alert">
              <AlertCircle size={16} strokeWidth={2.4} />
              <span>Your session expired. Please sign in again.</span>
            </div>
          )}

          {/* Top error banner */}
          {topError && (
            <div className="lg-error-banner" role="alert">
              <AlertCircle size={16} strokeWidth={2.4} />
              <span>{topError}</span>
            </div>
          )}

          {/* Google Sign-In */}
          <div className="lg-google-block">
            <GoogleSignInButton
              onCredential={handleGoogleLogin}
              onError={handleGoogleError}
              disabled={isLoading}
              text="continue_with"
              width={360}
            />
            {googleLoading && (
              <div className="lg-google-loading" role="status">
                <Loader2
                  size={16}
                  strokeWidth={2.4}
                  className="lg-spin"
                />
                <span>Signing you in…</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="lg-divider-row">
            <span className="lg-divider" />
            <span className="lg-divider-text">OR</span>
            <span className="lg-divider" />
          </div>

          {/* Form */}
          <form className="lg-form" onSubmit={handleSubmit} noValidate>
            {/* Phone */}
            <div className="lg-field">
              <label htmlFor="lg-phone" className="lg-label">
                Phone Number
              </label>
              <div
                className={`lg-input-wrap${
                  errors.phone ? ' lg-input-error' : ''
                }`}
              >
                <Phone size={18} strokeWidth={2.2} className="lg-input-icon" />
                <input
                  id="lg-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="lg-input"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange(
                      'phone',
                      e.target.value.replace(/[^0-9]/g, '')
                    )
                  }
                  maxLength={15}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <span className="lg-field-error">
                  <AlertCircle size={13} strokeWidth={2.4} /> {errors.phone}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="lg-field">
              <div className="lg-password-header">
                <label htmlFor="lg-password" className="lg-label">
                  Password
                </label>
                <Link href="/forgot-password" className="lg-forgot">
                  Forgot Password?
                </Link>
              </div>
              <div
                className={`lg-input-wrap${
                  errors.password ? ' lg-input-error' : ''
                }`}
              >
                <Lock size={18} strokeWidth={2.2} className="lg-input-icon" />
                <input
                  id="lg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="lg-input lg-input-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="lg-eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2.2} />
                  ) : (
                    <Eye size={18} strokeWidth={2.2} />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="lg-field-error">
                  <AlertCircle size={13} strokeWidth={2.4} /> {errors.password}
                </span>
              )}
            </div>

            {/* Remember me */}
            <button
              type="button"
              className="lg-remember"
              onClick={() => setRememberMe((v) => !v)}
              disabled={isLoading}
              aria-pressed={rememberMe}
            >
              <span className={`lg-checkbox${rememberMe ? ' is-checked' : ''}`}>
                {rememberMe && <Check size={13} strokeWidth={3} />}
              </span>
              <span>Remember me</span>
            </button>

            {/* Submit */}
            <button
              type="submit"
              className={`lg-submit${loading ? ' is-loading' : ''}`}
              disabled={isLoading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    strokeWidth={2.4}
                    className="lg-spin"
                  />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Shopper</span>
                  <ArrowRight size={18} strokeWidth={2.6} />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="lg-signup">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="lg-signup-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}