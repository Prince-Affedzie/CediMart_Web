// src/app/vendor/login/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOTP, verifyOTP } from '@/apis/authApi';
import { vendorLogin } from '@/apis/vendorApi';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  void:    '#09090F',
  surf:    '#13131E',
  elev:    '#1C1C2E',
  indigo:  '#6366F1',
  indigoL: '#818CF8',
  indigoDim:'rgba(99,102,241,0.12)',
  amber:   '#F59E0B',
  emerald: '#10B981',
  emeraldDim:'rgba(16,185,129,0.12)',
  coral:   '#F43F5E',
  white:   '#F1F0FF',
  off:     '#A8A8B8',
  muted:   '#52525B',
  border:  '#27273A',
};

const STEPS = { PHONE: 0, OTP: 1 };

// ─── OTP Input ─────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputRef = useRef(null);
  const digits = value.padEnd(6, '').split('');

  return (
    <div className="vl-otp-wrap">
      <div className="vl-otp-boxes" onClick={() => inputRef.current?.focus()}>
        {digits.map((d, i) => (
          <div 
            key={i} 
            className={`vl-otp-box ${d.trim() ? 'filled' : ''} ${value.length === i ? 'active' : ''}`}
          >
            {d.trim() || (value.length === i ? '|' : '')}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="tel"
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        disabled={disabled}
        maxLength={6}
        className="vl-otp-real-input"
        autoFocus
        autoComplete="one-time-code"
        placeholder="Enter 6-digit code"
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSendOTP = async () => {
    const trimmed = phone.trim().replace(/\s/g, '');
    if (trimmed.length < 10) { setError('Please enter a valid phone number (e.g., 0501234567).'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const response = await getOTP(trimmed);
      if (response?.data?.success || response?.status === 200) {
        setStep(STEPS.OTP);
        setResendCooldown(180);
        setSuccess('Verification code sent!');
      } else {
        setError(response?.data?.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Network error. Please try again.');
    } finally { setLoading(false); }
  };

 const handleVerifyOTP = async () => {
    if (otp.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const trimmed = phone.trim().replace(/\s/g, '');
      const response = await verifyOTP(trimmed, otp);

      if (response?.data?.success || response?.status === 200) {
        try {
          const vendorRes = await vendorLogin({ phone: trimmed });
          
          console.log('Vendor login full response:', vendorRes);
          console.log('Status:', vendorRes?.status);
          console.log('Data:', vendorRes?.data);

          // Check success properly
          if (vendorRes?.data?.success === true || vendorRes?.status === 200) {
            setSuccess('Login successful! Redirecting to dashboard...');
            
            // Store token
            if (vendorRes?.data?.token) {
              localStorage.setItem('vendorToken', vendorRes.data.token);
            }
            
            // Store vendor data
            if (vendorRes?.data?.vendor) {
              localStorage.setItem('vendorData', JSON.stringify(vendorRes.data.vendor));
            } else if (vendorRes?.data?.user) {
              localStorage.setItem('vendorData', JSON.stringify(vendorRes.data.user));
            }

            // Navigate
            setTimeout(() => {
              router.push('/vendor/dashboard');
            }, 500);
          } else {
            const errorMsg = vendorRes?.data?.message || 'Login failed. Please try again.';
            setError(errorMsg);
            setStep(STEPS.PHONE);
            setOtp('');
          }
        } catch (loginErr) {
          console.error('Login error:', loginErr);
          const errorMsg = loginErr?.response?.data?.message || 'Login failed. Please try again.';
          setError(errorMsg);
          setStep(STEPS.PHONE);
          setOtp('');
        }
      } else {
        const errorMsg = response?.data?.message || 'Invalid or expired code. Please try again.';
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Verification failed. Please try again.';
      setError(errorMsg);
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setOtp(''); setError(''); setSuccess('');
    setLoading(true);
    try {
      const trimmed = phone.trim().replace(/\s/g, '');
      const response = await getOTP(trimmed);
      if (response?.data?.success || response?.status === 200) {
        setResendCooldown(180);
        setSuccess('New code sent!');
      } else {
        setError('Failed to resend code.');
      }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{loginStyles}</style>
      <div className="vl-page">
        <div className="vl-container">
          {/* Top Bar */}
          <div className="vl-topbar">
            <Link href="/vendor" className="vl-back-btn">← Back</Link>
            <h1 className="vl-topbar-title">Vendor Sign In</h1>
            <div style={{ width: 40 }} />
          </div>

          {/* ═══════════ STEP 0: PHONE ═══════════ */}
          {step === STEPS.PHONE && (
            <div className="vl-step-body">
              <div className="vl-header">
                <div className="vl-logo">🏪</div>
                <h2 className="vl-title">Welcome Back</h2>
                <p className="vl-subtitle">Sign in to manage your vendor store</p>
              </div>

              <div className="vl-form">
                <div className="vl-field">
                  <label className="vl-label">Phone Number</label>
                  <div className="vl-phone-input">
                    <span className="vl-phone-prefix">+233</span>
                    <input
                      type="tel"
                      className="vl-input"
                      placeholder="50 123 4567"
                      value={phone}
                      onChange={e => { setError(''); setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                      maxLength={10}
                      onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                      autoFocus
                    />
                  </div>
                </div>

                <button className="vl-btn primary" onClick={handleSendOTP} disabled={loading}>
                  {loading ? 'Sending...' : 'Login →'}
                </button>

                <p className="vl-link-row">
                  Don't have a vendor account?{' '}
                  <Link href="/vendor/signup" className="vl-link">Create one</Link>
                </p>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 1: OTP ═══════════ */}
          {step === STEPS.OTP && (
            <div className="vl-step-body">
              <div className="vl-step-header">
                <div className="vl-step-icon">🔐</div>
                <h2 className="vl-step-title">Verify Your Phone</h2>
                <p className="vl-step-sub">
                  We sent a 6-digit code to <strong>{phone}</strong>
                </p>
              </div>

              <OTPInput value={otp} onChange={setOtp} disabled={loading} />

              <button
                className="vl-btn primary"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In →'}
              </button>

              <p className="vl-resend-row">
                Didn't receive a code?{' '}
                {resendCooldown > 0 ? (
                  <span className="vl-resend-timer">Resend in {formatTime(resendCooldown)}</span>
                ) : (
                  <button className="vl-resend-btn" onClick={handleResendOTP} disabled={loading}>Resend Code</button>
                )}
              </p>

              <button
                className="vl-back-link"
                onClick={() => { setStep(STEPS.PHONE); setOtp(''); setError(''); }}
                disabled={loading}
              >
                ← Change phone number
              </button>
            </div>
          )}

          {/* Messages */}
          {error && <div className="vl-error">{error}</div>}
          {success && <div className="vl-success">{success}</div>}
        </div>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  .vl-page{min-height:100vh;background:${C.void};color:${C.white};font-family:'Plus Jakarta Sans',sans-serif}
  .vl-container{max-width:460px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 60px}
  .vl-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 0;margin-bottom:32px}
  .vl-back-btn{color:${C.off};text-decoration:none;font-size:14px;font-weight:600;transition:color .2s}
  .vl-back-btn:hover{color:${C.white}}
  .vl-topbar-title{font-size:18px;font-weight:800;color:${C.emerald}}

  /* Header */
  .vl-header{text-align:center;margin-bottom:32px}
  .vl-logo{font-size:56px;margin-bottom:14px}
  .vl-title{font-size:26px;font-weight:800;margin-bottom:6px}
  .vl-subtitle{font-size:14px;color:${C.off};line-height:1.5}

  /* Step header (OTP) */
  .vl-step-body{}
  .vl-step-header{text-align:center;margin-bottom:28px}
  .vl-step-icon{font-size:48px;margin-bottom:12px}
  .vl-step-title{font-size:24px;font-weight:800;margin-bottom:6px}
  .vl-step-sub{font-size:14px;color:${C.off};line-height:1.5}
  .vl-step-sub strong{color:${C.white}}

  .vl-form{display:flex;flex-direction:column;gap:16px}
  .vl-field{display:flex;flex-direction:column;gap:6px}
  .vl-label{font-size:12px;font-weight:600;color:${C.off};text-transform:uppercase;letter-spacing:.3px}
  .vl-input{width:100%;background:${C.elev};border:1.5px solid ${C.border};border-radius:12px;padding:12px 14px;color:${C.white};font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all .2s}
  .vl-input:focus{border-color:${C.emerald};box-shadow:0 0 0 3px ${C.emeraldDim}}
  .vl-input::placeholder{color:${C.muted}}
  .vl-phone-input{display:flex}
  .vl-phone-prefix{background:${C.void};border:1.5px solid ${C.border};border-right:none;border-radius:12px 0 0 12px;padding:12px 14px;font-size:14px;font-weight:600;color:${C.off};white-space:nowrap}
  .vl-phone-input .vl-input{border-radius:0 12px 12px 0}

  /* OTP */
  .vl-otp-wrap{margin:8px 0}
  .vl-otp-boxes{display:flex;justify-content:center;gap:10px;cursor:pointer;margin-bottom:12px}
  .vl-otp-box{
    width:48px;height:56px;border-radius:12px;border:2px solid ${C.border};
    background:${C.elev};display:flex;align-items:center;justify-content:center;
    font-size:22px;font-weight:700;color:${C.white};transition:all .2s;
  }
  .vl-otp-box.filled{border-color:${C.emerald};background:${C.emeraldDim}}
  .vl-otp-box.active{border-color:${C.emerald};box-shadow:0 0 0 3px ${C.emeraldDim}}
  .vl-otp-real-input{
    width:100%;
    padding:12px 14px;
    background:${C.elev};
    border:1.5px solid ${C.border};
    border-radius:12px;
    color:${C.white};
    font-size:14px;
    font-family:'Plus Jakarta Sans',sans-serif;
    outline:none;
    transition:all .2s;
    text-align:center;
    letter-spacing:3px;
  }
  .vl-otp-real-input:focus{
    border-color:${C.emerald};
    box-shadow:0 0 0 3px ${C.emeraldDim};
  }
  .vl-otp-real-input::placeholder{color:${C.muted}}

  /* Buttons */
  .vl-btn{width:100%;padding:14px;border-radius:14px;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .22s}
  .vl-btn.primary{background:linear-gradient(135deg,${C.emerald},#34D399);color:#000;box-shadow:0 6px 20px rgba(16,185,129,.25)}
  .vl-btn.primary:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
  .vl-btn.primary:disabled{opacity:.6;cursor:not-allowed;transform:none}
  .vl-link-row{text-align:center;font-size:13px;color:${C.off}}
  .vl-link{color:${C.emerald};font-weight:700;text-decoration:none}
  .vl-link:hover{text-decoration:underline}
  .vl-resend-row{text-align:center;font-size:13px;color:${C.off};margin-top:8px}
  .vl-resend-btn{background:none;border:none;color:${C.emerald};font-weight:700;cursor:pointer;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif}
  .vl-resend-btn:disabled{color:${C.muted};cursor:not-allowed}
  .vl-resend-timer{color:${C.muted};font-weight:600}
  .vl-back-link{display:block;background:none;border:none;color:${C.emerald};font-size:13px;font-weight:600;cursor:pointer;text-align:center;font-family:'Plus Jakarta Sans',sans-serif;margin-top:4px}
  .vl-back-link:hover{text-decoration:underline}

  /* Messages */
  .vl-error{background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.2);color:${C.coral};font-size:13px;font-weight:600;padding:12px 16px;border-radius:12px;margin-top:16px;text-align:center}
  .vl-success{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);color:${C.emerald};font-size:13px;font-weight:600;padding:12px 16px;border-radius:12px;margin-top:16px;text-align:center}

  @media(max-width:480px){
    .vl-container{padding:16px 16px 40px}
    .vl-otp-box{width:42px;height:50px;font-size:18px}
  }
`;