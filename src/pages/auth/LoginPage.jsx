import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const navigate = useNavigate();

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (phone.length >= 10) setStep('otp');
  };

  const handleOTPChange = (val, i) => {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 3) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" stroke="#3B9B9B" strokeWidth="2" />
            <path d="M10 16.5C10 13.46 12.46 11 15.5 11H22l-3 3h-3.5C12.91 14 12 14.91 12 16.5S12.91 19 14.5 19H18l3 3H14.5C12.46 22 10 19.54 10 16.5Z" fill="#3B9B9B" />
            <circle cx="22" cy="11" r="2" fill="#F4845F" />
            <circle cx="22" cy="22" r="2" fill="#E8A838" />
          </svg>
          <span className="auth-logo-name">TrustChain</span>
        </div>
        <div className="auth-tagline">Your community is your credit score</div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Enter your phone or email to continue</p>
            <div className="form-group">
              <label className="form-label" htmlFor="login-phone">Phone number or Email</label>
              <input
                className="form-control"
                id="login-phone"
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4" id="send-otp-btn">
              Send OTP →
            </button>
            <div className="auth-divider">No password needed — OTP only</div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="auth-form">
            <h1 className="auth-title">Enter OTP</h1>
            <p className="auth-subtitle">We sent a 4-digit code to {phone}</p>
            <div className="otp-grid" role="group" aria-label="Enter 4 digit OTP">
              {otp.map((val, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  className="otp-input"
                  value={val}
                  onChange={e => handleOTPChange(e.target.value, i)}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4" id="verify-otp-btn">
              Verify &amp; Sign In
            </button>
            <button type="button" className="btn btn-ghost w-full mt-2" onClick={() => setStep('phone')}>
              ← Change number
            </button>
          </form>
        )}

        <div className="auth-footer-link">
          No account? <Link to="/signup">Create one here →</Link>
        </div>
      </div>

      {/* Side illustration */}
      <div className="auth-side" aria-hidden="true">
        <div className="auth-side-content">
          <div className="auth-side-title">Join 12,400+ community members</div>
          <div className="auth-side-stat">₹4.2 Cr disbursed · 94% repayment rate</div>
          <div className="auth-testimonial">
            <div className="avatar" style={{ background: '#E8A838' }}>PM</div>
            <blockquote>"I got ₹8,000 in 24 hours — no bank, no guarantor, just my neighbours."</blockquote>
            <cite>— Priya Mehta, Nashik</cite>
          </div>
        </div>
      </div>
    </div>
  );
};
