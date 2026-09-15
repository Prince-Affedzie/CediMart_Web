// src/app/signup/SignUpClient.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SignUp } from '@/apis/userApi';
import GoogleSignInButton from '@/components/Auth/GoogleSignInButton';
import BrandLogo from '@/assets/cedimart_logo.png';
import './signup.css';

export default function SignUpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    login: authLogin,
    google_signUp,
    isAuthenticated,
  } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [topError, setTopError] = useState('');

  const isLoading = loading || googleLoading;

  // If already authenticated, bounce
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    }
  }, [isAuthenticated, router, searchParams]);

  const validateForm = () => {
    const next = {};
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    const ph = formData.phone.trim();

    if (!fn) next.firstName = 'First name is required';
    else if (fn.length < 2)
      next.firstName = 'First name must be at least 2 characters';

    if (!ln) next.lastName = 'Last name is required';
    else if (ln.length < 2)
      next.lastName = 'Last name must be at least 2 characters';

    if (!ph) next.phone = 'Phone number is required';
    else if (!/^[0-9]{10,15}$/.test(ph))
      next.phone = 'Please enter a valid phone number';

    if (!formData.password) next.password = 'Password is required';
    else if (formData.password.length < 6)
      next.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword)
      next.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      next.confirmPassword = 'Passwords do not match';

    if (!agreedToTerms)
      next.terms =
        'You must agree to the Terms of Service and Privacy Policy';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (topError) setTopError('');
  };

  // ── Google Sign-Up ──────────────────────────────────────────────────────
  const handleGoogleSignUp = async (credential) => {
    if (isLoading) return;
    if (!agreedToTerms) {
      setErrors((prev) => ({
        ...prev,
        terms:
          'Please agree to the Terms of Service and Privacy Policy before continuing.',
      }));
      return;
    }

    setGoogleLoading(true);
    setTopError('');

    try {
      const response = await google_signUp({ token: credential });

      if (response?.success) {
        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } else {
        setTopError(
          response?.error ||
            response?.message ||
            'Google sign-up failed. Please try again.'
        );
      }
    } catch (err) {
      console.error('Google Sign-Up error:', err);
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

  // ── Regular Sign-Up ─────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e?.preventDefault();
    if (isLoading) return;

    if (!agreedToTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: 'You must agree to the Terms of Service and Privacy Policy',
      }));
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setTopError('');

    try {
      const response = await SignUp({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (response.status === 200 || response.success) {
        const loginResponse = await authLogin({
          phone: formData.phone.trim(),
          password: formData.password,
        });

        if (loginResponse.success) {
          const redirect = searchParams.get('redirect') || '/';
          router.replace(redirect);
        } else {
          setTopError(
            'Account created but auto-login failed. Please sign in manually.'
          );
          setTimeout(() => router.replace('/login'), 1500);
        }
      } else {
        setTopError(
          response.error ||
            response.message ||
            'Registration failed. Please try again.'
        );
      }
    } catch (err) {
      console.error('Signup error:', err);
      setTopError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordHintId = 'su-password-hint';
  const termsErrorId = 'su-terms-error';

  return (
    <div className="su-page">
      {/* Back button */}
      <button
        type="button"
        className="su-back"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ArrowLeft size={18} strokeWidth={2.4} />
      </button>

      <div className="su-shell">
        <div className="su-card">
          {/* Header */}
          <header className="su-header">
            <div className="su-logo-wrap">
              <Image
                src={BrandLogo}
                alt="CediMart"
                width={56}
                height={56}
                priority
                className="su-logo"
              />
            </div>
            <h1 className="su-title">Create Account</h1>
            <p className="su-subtitle">
              Join our community of buyers and sellers
            </p>
          </header>

          {/* Vendor banner */}
          <Link href="/vendor-signup" className="su-vendor-banner">
            <div className="su-vendor-accent" />
            <div className="su-vendor-content">
              <div className="su-vendor-title-row">
                <span className="su-vendor-title">
                  Wants to sell on CediMart?
                </span>
                <span className="su-vendor-badge">NEW</span>
              </div>
            </div>
            <div className="su-vendor-cta">
              <span className="su-vendor-cta-left">
                Create Vendor Account Here
                <ArrowRight size={16} strokeWidth={2.6} />
              </span>
              <span className="su-vendor-cta-right">It&apos;s free!</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="su-divider-row">
            <span className="su-divider" />
            <span className="su-divider-text">For Buyers</span>
            <span className="su-divider" />
          </div>

          {/* Terms card */}
          <div className="su-terms-card">
            <button
              type="button"
              className="su-terms-row"
              onClick={() => {
                setAgreedToTerms((v) => !v);
                if (errors.terms)
                  setErrors((prev) => ({ ...prev, terms: '' }));
              }}
              disabled={isLoading}
              aria-pressed={agreedToTerms}
              aria-describedby={errors.terms ? termsErrorId : undefined}
            >
              <span
                className={`su-checkbox${agreedToTerms ? ' is-checked' : ''}`}
              >
                {agreedToTerms && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="su-terms-text">
                I agree to the{' '}
                <Link
                  href="/terms-of-service"
                  className="su-terms-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy-policy"
                  className="su-terms-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>
              </span>
            </button>

            {errors.terms && (
              <span id={termsErrorId} className="su-terms-error">
                <AlertCircle size={13} strokeWidth={2.4} /> {errors.terms}
              </span>
            )}

            <p className="su-terms-note">
              By creating an account, you acknowledge that CediMart is a
              platform powered by user-generated content. You agree to our
              zero-tolerance policy on abuse, harassment, and hate speech.
            </p>
          </div>

          {/* Google Sign-In */}
          <div className="su-google-block">
            <GoogleSignInButton
              onCredential={handleGoogleSignUp}
              onError={handleGoogleError}
              disabled={isLoading || !agreedToTerms}
              text="signup_with"
              width={360}
            />
            {googleLoading && (
              <div className="su-google-loading" role="status">
                <Loader2
                  size={16}
                  strokeWidth={2.4}
                  className="su-spin"
                />
                <span>Creating your account…</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="su-divider-row">
            <span className="su-divider" />
            <span className="su-divider-text">OR</span>
            <span className="su-divider" />
          </div>

          {/* Top error banner */}
          {topError && (
            <div className="su-error-banner" role="alert">
              <AlertCircle size={16} strokeWidth={2.4} />
              <span>{topError}</span>
            </div>
          )}

          {/* Form */}
          <form className="su-form" onSubmit={handleSignUp} noValidate>
            {/* Name row */}
            <div className="su-name-row">
              <div className="su-field">
                <label htmlFor="su-firstName" className="su-label">
                  First Name
                </label>
                <div
                  className={`su-input-wrap${
                    errors.firstName ? ' su-input-error' : ''
                  }`}
                >
                  <User
                    size={18}
                    strokeWidth={2.2}
                    className="su-input-icon"
                  />
                  <input
                    id="su-firstName"
                    type="text"
                    autoComplete="given-name"
                    className="su-input"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange('firstName', e.target.value)
                    }
                    maxLength={30}
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && (
                  <span className="su-field-error">
                    <AlertCircle size={13} strokeWidth={2.4} />{' '}
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className="su-field">
                <label htmlFor="su-lastName" className="su-label">
                  Last Name
                </label>
                <div
                  className={`su-input-wrap${
                    errors.lastName ? ' su-input-error' : ''
                  }`}
                >
                  <User
                    size={18}
                    strokeWidth={2.2}
                    className="su-input-icon"
                  />
                  <input
                    id="su-lastName"
                    type="text"
                    autoComplete="family-name"
                    className="su-input"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange('lastName', e.target.value)
                    }
                    maxLength={30}
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && (
                  <span className="su-field-error">
                    <AlertCircle size={13} strokeWidth={2.4} />{' '}
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="su-field">
              <label htmlFor="su-phone" className="su-label">
                Phone Number
              </label>
              <div
                className={`su-input-wrap${
                  errors.phone ? ' su-input-error' : ''
                }`}
              >
                <Phone
                  size={18}
                  strokeWidth={2.2}
                  className="su-input-icon"
                />
                <input
                  id="su-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="su-input"
                  placeholder="e.g., 0541234567"
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
                <span className="su-field-error">
                  <AlertCircle size={13} strokeWidth={2.4} /> {errors.phone}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="su-field">
              <label htmlFor="su-password" className="su-label">
                Password
              </label>
              <div
                className={`su-input-wrap${
                  errors.password ? ' su-input-error' : ''
                }`}
              >
                <Lock
                  size={18}
                  strokeWidth={2.2}
                  className="su-input-icon"
                />
                <input
                  id="su-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="su-input su-input-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  disabled={isLoading}
                  aria-describedby={passwordHintId}
                />
                <button
                  type="button"
                  className="su-eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={isLoading}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2.2} />
                  ) : (
                    <Eye size={18} strokeWidth={2.2} />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="su-field-error">
                  <AlertCircle size={13} strokeWidth={2.4} />{' '}
                  {errors.password}
                </span>
              )}
              <span id={passwordHintId} className="su-hint">
                <Info size={13} strokeWidth={2.4} /> Must be at least 6
                characters long
              </span>
            </div>

            {/* Confirm password */}
            <div className="su-field">
              <label htmlFor="su-confirmPassword" className="su-label">
                Confirm Password
              </label>
              <div
                className={`su-input-wrap${
                  errors.confirmPassword ? ' su-input-error' : ''
                }`}
              >
                <Lock
                  size={18}
                  strokeWidth={2.2}
                  className="su-input-icon"
                />
                <input
                  id="su-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="su-input su-input-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="su-eye-btn"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  disabled={isLoading}
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} strokeWidth={2.2} />
                  ) : (
                    <Eye size={18} strokeWidth={2.2} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="su-field-error">
                  <AlertCircle size={13} strokeWidth={2.4} />{' '}
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`su-submit${loading ? ' is-loading' : ''}`}
              disabled={isLoading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    strokeWidth={2.4}
                    className="su-spin"
                  />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Shopper Account</span>
                  <ArrowRight size={18} strokeWidth={2.6} />
                </>
              )}
            </button>
          </form>

          {/* Sign-in link */}
          <p className="su-login">
            Already have an account?{' '}
            <Link href="/login" className="su-login-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}