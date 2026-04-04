import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { MOCK_VOUCHERS, TRUST_SCORE_FACTORS } from '../../data/mockData';
import { TrustGaugeLarge } from '../../components/shared/SharedComponents';

export const BorrowerProfilePage = () => {
  const { trustScore } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <section className="screen active" aria-label="My Profile">
      <div className="profile-grid">

        {/* Left — Profile card */}
        <div className="card profile-main-card animate-fade-in-up">
          <div className="profile-header">
            <div className="profile-avatar">RK</div>
            <div className="profile-name-block">
              <div className="profile-name">
                Riya Kulkarni
                <span className="verified-badge" aria-label="Verified member">✓</span>
              </div>
              <div className="profile-role-tag">
                <span className="pill pill-success" style={{ fontSize: '11px' }}>Borrower</span>
              </div>
              <div className="profile-meta text-xs text-muted">Joined Jan 2026 · Pune, MH</div>
            </div>
          </div>

          {/* Trust Score — big */}
          <div className="profile-gauge-wrapper text-center mt-6" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-6)' }}>
            <div className="card-title mb-4">Trust Score</div>
            <TrustGaugeLarge score={trustScore} size={210} />
            <div className="trust-tier-name mt-2">Medium-High — Getting Stronger</div>
            <button className="btn btn-ghost text-sm mt-2" onClick={() => navigate('/trust')} id="profile-trust-detail-btn">
              View full breakdown →
            </button>
          </div>

          {/* ID Status */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-5)', marginTop: 'var(--sp-5)' }}>
            <div className="card-title mb-3">Identity Verification</div>
            <div className="id-status-row">
              <div className="id-item" role="status">
                <span className="pill pill-success text-xs">✓ Verified</span>
                <span className="text-xs text-muted ml-2">Phone Number</span>
              </div>
              <div className="id-item">
                <span className="pill pill-success text-xs">✓ Verified</span>
                <span className="text-xs text-muted ml-2">Aadhaar Card</span>
              </div>
              <div className="id-item">
                <span className="pill pill-warning text-xs">⚠ Pending</span>
                <span className="text-xs text-muted ml-2">NGO Verification</span>
              </div>
            </div>
            <button className="btn btn-outline w-full mt-3 text-sm" id="add-id-btn" onClick={() => navigate('/verify')}>
              Add more verification →
            </button>
          </div>
        </div>

        {/* Right — Vouchers + Repayment history */}
        <div>
          {/* Trust Score factor bars */}
          <div className="card animate-fade-in-up stagger-2 mb-5">
            <div className="card-title mb-4">Score Breakdown</div>
            {TRUST_SCORE_FACTORS.map(f => (
              <div key={f.label} className="factor-row">
                <div className="factor-label">
                  <span>{f.icon}</span> {f.label}
                </div>
                <div className="factor-bar-wrapper">
                  <div className="factor-bar">
                    <div className="factor-fill" style={{ width: `${(f.earned / f.points) * 100}%` }} />
                  </div>
                  <span className="factor-score text-xs">{f.earned}/{f.points}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Community vouchers */}
          <div className="card animate-fade-in-up stagger-3 mb-5">
            <div className="card-title mb-4">Community Vouchers</div>
            <p className="text-xs text-muted mb-4">3 vouchers needed to unlock High Trust. Each voucher adds up to +10 points.</p>
            <div className="voucher-list" role="list">
              {MOCK_VOUCHERS.map((v, i) => (
                <div key={v.id} className={`voucher-row ${v.status}`} role="listitem">
                  {v.status === 'empty' ? (
                    <>
                      <div className="avatar voucher-avatar-empty" aria-hidden="true">+</div>
                      <div className="voucher-info">
                        <div className="text-muted text-sm">Slot {i + 1} — Invite someone</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/vouch')} id={`invite-voucher-${i}`}>
                        Invite
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="avatar" style={{ background: v.color }} aria-hidden="true">{v.initials}</div>
                      <div className="voucher-info">
                        <div className="font-medium text-sm">{v.name}</div>
                        <div className="text-xs text-muted">Trust Score: {v.trustScore}</div>
                      </div>
                      <span className={`pill text-xs ${v.status === 'confirmed' ? 'pill-success' : 'pill-warning'}`}>
                        {v.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Repayment history badge */}
          <div className="card animate-fade-in-up stagger-4">
            <div className="card-title mb-4">Repayment History</div>
            <div className="repay-badge-row">
              <div className="repay-badge-icon" aria-hidden="true">🏆</div>
              <div>
                <div className="font-semibold">On-Time Payer ✓</div>
                <div className="text-xs text-muted mt-1">3 consecutive on-time payments · ₹15,600 repaid total</div>
              </div>
            </div>
            <button className="btn btn-outline w-full mt-4 text-sm" id="repayment-tracker-btn" onClick={() => navigate('/loan/repayment')}>
              View repayment tracker →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
