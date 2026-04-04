import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Web3Context } from '../../context/Web3Context';
import { StepIndicator, TrustGaugeLarge } from '../../components/shared/SharedComponents';

const STEPS = ['Your details', 'Identity', 'Trust Score'];

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { onboardingStep, setOnboardingStep, setVerification, setUser, user, setIsLoggedIn } = useContext(AppContext);
  const { connectWallet, account } = useContext(Web3Context);
  const [role, setRole] = useState('borrower');
  const [name, setName] = useState('');
  const [docType, setDocType] = useState(null);
  const [docUploaded, setDocUploaded] = useState(false);
  const [generatedScore] = useState(72);

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your MetaMask wallet to continue.");
      return;
    }
    setUser({ ...user, role: role });
    setOnboardingStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!docType) return;
    setDocUploaded(true);
    setVerification('phone');
    setOnboardingStep(3);
  };

  const handleFinish = () => {
    setIsLoggedIn(true);
    navigate('/app/dashboard');
  };

  return (
    <div className="auth-shell signup-shell">
      <div className="auth-card signup-card">
        <div className="auth-logo">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" stroke="#3B9B9B" strokeWidth="2" />
            <path d="M10 16.5C10 13.46 12.46 11 15.5 11H22l-3 3h-3.5C12.91 14 12 14.91 12 16.5S12.91 19 14.5 19H18l3 3H14.5C12.46 22 10 19.54 10 16.5Z" fill="#3B9B9B" />
            <circle cx="22" cy="11" r="2" fill="#F4845F" />
            <circle cx="22" cy="22" r="2" fill="#E8A838" />
          </svg>
          <span className="auth-logo-name">TrustChain</span>
        </div>

        <StepIndicator steps={STEPS} current={onboardingStep} />

        {/* Step 1 */}
        {onboardingStep === 1 && (
          <form onSubmit={handleStep1} className="auth-form">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">No bank account or paperwork needed.</p>

            <div className="form-group mt-4">
              <label className="form-label" htmlFor="signup-name">Full name</label>
              <input className="form-control" id="signup-name" type="text" placeholder="e.g. Riya Kulkarni" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Web3 Wallet</label>
              {!account ? (
                <button type="button" className="btn btn-outline w-full" onClick={connectWallet}>
                  <svg viewBox="0 0 32 32" fill="none" width="16" height="16" aria-hidden="true" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <path d="M29.5 12L20 4.5l-4-3-4 3-9.5 7.5L5 21l3 7.5L16 29l8-1.5 3-7.5 2.5-9z" fill="#F6851B" stroke="#F6851B" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                  Connect MetaMask
                </button>
              ) : (
                <div className="form-control" style={{background: 'var(--color-bg)', color: 'var(--color-success)', cursor: 'default'}}>
                  Connected: {account.substring(0,6)}...{account.substring(38)}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">I want to</label>
              <div className="role-toggle" role="radiogroup" aria-label="Choose role">
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'borrower'}
                  className={`role-btn ${role === 'borrower' ? 'active' : ''}`}
                  id="role-borrower"
                  onClick={() => setRole('borrower')}
                >
                  <span className="role-icon">💸</span>
                  <span className="role-label">Borrow</span>
                  <span className="role-sub text-xs text-muted">Get a loan</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'lender'}
                  className={`role-btn ${role === 'lender' ? 'active' : ''}`}
                  id="role-lender"
                  onClick={() => setRole('lender')}
                >
                  <span className="role-icon">🏦</span>
                  <span className="role-label">Lend</span>
                  <span className="role-sub text-xs text-muted">Earn returns</span>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-6" id="signup-step1-btn">
              Continue →
            </button>
          </form>
        )}

        {/* Step 2 */}
        {onboardingStep === 2 && (
          <form onSubmit={handleStep2} className="auth-form">
            <h1 className="auth-title">Verify your identity</h1>
            <p className="auth-subtitle">Choose any document you have. We accept non-standard IDs.</p>

            <div className="doc-type-grid" role="radiogroup" aria-label="Choose document type">
              {[
                { id: 'aadhaar', label: 'Aadhaar Card', icon: '🪪' },
                { id: 'voter', label: 'Voter ID', icon: '🗳️' },
                { id: 'ration', label: 'Ration Card', icon: '📋' },
                { id: 'utility', label: 'Utility Bill', icon: '💡' },
              ].map(doc => (
                <button
                  key={doc.id}
                  type="button"
                  role="radio"
                  aria-checked={docType === doc.id}
                  className={`doc-btn ${docType === doc.id ? 'active' : ''}`}
                  id={`doc-${doc.id}`}
                  onClick={() => setDocType(doc.id)}
                >
                  <span className="doc-icon">{doc.icon}</span>
                  <span className="doc-label">{doc.label}</span>
                </button>
              ))}
            </div>

            {docType && (
              <div className="upload-zone mt-4" role="button" tabIndex="0" aria-label="Upload document photo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M16 21V11M11 16l5-5 5 5" />
                  <rect x="4" y="4" width="24" height="24" rx="4" />
                </svg>
                <div className="upload-text">Tap to upload photo of your {docType}</div>
                <div className="upload-sub text-xs text-muted">JPEG, PNG · Max 5MB</div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button type="button" className="btn btn-outline flex-1" onClick={() => setOnboardingStep(1)}>← Back</button>
              <button type="submit" className="btn btn-primary flex-1" id="signup-step2-btn" disabled={!docType}>
                Verify →
              </button>
            </div>
            <div className="auth-hint text-xs text-muted text-center mt-3">
              🔒 Your documents are encrypted and never shared
            </div>
          </form>
        )}

        {/* Step 3 */}
        {onboardingStep === 3 && (
          <div className="auth-form text-center">
            <div className="verified-badge-anim">✓</div>
            <h1 className="auth-title mt-4">Identity Verified!</h1>
            <p className="auth-subtitle">Your Trust Score has been generated based on your profile.</p>

            <div className="gauge-center-wrapper">
              <TrustGaugeLarge score={generatedScore} size={200} />
            </div>

            <div className="score-breakdown-row">
              <div className="score-factor">
                <span className="pill pill-success text-xs">+30</span>
                <div className="text-xs text-muted mt-1">ID Verified</div>
              </div>
              <div className="score-factor">
                <span className="pill pill-warning text-xs">+22</span>
                <div className="text-xs text-muted mt-1">New member</div>
              </div>
              <div className="score-factor">
                <span className="pill text-xs" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>+20</span>
                <div className="text-xs text-muted mt-1">Community</div>
              </div>
            </div>

            <p className="text-sm text-muted mt-4">Your score will grow as you repay on time and collect community vouchers.</p>

            <button className="btn btn-primary w-full mt-6" id="goto-dashboard-btn" onClick={handleFinish}>
              Go to Dashboard →
            </button>
          </div>
        )}

        <div className="auth-footer-link">
          Already have an account? <a href="/login">Sign in →</a>
        </div>
      </div>
    </div>
  );
};
