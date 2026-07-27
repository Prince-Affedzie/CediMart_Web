// src/app/signup/page.js
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import icon from '@/app/icon.jpg';
import GoogleLogo from '@/assets/Google-logo.png';

// ─── API imports ───────────────────────────────────────────────────────────
import { login as authLogin, signUpByGoogle, SignUp } from '@/apis/authApi';

// ─── Force dynamic rendering (fixes Vercel build error) ────────────────────
export const dynamic = 'force-dynamic';

// ─── Teal + Coral Design Tokens ────────────────────────────────────────────
const C = {
  brand:        '#0D9488',
  brandL:       '#14B8A6',
  brandD:       '#0F766E',
  brandBg:      '#F0FDFA',
  brandBorder:  '#99F6E4',
  accent:       '#F97316',
  accentBg:     '#FFF7ED',
  accentBorder: '#FED7AA',
  success:      '#059669',
  successBg:    '#ECFDF5',
  danger:       '#DC2626',
  dangerBg:     '#FEF2F2',
  info:         '#0284C7',
  infoBg:       '#F0F9FF',
  white:        '#FFFFFF',
  black:        '#000000',
  t1:           '#0F172A',
  t2:           '#475569',
  t3:           '#94A3B8',
  gray50:       '#FAFAFA',
  gray100:      '#F5F5F5',
  gray200:      '#E5E7EB',
};

// ─── Inner component (uses useSearchParams) ────────────────────────────────
function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextUrl = searchParams.get('next') || '/';
  const refCode = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isLoading = loading || googleLoading;

  const buildRedirectUrl = () => nextUrl;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    else if (formData.firstName.length < 2) newErrors.firstName = 'First name must be at least 2 characters';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (formData.lastName.length < 2) newErrors.lastName = 'Last name must be at least 2 characters';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10,15}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    setGeneralError('');
  };

  const handleGoogleSignUp = async () => {
    if (isLoading) return;
    setGoogleLoading(true);
    setGeneralError('');
    try {
      const response = await signUpByGoogle({ token: 'google_web_token' });
      if (response?.success || response.status ===200) {
        localStorage.setItem('cm_token', response.data.token);
        localStorage.setItem('cm_user', JSON.stringify(response.data?.user));
        router.push(buildRedirectUrl());
      } else {
        setGeneralError(response?.error || response?.message || 'Google sign-up failed. Please try phone sign-up instead.');
      }
    } catch (error) {
      setGeneralError('Google Sign-Up failed. Please try again or use phone sign-up.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    if (!agreedToTerms) {
      setGeneralError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    setGeneralError('');
    try {
      const signUpResponse = await SignUp({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (signUpResponse.status !== 200 && !signUpResponse.success) {
        setGeneralError(signUpResponse.error || signUpResponse.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      const loginResponse = await authLogin({
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (loginResponse?.success || loginResponse.status ===200) {
        localStorage.setItem('cm_token', loginResponse.data.token);
        localStorage.setItem('cm_user', JSON.stringify(loginResponse.data?.user));
        router.push(buildRedirectUrl());
      } else {
        setGeneralError('Account created! Please sign in to continue.');
        setTimeout(() => {
          router.push(`/auth?next=${encodeURIComponent(nextUrl)}${refCode ? `&ref=${refCode}` : ''}`);
        }, 2000);
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{signupStyles}</style>

      <div className="signup-page">
        <div className="signup-card">
          <div className="signup-logo">
            <Image src={icon} alt="CediMart" width={56} height={56} priority />
          </div>

          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join our community of buyers and sellers</p>

          <button className="signup-google-btn" onClick={handleGoogleSignUp} disabled={isLoading}>
            {googleLoading ? (
              <span className="signup-btn-loading">
                <span className="signup-spinner" /> Connecting...
              </span>
            ) : (
              <>
                <Image src={GoogleLogo} alt="Google" width={20} height={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="signup-divider">
            <span className="signup-divider-line" />
            <span className="signup-divider-text">OR</span>
            <span className="signup-divider-line" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="signup-form">
            <div className="signup-name-row">
              <div className="signup-input-group signup-half">
                <label className="signup-label">First Name</label>
                <div className={`signup-input-wrap ${errors.firstName ? 'signup-input-error' : ''}`}>
                  <input
                    type="text"
                    className="signup-input"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    maxLength={30}
                    disabled={isLoading}
                    autoCapitalize="words"
                  />
                </div>
                {errors.firstName && <p className="signup-error-text">{errors.firstName}</p>}
              </div>

              <div className="signup-input-group signup-half">
                <label className="signup-label">Last Name</label>
                <div className={`signup-input-wrap ${errors.lastName ? 'signup-input-error' : ''}`}>
                  <input
                    type="text"
                    className="signup-input"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    maxLength={30}
                    disabled={isLoading}
                    autoCapitalize="words"
                  />
                </div>
                {errors.lastName && <p className="signup-error-text">{errors.lastName}</p>}
              </div>
            </div>

            <div className="signup-input-group">
              <label className="signup-label">Phone Number</label>
              <div className={`signup-input-wrap ${errors.phone ? 'signup-input-error' : ''}`}>
                <input
                  type="tel"
                  className="signup-input"
                  placeholder="e.g., 0541234567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={15}
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <p className="signup-error-text">{errors.phone}</p>}
            </div>

            <div className="signup-input-group">
              <label className="signup-label">Password</label>
              <div className={`signup-input-wrap ${errors.password ? 'signup-input-error' : ''}`}>
                <span className="signup-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="signup-input signup-password-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="signup-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="signup-error-text">{errors.password}</p>}
              <p className="signup-hint">Must be at least 6 characters long</p>
            </div>

            <div className="signup-input-group">
              <label className="signup-label">Confirm Password</label>
              <div className={`signup-input-wrap ${errors.confirmPassword ? 'signup-input-error' : ''}`}>
                <span className="signup-input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="signup-input signup-password-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="signup-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <p className="signup-error-text">{errors.confirmPassword}</p>}
            </div>

            <label className="signup-terms">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="signup-checkbox"
                disabled={isLoading}
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="signup-link">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="signup-link">Privacy Policy</Link>
              </span>
            </label>

            {generalError && (
              <div className="signup-general-error">
                <span>⚠️</span> {generalError}
              </div>
            )}

            <button type="submit" className="signup-submit-btn" disabled={isLoading}>
              {loading ? (
                <span className="signup-btn-loading">
                  <span className="signup-spinner" /> Creating Account...
                </span>
              ) : (
                <>
                  <span>Create Buyer Account</span>
                  <span className="signup-submit-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <p className="signup-login-link">
            Already have an account?{' '}
            <Link href={`/auth?next=${encodeURIComponent(nextUrl)}${refCode ? `&ref=${refCode}` : ''}`}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Loading fallback ─────────────────────────────────────────────────────
function SignUpFallback() {
  return (
    <>
      <style>{signupStyles}</style>
      <div className="signup-page">
        <div className="signup-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="signup-logo">
            <Image src={icon} alt="CediMart" width={56} height={56} priority />
          </div>
          <div style={{
            width: 36, height: 36,
            border: '3px solid #E2E8F0',
            borderTopColor: '#0D9488',
            borderRadius: '50%',
            animation: 'spin .7s linear infinite',
            margin: '20px auto'
          }} />
          <p style={{ marginTop: 12, color: '#475569', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    </>
  );
}

// ─── Page export with Suspense boundary ────────────────────────────────────
export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpContent />
    </Suspense>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const signupStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  .signup-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${C.gray50};
    padding: 20px;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  }

  .signup-card {
    background: ${C.white};
    border-radius: 20px;
    padding: clamp(28px, 4vw, 40px);
    max-width: 460px;
    width: 100%;
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    border: 1px solid ${C.gray200};
  }

  .signup-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  .signup-logo img {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(13,148,136,.15);
  }

  .signup-title {
    font-size: 26px;
    font-weight: 800;
    color: ${C.brandD};
    text-align: center;
    margin-bottom: 6px;
    letter-spacing: -.3px;
  }
  .signup-subtitle {
    font-size: 14px;
    color: ${C.t2};
    text-align: center;
    margin-bottom: 24px;
  }

  .signup-google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
    border: 1.5px solid ${C.gray200};
    background: ${C.white};
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    color: ${C.t1};
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all .2s;
    margin-bottom: 20px;
  }
  .signup-google-btn:hover:not(:disabled) {
    border-color: ${C.brand};
    background: ${C.brandBg};
  }
  .signup-google-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
  }
  .signup-google-btn img {
    width: 20px;
    height: 20px;
  }

  .signup-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .signup-divider-line {
    flex: 1;
    height: 1px;
    background: ${C.gray200};
  }
  .signup-divider-text {
    font-size: 13px;
    color: ${C.t3};
    font-weight: 500;
  }

  .signup-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .signup-name-row {
    display: flex;
    gap: 12px;
    margin-bottom: 0;
  }
  .signup-half { flex: 1; }

  .signup-input-group { margin-bottom: 16px; }
  .signup-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: ${C.t2};
    margin-bottom: 6px;
  }

  .signup-input-wrap {
    display: flex;
    align-items: center;
    background: ${C.gray50};
    border: 1.5px solid ${C.gray200};
    border-radius: 12px;
    padding: 0 14px;
    transition: border-color .2s, box-shadow .2s;
    position: relative;
  }
  .signup-input-wrap:focus-within {
    border-color: ${C.brand};
    box-shadow: 0 0 0 3px rgba(13,148,136,.1);
    background: ${C.white};
  }
  .signup-input-error {
    border-color: ${C.danger};
    background: ${C.dangerBg};
  }
  .signup-input-error:focus-within {
    border-color: ${C.danger};
    box-shadow: 0 0 0 3px rgba(220,38,38,.1);
  }

  .signup-input-icon {
    font-size: 16px;
    margin-right: 8px;
    flex-shrink: 0;
  }
  .signup-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 13px 0;
    font-size: 15px;
    color: ${C.t1};
    background: transparent;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .signup-input::placeholder { color: ${C.t3}; }
  .signup-password-input { padding-right: 40px; }
  .signup-eye-btn {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    opacity: .6;
    transition: opacity .15s;
  }
  .signup-eye-btn:hover { opacity: 1; }

  .signup-error-text {
    font-size: 12px;
    color: ${C.danger};
    margin-top: 5px;
    margin-left: 2px;
    font-weight: 500;
  }
  .signup-hint {
    font-size: 11px;
    color: ${C.t3};
    margin-top: 6px;
    margin-left: 2px;
  }

  .signup-terms {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: ${C.t2};
    cursor: pointer;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  .signup-checkbox {
    width: 18px;
    height: 18px;
    accent-color: ${C.brand};
    cursor: pointer;
    margin-top: 2px;
    flex-shrink: 0;
  }
  .signup-link {
    color: ${C.brand};
    font-weight: 600;
    text-decoration: none;
  }
  .signup-link:hover { text-decoration: underline; }

  .signup-general-error {
    background: ${C.dangerBg};
    border: 1px solid #FECACA;
    color: ${C.danger};
    font-size: 13px;
    font-weight: 500;
    padding: 10px 14px;
    border-radius: 10px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .signup-submit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 15px;
    border-radius: 12px;
    border: none;
    background: ${C.brand};
    color: ${C.white};
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all .2s;
    margin-bottom: 16px;
  }
  .signup-submit-btn:hover:not(:disabled) {
    background: ${C.brandD};
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(13,148,136,.25);
  }
  .signup-submit-btn:disabled {
    background: ${C.brandBorder};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .signup-submit-arrow { font-size: 18px; }

  .signup-btn-loading { display: flex; align-items: center; gap: 8px; }
  .signup-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .signup-login-link {
    text-align: center;
    font-size: 14px;
    color: ${C.t2};
  }
  .signup-login-link a {
    color: ${C.brand};
    font-weight: 700;
    text-decoration: none;
  }
  .signup-login-link a:hover { text-decoration: underline; }

  @media (max-width: 480px) {
    .signup-card { padding: 24px 20px; border-radius: 16px; }
    .signup-title { font-size: 22px; }
    .signup-name-row { flex-direction: column; gap: 0; }
  }
`;