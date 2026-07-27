// src/app/auth/page.js
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import icon from '@/app/icon.jpg';
import GoogleLogo from '@/assets/Google-logo.png';
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  LogIn
} from 'lucide-react';

// ─── API imports ───────────────────────────────────────────────────────────
import { login as authLogin, loginByGoogle } from '@/apis/authApi';

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
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const nextUrl = searchParams.get('next') || '/';
  const refCode = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const buildRedirectUrl = () => nextUrl;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10,15}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isLoading = loading || googleLoading;

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setGoogleLoading(true);
    setGeneralError('');
    try {
      const response = await loginByGoogle({ token: 'google_web_token' });
      if (response?.success || response.status ===200) {
        localStorage.setItem('cm_token', response.data.token);
        localStorage.setItem('cm_user', JSON.stringify(response.data.user));
        router.push(buildRedirectUrl());
      } else {
        setGeneralError(response?.error || response?.message || 'Google login failed. Please try phone login instead.');
      }
    } catch (error) {
      setGeneralError('Google Sign-In failed. Please try again or use phone login.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setGeneralError('');
    try {
      const response = await authLogin({ 
        phone: formData.phone.trim(), 
        password: formData.password 
      });
      
      if (response?.success || response.status ===200) {
        localStorage.setItem('cm_token', response.data.token);
        localStorage.setItem('cm_user', JSON.stringify(response.data?.user));
        router.push(buildRedirectUrl());
      } else {
        setGeneralError(response?.error || response?.message || "Login failed. Please check your credentials or internet connection.");
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    setGeneralError('');
  };

  return (
    <>
      <style>{loginStyles}</style>
      
      <div className="login-page">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <Image src={icon} alt="CediMart" width={56} height={56} priority />
          </div>

          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>

          {/* Google Login 
          <button 
            className="login-google-btn" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            {googleLoading ? (
              <span className="login-btn-loading">
                <Loader2 className="login-spinner-icon" /> Connecting...
              </span>
            ) : (
              <>
                <Image src={GoogleLogo} alt="Google" width={20} height={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>*/}

          {/* Divider 
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">OR</span>
            <span className="login-divider-line" />
          </div>
          */}

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="login-form">
            {/* Phone Number */}
            <div className="login-input-group">
              <label className="login-label">Phone Number</label>
              <div className={`login-input-wrap ${errors.phone ? 'login-input-error' : ''}`}>
                <Phone size={18} className="login-input-icon" />
                <input
                  type="tel"
                  className="login-input"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={15}
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <p className="login-error-text">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="login-input-group">
              <div className="login-password-header">
                <label className="login-label">Password</label>
                <Link href="/forgot-password" className="login-forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <div className={`login-input-wrap ${errors.password ? 'login-input-error' : ''}`}>
                <Lock size={18} className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-password-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="login-error-text">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <label className="login-remember">
              <input type="checkbox" defaultChecked className="login-checkbox" />
              <span>Remember me</span>
            </label>

            {/* General Error */}
            {generalError && (
              <div className="login-general-error">
                <AlertCircle size={16} /> {generalError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {loading ? (
                <span className="login-btn-loading">
                  <Loader2 size={18} className="login-spinner-icon" /> Signing In...
                </span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                  <ArrowRight size={18} className="login-submit-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="login-signup-link">
            Don't have an account?{' '}
            <Link href={`/signup?next=${encodeURIComponent(nextUrl)}${refCode ? `&ref=${refCode}` : ''}`}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Loading fallback for Suspense ─────────────────────────────────────────
function LoginFallback() {
  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="login-logo">
            <Image src={icon} alt="CediMart" width={56} height={56} priority />
          </div>
          <Loader2 size={36} className="login-spinner-icon" style={{ margin: '20px auto', display: 'block' }} />
          <p style={{ marginTop: 12, color: '#475569', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    </>
  );
}

// ─── Page export with Suspense boundary ────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${C.gray50};
    padding: 20px;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  }

  .login-card {
    background: ${C.white};
    border-radius: 20px;
    padding: clamp(28px, 4vw, 40px);
    max-width: 420px;
    width: 100%;
    box-shadow: 0 4px 24px rgba(0,0,0,.06);
    border: 1px solid ${C.gray200};
  }

  .login-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  .login-logo img {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(13,148,136,.15);
  }

  .login-title {
    font-size: 26px;
    font-weight: 800;
    color: ${C.brandD};
    text-align: center;
    margin-bottom: 6px;
    letter-spacing: -.3px;
  }
  .login-subtitle {
    font-size: 14px;
    color: ${C.t2};
    text-align: center;
    margin-bottom: 24px;
  }

  .login-google-btn {
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
  .login-google-btn:hover:not(:disabled) {
    border-color: ${C.brand};
    background: ${C.brandBg};
  }
  .login-google-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
  }
  .login-google-btn img {
    width: 20px;
    height: 20px;
  }

  .login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .login-divider-line {
    flex: 1;
    height: 1px;
    background: ${C.gray200};
  }
  .login-divider-text {
    font-size: 13px;
    color: ${C.t3};
    font-weight: 500;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .login-input-group {
    margin-bottom: 16px;
  }
  .login-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: ${C.t2};
    margin-bottom: 6px;
  }
  .login-password-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .login-forgot-link {
    font-size: 12px;
    color: ${C.brand};
    font-weight: 600;
    text-decoration: none;
  }
  .login-forgot-link:hover {
    text-decoration: underline;
  }

  .login-input-wrap {
    display: flex;
    align-items: center;
    background: ${C.gray50};
    border: 1.5px solid ${C.gray200};
    border-radius: 12px;
    padding: 0 14px;
    transition: border-color .2s, box-shadow .2s;
    position: relative;
  }
  .login-input-wrap:focus-within {
    border-color: ${C.brand};
    box-shadow: 0 0 0 3px rgba(13,148,136,.1);
    background: ${C.white};
  }
  .login-input-error {
    border-color: ${C.danger};
    background: ${C.dangerBg};
  }
  .login-input-error:focus-within {
    border-color: ${C.danger};
    box-shadow: 0 0 0 3px rgba(220,38,38,.1);
  }

  .login-input-icon {
    color: ${C.t3};
    margin-right: 8px;
    flex-shrink: 0;
  }
  .login-input-wrap:focus-within .login-input-icon {
    color: ${C.brand};
  }
  .login-input-error .login-input-icon {
    color: ${C.danger};
  }
  
  .login-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 13px 0;
    font-size: 15px;
    color: ${C.t1};
    background: transparent;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .login-input::placeholder {
    color: ${C.t3};
  }
  .login-password-input {
    padding-right: 40px;
  }
  .login-eye-btn {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    color: ${C.t3};
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color .15s;
  }
  .login-eye-btn:hover {
    color: ${C.t2};
  }

  .login-error-text {
    font-size: 12px;
    color: ${C.danger};
    margin-top: 5px;
    margin-left: 2px;
    font-weight: 500;
  }

  .login-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: ${C.t2};
    cursor: pointer;
    margin-bottom: 20px;
  }
  .login-checkbox {
    width: 18px;
    height: 18px;
    accent-color: ${C.brand};
    cursor: pointer;
  }

  .login-general-error {
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

  .login-submit-btn {
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
  .login-submit-btn:hover:not(:disabled) {
    background: ${C.brandD};
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(13,148,136,.25);
  }
  .login-submit-btn:disabled {
    background: ${C.brandBorder};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .login-btn-loading {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .login-spinner-icon {
    animation: spin .7s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .login-signup-link {
    text-align: center;
    font-size: 14px;
    color: ${C.t2};
  }
  .login-signup-link a {
    color: ${C.brand};
    font-weight: 700;
    text-decoration: none;
  }
  .login-signup-link a:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .login-card {
      padding: 24px 20px;
      border-radius: 16px;
    }
    .login-title {
      font-size: 22px;
    }
  }
`;