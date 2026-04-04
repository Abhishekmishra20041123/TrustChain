import React from 'react';
import { MOCK_VOUCHERS } from '../../data/mockData';
import { useToast } from '../../components/shared/ToastProvider';

export const CommunityVouchingPage = () => {
  const showToast = useToast();

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://trustchain.app/vouch/riya-k-2026');
    showToast('Invite link copied to clipboard! 🔗', 'success');
  };

  return (
    <section className="screen active" aria-label="Community Vouching">

      {/* How it works explainer */}
      <div className="card animate-fade-in-up mb-5">
        <div className="card-title mb-1">How Community Vouching Works</div>
        <div className="card-subtitle mb-5">Get trusted community members to back you — it's your social collateral.</div>
        <div className="vouching-steps">
          {[
            { n: 1, title: 'Invite someone you know', body: 'Share your unique invite link with a trusted neighbour, colleague, or family member.', color: 'var(--color-primary)' },
            { n: 2, title: 'They review and vouch', body: 'Your contact reviews your profile and decides to vouch for you. They stake their trust score.', color: 'var(--color-warning)' },
            { n: 3, title: 'Your Trust Score improves', body: 'Each confirmed voucher adds up to +10 points, lowering your risk tier and interest rate.', color: 'var(--color-success)' },
          ].map(s => (
            <div key={s.n} className="vouching-step">
              <div className="vouching-step-num" style={{ background: s.color }}>{s.n}</div>
              <div className="vouching-step-body">
                <div className="font-semibold text-sm">{s.title}</div>
                <div className="text-xs text-muted mt-1">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite section */}
      <div className="card animate-fade-in-up stagger-2 mb-5">
        <div className="card-title mb-4">Invite Vouchers</div>
        <div className="invite-link-row">
          <div className="invite-link-display">
            <span className="text-sm" style={{ fontFamily: 'monospace' }}>trustchain.app/vouch/riya-k-2026</span>
          </div>
          <button className="btn btn-primary btn-sm" id="copy-invite-link-btn" onClick={handleCopyLink}>
            Copy Link
          </button>
        </div>

        {/* QR code (simulated) */}
        <div className="qr-wrapper">
          <div className="qr-simulated" aria-label="QR code for invite link">
            <div className="qr-grid">
              {Array.from({ length: 81 }).map((_, i) => (
                <div key={i} className="qr-cell" style={{ background: Math.random() > 0.45 ? '#1A2B3D' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div className="text-xs text-muted text-center mt-2">Scan to vouch for Riya</div>
        </div>
      </div>

      {/* Voucher slots */}
      <div className="card animate-fade-in-up stagger-3">
        <div className="card-title mb-1">Your Vouchers</div>
        <div className="card-subtitle mb-5">You need 3 confirmed vouchers to unlock High Trust tier.</div>

        <div className="voucher-list" role="list">
          {MOCK_VOUCHERS.map((v, i) => (
            <div key={v.id} className={`voucher-row-full ${v.status}`} role="listitem">
              <div className="voucher-num text-muted text-sm">{i + 1}</div>
              {v.status === 'empty' ? (
                <>
                  <div className="avatar voucher-avatar-empty" aria-hidden="true" style={{ background: '#E8EDF2', color: '#A0B0C0' }}>?</div>
                  <div className="voucher-info" style={{ flex: 1 }}>
                    <div className="text-muted text-sm">Slot {i + 1} — Waiting for voucher</div>
                    <div className="text-xs text-muted">Share your link to invite someone</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={handleCopyLink} id={`invite-slot-${i}`}>
                    + Invite
                  </button>
                </>
              ) : (
                <>
                  <div className="avatar" style={{ background: v.color }} aria-hidden="true">{v.initials}</div>
                  <div className="voucher-info" style={{ flex: 1 }}>
                    <div className="font-medium text-sm">{v.name}</div>
                    <div className="text-xs text-muted">Trust Score: {v.trustScore} · {v.status === 'confirmed' ? 'Vouched ✓' : 'Invitation sent'}</div>
                  </div>
                  <span className={`pill text-xs ${v.status === 'confirmed' ? 'pill-success' : 'pill-warning'}`}>
                    {v.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="trust-hint mt-5">
          🤝 You have <strong>1 of 3 vouchers</strong> confirmed. Get 2 more to unlock <strong>High Trust</strong> and reduce your rate by up to 6%.
        </div>
      </div>
    </section>
  );
};
