// src/app/vendor/signup/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendOTPVendor, verifyOTP } from '@/apis/authApi';
import { createVendorProfile } from '@/apis/vendorApi';

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

const STEPS = { PHONE: 0, OTP: 1, PROFILE: 2 };

const CAMPUS_OPTIONS = [
  { key: 'UG', label: 'University of Ghana' },
  { key: 'KNUST', label: 'KNUST' },
  { key: 'UCC', label: 'University of Cape Coast' },
  { key: 'UEW', label: 'University of Education, Winneba' },
  { key: 'UPSA', label: 'UPSA' },
  { key: 'GIMPA', label: 'GIMPA' },
  { key: 'ASHESI', label: 'Ashesi University' },
  { key: 'ATU', label: 'Accra Technical University' },
  { key: 'OTHER', label: 'Other' },
];

const CATEGORY_OPTIONS = [
  { key: 'electronics', label: 'Electronics', icon: '🔌' },
  { key: 'phones and tablets', label: 'Phones & Tablets', icon: '📱' },
  { key: 'computers and laptops', label: 'Computers & Laptops', icon: '💻' },
  { key: 'gaming', label: 'Gaming', icon: '🎮' },
  { key: 'fashion', label: 'Fashion', icon: '👗' },
  { key: 'books-course-materials', label: 'Books & Notes', icon: '📚' },
  { key: 'hostel-items', label: 'Hostel Items', icon: '🏠' },
  { key: 'appliances', label: 'Appliances', icon: '🔧' },
  { key: 'furniture', label: 'Furniture', icon: '🪑' },
  { key: 'beauty and grooming', label: 'Beauty & Grooming', icon: '💄' },
  { key: 'sports and fitness', label: 'Sports & Fitness', icon: '⚽' },
  { key: 'accessories', label: 'Accessories', icon: '👜' },
  { key: 'food and drinks', label: 'Food & Drinks', icon: '🍕' },
  { key: 'services', label: 'Services', icon: '🛠️' },
  { key: 'other', label: 'Other', icon: '📦' },
];

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  const steps = [
    { icon: '📱', label: 'Phone' },
    { icon: '🔐', label: 'Verify' },
    { icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="vs-steps">
      {steps.map((step, i) => (
        <div key={i} className="vs-step-item">
          <div className={`vs-step-circle ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}>
            {i < currentStep ? '✓' : step.icon}
          </div>
          <span className={`vs-step-label ${i <= currentStep ? 'active' : ''}`}>{step.label}</span>
          {i < steps.length - 1 && <div className={`vs-step-line ${i < currentStep ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── OTP Input ─────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputRef = useRef(null);
  const digits = value.padEnd(6, '').split('');

  return (
    <div className="vs-otp-wrap" onClick={() => inputRef.current?.focus()}>
      <div className="vs-otp-boxes">
        {digits.map((d, i) => (
          <div key={i} className={`vs-otp-box ${d.trim() ? 'filled' : ''} ${value.length === i ? 'active' : ''}`}>
            {d.trim()}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        disabled={disabled}
        className="vs-otp-hidden"
        autoFocus
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorSignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [campus, setCampus] = useState('');
  const [campusArea, setCampusArea] = useState('');
  const [hostel, setHostel] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [storeBanner, setStoreBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleImageSelect = (e, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSendOTP = async () => {
    const trimmed = phone.trim().replace(/\s/g, '');
    if (trimmed.length < 10) { setError('Please enter a valid phone number (e.g., 0501234567).'); return; }
    setLoading(true); setError('');
    try {
      const response = await sendOTPVendor(trimmed);
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
    setLoading(true); setError('');
    try {
      const trimmed = phone.trim().replace(/\s/g, '');
      const response = await verifyOTP(trimmed, otp);
      if (response?.data?.success || response?.status === 200) {
        setStep(STEPS.PROFILE);
        setSuccess('');
      } else {
        setError('Invalid or expired code. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Verification failed.');
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setOtp(''); setError('');
    setLoading(true);
    try {
      const trimmed = phone.trim().replace(/\s/g, '');
      const response = await sendOTPVendor(trimmed);
      if (response?.data?.success || response?.status === 200) {
        setResendCooldown(180);
        setSuccess('New code sent!');
      }
    } catch { setError('Failed to resend code.'); }
    finally { setLoading(false); }
  };

  const toggleCategory = (key) => {
    setSelectedCategories(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
  };

  const handleSubmitProfile = async () => {
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('name', fullName.trim());
      formData.append('phone', phone.trim().replace(/\s/g, ''));
      if (storeName.trim()) formData.append('storeName', storeName.trim());
      if (campus) formData.append('campus', campus);
      if (campusArea.trim()) formData.append('campusArea', campusArea.trim());
      if (hostel.trim()) formData.append('hostel', hostel.trim());
      if (bio.trim()) formData.append('bio', bio.trim());
      if (whatsapp.trim()) formData.append('whatsapp', whatsapp.trim());
      if (instagram.trim()) formData.append('instagram', instagram.trim());
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(cat => formData.append('categories[]', cat));
      }
      if (profileImage) formData.append('profileImage', profileImage);
      if (storeBanner) formData.append('storeBanner', storeBanner);

      const response = await createVendorProfile(formData);

      if (response?.data?.success || response?.status === 201) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => router.push('/vendor/login'), 2000);
      } else {
        throw new Error('Failed to create account');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      <style>{signupStyles}</style>
      <div className="vs-page">
        <div className="vs-container">
          {/* Top Bar */}
          <div className="vs-topbar">
            <Link href="/vendor" className="vs-back-btn">← Back</Link>
            <h1 className="vs-topbar-title">Vendor Sign Up</h1>
            <div style={{ width: 40 }} />
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          {/* Content */}
          <div className="vs-content">
            {/* ═══════════ STEP 0: PHONE ═══════════ */}
            {step === STEPS.PHONE && (
              <div className="vs-step-body">
                <div className="vs-step-header">
                  <div className="vs-step-icon">🏪</div>
                  <h2 className="vs-step-title">Create Vendor Account</h2>
                  <p className="vs-step-sub">Enter your phone number to get started</p>
                </div>

                <div className="vs-form">
                  <div className="vs-field">
                    <label className="vs-label">Phone Number</label>
                    <div className="vs-phone-input">
                      <span className="vs-phone-prefix">+233</span>
                      <input
                        type="tel"
                        className="vs-input"
                        placeholder="50 123 4567"
                        value={phone}
                        onChange={e => { setError(''); setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                        maxLength={10}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        autoFocus
                      />
                    </div>
                  </div>

                  <button className="vs-btn primary" onClick={handleSendOTP} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Verification Code →'}
                  </button>

                  <p className="vs-link-row">
                    Already have a vendor account?{' '}
                    <Link href="/vendor/login" className="vs-link">Sign In</Link>
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════ STEP 1: OTP ═══════════ */}
            {step === STEPS.OTP && (
              <div className="vs-step-body">
                <div className="vs-step-header">
                  <div className="vs-step-icon">🔐</div>
                  <h2 className="vs-step-title">Verify Your Phone</h2>
                  <p className="vs-step-sub">
                    We sent a 6-digit code to <strong>{phone}</strong>
                  </p>
                </div>

                <OTPInput value={otp} onChange={setOtp} disabled={loading} />

                <button
                  className="vs-btn primary"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length < 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue →'}
                </button>

                <p className="vs-resend-row">
                  Didn't receive a code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="vs-resend-timer">Resend in {formatTime(resendCooldown)}</span>
                  ) : (
                    <button className="vs-resend-btn" onClick={handleResendOTP} disabled={loading}>Resend Code</button>
                  )}
                </p>

                <button
                  className="vs-back-link"
                  onClick={() => { setStep(STEPS.PHONE); setOtp(''); setError(''); }}
                  disabled={loading}
                >
                  ← Change phone number
                </button>
              </div>
            )}

            {/* ═══════════ STEP 2: PROFILE ═══════════ */}
            {step === STEPS.PROFILE && (
              <div className="vs-step-body">
                <div className="vs-step-header">
                  <div className="vs-step-icon">👤</div>
                  <h2 className="vs-step-title">Complete Your Profile</h2>
                  <p className="vs-step-sub">Tell us about your store</p>
                </div>

                <div className="vs-form">
                  {/* Profile Image */}
                  <div className="vs-field">
                    <label className="vs-label">Profile Photo</label>
                    <label className="vs-image-picker">
                      <input type="file" accept="image/*" onChange={e => handleImageSelect(e, setProfileImage, setProfilePreview)} style={{ display: 'none' }} />
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="vs-profile-preview" />
                      ) : (
                        <div className="vs-image-placeholder">📷<span>Add Photo</span></div>
                      )}
                    </label>
                  </div>

                  {/* Banner */}
                  <div className="vs-field">
                    <label className="vs-label">Store Banner <span className="vs-optional">(optional)</span></label>
                    <label className="vs-banner-picker">
                      <input type="file" accept="image/*" onChange={e => handleImageSelect(e, setStoreBanner, setBannerPreview)} style={{ display: 'none' }} />
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner" className="vs-banner-preview" />
                      ) : (
                        <div className="vs-banner-placeholder">🖼️<span>Add Banner</span></div>
                      )}
                    </label>
                  </div>

                  {/* Full Name */}
                  <div className="vs-field">
                    <label className="vs-label">Full Name <span className="vs-required">*</span></label>
                    <input type="text" className="vs-input" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>

                  {/* Store Name */}
                  <div className="vs-field">
                    <label className="vs-label">Store Name <span className="vs-optional">(optional)</span></label>
                    <input type="text" className="vs-input" placeholder="e.g. Kwame's Electronics" value={storeName} onChange={e => setStoreName(e.target.value)} />
                  </div>

                  {/* Campus */}
                  <div className="vs-field">
                    <label className="vs-label">Campus</label>
                    <select className="vs-input vs-select" value={campus} onChange={e => setCampus(e.target.value)}>
                      <option value="">Select your campus</option>
                      {CAMPUS_OPTIONS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>

                  {/* Campus Area */}
                  <div className="vs-field">
                    <label className="vs-label">Campus Area</label>
                    <input type="text" className="vs-input" placeholder="e.g. Main Campus, North Campus" value={campusArea} onChange={e => setCampusArea(e.target.value)} />
                  </div>

                  {/* Hostel */}
                  <div className="vs-field">
                    <label className="vs-label">Hostel / Hall <span className="vs-optional">(optional)</span></label>
                    <input type="text" className="vs-input" placeholder="e.g. Mensah Sarbah Hall" value={hostel} onChange={e => setHostel(e.target.value)} />
                  </div>

                  {/* WhatsApp */}
                  <div className="vs-field">
                    <label className="vs-label">WhatsApp Number <span className="vs-optional">(optional)</span></label>
                    <input type="tel" className="vs-input" placeholder="Same as phone or different" value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  </div>

                  {/* Instagram */}
                  <div className="vs-field">
                    <label className="vs-label">Instagram Handle <span className="vs-optional">(optional)</span></label>
                    <input type="text" className="vs-input" placeholder="@yourhandle" value={instagram} onChange={e => setInstagram(e.target.value)} />
                  </div>

                  {/* Categories */}
                  <div className="vs-field">
                    <label className="vs-label">What do you sell? <span className="vs-optional">(optional)</span></label>
                    <div className="vs-chips-grid">
                      {CATEGORY_OPTIONS.map(cat => {
                        const isSelected = selectedCategories.includes(cat.key);
                        return (
                          <button
                            key={cat.key}
                            className={`vs-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleCategory(cat.key)}
                            type="button"
                          >
                            <span>{cat.icon}</span> {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="vs-field">
                    <label className="vs-label">Bio <span className="vs-optional">(optional)</span></label>
                    <textarea className="vs-input vs-textarea" placeholder="Tell buyers about yourself and what you sell..." value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={3} />
                    <span className="vs-char-count">{bio.length}/500</span>
                  </div>

                  <button className="vs-btn primary" onClick={handleSubmitProfile} disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account 🎉'}
                  </button>

                  <p className="vs-terms">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && <div className="vs-error">{error}</div>}
            {success && <div className="vs-success">{success}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const signupStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  .vs-page{min-height:100vh;background:${C.void};color:${C.white};font-family:'Plus Jakarta Sans',sans-serif}
  .vs-container{max-width:520px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 60px}
  .vs-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 0;margin-bottom:24px}
  .vs-back-btn{color:${C.off};text-decoration:none;font-size:14px;font-weight:600;transition:color .2s}
  .vs-back-btn:hover{color:${C.white}}
  .vs-topbar-title{font-size:18px;font-weight:800;color:${C.emerald}}

  /* Steps */
  .vs-steps{display:flex;align-items:center;justify-content:center;margin-bottom:36px}
  .vs-step-item{display:flex;align-items:center}
  .vs-step-circle{width:38px;height:38px;border-radius:50%;background:${C.elev};border:2px solid ${C.border};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:${C.muted};transition:all .3s}
  .vs-step-circle.active{background:${C.emerald};border-color:${C.emerald};color:#fff;box-shadow:0 4px 16px rgba(16,185,129,.3)}
  .vs-step-circle.done{background:${C.emerald};border-color:${C.emerald};color:#fff}
  .vs-step-label{font-size:11px;color:${C.muted};font-weight:600;margin-left:8px;white-space:nowrap}
  .vs-step-label.active{color:${C.white}}
  .vs-step-line{width:40px;height:2px;background:${C.border};margin:0 10px;transition:background .3s}
  .vs-step-line.done{background:${C.emerald}}

  .vs-content{}
  .vs-step-body{}
  .vs-step-header{text-align:center;margin-bottom:28px}
  .vs-step-icon{font-size:48px;margin-bottom:12px}
  .vs-step-title{font-size:24px;font-weight:800;margin-bottom:6px}
  .vs-step-sub{font-size:14px;color:${C.off};line-height:1.5}
  .vs-step-sub strong{color:${C.white}}

  .vs-form{display:flex;flex-direction:column;gap:16px}
  .vs-field{display:flex;flex-direction:column;gap:6px}
  .vs-label{font-size:12px;font-weight:600;color:${C.off};text-transform:uppercase;letter-spacing:.3px}
  .vs-required{color:${C.coral}}
  .vs-optional{color:${C.muted};font-weight:500;text-transform:none}
  .vs-input{width:100%;background:${C.elev};border:1.5px solid ${C.border};border-radius:12px;padding:12px 14px;color:${C.white};font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all .2s}
  .vs-input:focus{border-color:${C.emerald};box-shadow:0 0 0 3px ${C.emeraldDim}}
  .vs-input::placeholder{color:${C.muted}}
  .vs-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2352525B' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;cursor:pointer}
  .vs-textarea{resize:vertical;min-height:80px}
  .vs-char-count{font-size:11px;color:${C.muted};align-self:flex-end}
  .vs-phone-input{display:flex}
  .vs-phone-prefix{background:${C.void};border:1.5px solid ${C.border};border-right:none;border-radius:12px 0 0 12px;padding:12px 14px;font-size:14px;font-weight:600;color:${C.off};white-space:nowrap}
  .vs-phone-input .vs-input{border-radius:0 12px 12px 0}

  /* OTP */
  .vs-otp-wrap{position:relative;cursor:text;margin:8px 0}
  .vs-otp-boxes{display:flex;justify-content:center;gap:10px}
  .vs-otp-box{width:48px;height:56px;border-radius:12px;border:2px solid ${C.border};background:${C.elev};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:${C.white};transition:all .2s}
  .vs-otp-box.filled{border-color:${C.emerald};background:${C.emeraldDim}}
  .vs-otp-box.active{border-color:${C.emerald};box-shadow:0 0 0 3px ${C.emeraldDim}}
  .vs-otp-hidden{position:absolute;top:0;left:50%;transform:translateX(-50%);width:1px;height:1px;opacity:0}

  /* Buttons */
  .vs-btn{width:100%;padding:14px;border-radius:14px;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .22s}
  .vs-btn.primary{background:linear-gradient(135deg,${C.emerald},#34D399);color:#000;box-shadow:0 6px 20px rgba(16,185,129,.25)}
  .vs-btn.primary:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
  .vs-btn.primary:disabled{opacity:.6;cursor:not-allowed;transform:none}
  .vs-link-row{text-align:center;font-size:13px;color:${C.off}}
  .vs-link{color:${C.emerald};font-weight:700;text-decoration:none}
  .vs-link:hover{text-decoration:underline}
  .vs-resend-row{text-align:center;font-size:13px;color:${C.off};margin-top:8px}
  .vs-resend-btn{background:none;border:none;color:${C.emerald};font-weight:700;cursor:pointer;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif}
  .vs-resend-btn:disabled{color:${C.muted};cursor:not-allowed}
  .vs-resend-timer{color:${C.muted};font-weight:600}
  .vs-back-link{display:block;background:none;border:none;color:${C.emerald};font-size:13px;font-weight:600;cursor:pointer;text-align:center;font-family:'Plus Jakarta Sans',sans-serif;margin-top:4px}
  .vs-back-link:hover{text-decoration:underline}

  /* Image Pickers */
  .vs-image-picker{cursor:pointer;display:block}
  .vs-profile-preview{width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid ${C.emeraldDim};display:block;margin:0 auto}
  .vs-image-placeholder{width:100px;height:100px;border-radius:50%;border:2px dashed ${C.border};display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:24px;gap:4px;color:${C.muted};margin:0 auto;transition:all .2s;cursor:pointer}
  .vs-image-placeholder span{font-size:10px;font-weight:600}
  .vs-image-placeholder:hover{border-color:${C.emerald};color:${C.emerald}}
  .vs-banner-picker{cursor:pointer;display:block}
  .vs-banner-preview{width:100%;height:120px;border-radius:12px;object-fit:cover;border:2px solid ${C.emeraldDim}}
  .vs-banner-placeholder{width:100%;height:120px;border-radius:12px;border:2px dashed ${C.border};display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:24px;gap:4px;color:${C.muted};transition:all .2s;cursor:pointer}
  .vs-banner-placeholder span{font-size:10px;font-weight:600}
  .vs-banner-placeholder:hover{border-color:${C.emerald};color:${C.emerald}}

  /* Category Chips */
  .vs-chips-grid{display:flex;flex-wrap:wrap;gap:8px}
  .vs-chip{display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:20px;background:${C.elev};border:1.5px solid ${C.border};color:${C.off};font-size:12px;font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s}
  .vs-chip:hover{border-color:${C.emerald};color:${C.white}}
  .vs-chip.active{background:${C.emeraldDim};border-color:${C.emerald};color:${C.emerald};font-weight:600}

  /* Messages */
  .vs-error{background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.2);color:${C.coral};font-size:13px;font-weight:600;padding:12px 16px;border-radius:12px;margin-top:16px;text-align:center}
  .vs-success{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);color:${C.emerald};font-size:13px;font-weight:600;padding:12px 16px;border-radius:12px;margin-top:16px;text-align:center}
  .vs-terms{font-size:11px;color:${C.muted};text-align:center;line-height:1.5}

  @media(max-width:480px){
    .vs-container{padding:16px 16px 40px}
    .vs-step-label{display:none}
    .vs-step-line{width:24px;margin:0 6px}
    .vs-otp-box{width:42px;height:50px;font-size:18px}
  }
`;