import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { TRUST_SCORE_FACTORS, TRUST_HISTORY, IMPROVEMENT_TIPS } from '../../data/mockData';
import { TrustGaugeLarge, MiniChart } from '../../components/shared/SharedComponents';

export const TrustScoreDetailPage = () => {
  const { trustScore } = useContext(AppContext);
  const navigate = useNavigate();

  const tier = trustScore >= 80 ? { label: 'High', cls: 'pill-success' }
    : trustScore >= 60 ? { label: 'Medium', cls: 'pill-warning' }
    : { label: 'Low', cls: 'pill-danger' };

  return (
    <section className="screen active" aria-label="Trust Score Detail">
      <div className="trust-detail-grid">

        {/* Left — Gauge + factors */}
        <div>
          <div className="card animate-fade-in-up text-center mb-5">
            <div className="card-title mb-1">Your Trust Score</div>
            <div className="card-subtitle mb-5">Updates in real-time as you repay and verify</div>

            <div className="gauge-wrapper-center">
              <TrustGaugeLarge score={trustScore} size={220} />
            </div>

            <div className="trust-tier-name mt-2 text-lg font-semibold">
              {trustScore >= 85 ? 'High — Excellent Standing'
                : trustScore >= 70 ? 'Medium-High — Getting Stronger'
                : trustScore >= 40 ? 'Medium — Building Trust'
                : 'Low — Just Starting'}
            </div>

            <div className="mt-3 mb-2">
              <span className={`pill ${tier.cls}`}>Risk Tier: {tier.label}</span>
            </div>
            <div className="text-xs text-muted">
              {tier.label === 'Low' && 'Higher-rate loans only. Complete verification to improve.'}
              {tier.label === 'Medium' && 'Standard loan access. Keep repaying on time.'}
              {tier.label === 'High' && 'Best rates available. You qualify for up to ₹50,000.'}
            </div>
          </div>

          {/* Factor breakdown */}
          <div className="card animate-fade-in-up stagger-2">
            <div className="card-title mb-5">How Your Score Is Calculated</div>
            {TRUST_SCORE_FACTORS.map(f => (
              <div key={f.label} className="factor-detail-row">
                <div className="factor-detail-header">
                  <span className="factor-icon-lg">{f.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{f.label}</div>
                    <div className="text-xs text-muted">Max {f.points} points</div>
                  </div>
                  <div className="factor-detail-score">
                    <span className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{f.earned}</span>
                    <span className="text-muted text-xs">/{f.points}</span>
                  </div>
                </div>
                <div className="factor-bar mt-2">
                  <div className="factor-fill" style={{ width: `${(f.earned / f.points) * 100}%`, background: f.earned === f.points ? 'var(--color-success)' : 'var(--color-primary)' }} />
                </div>
                <div className="text-xs text-muted mt-1">
                  {f.label === 'ID Verified' && 'Aadhaar + Phone verified (+30/30)'}
                  {f.label === 'Repaid Loans' && '3 on-time repayments completed — keep going!'}
                  {f.label === 'Community Vouchers' && '1 of 3 vouchers confirmed — invite 2 more'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — History + Tips */}
        <div>
          {/* Score history chart */}
          <div className="card animate-fade-in-up stagger-3 mb-5">
            <div className="card-title mb-1">Score History</div>
            <div className="card-subtitle mb-4">Your Trust Score over the last 6 months</div>
            <div style={{ padding: '8px 0' }}>
              <MiniChart data={TRUST_HISTORY} width={300} height={80} />
            </div>
            <div className="chart-labels flex justify-between mt-2">
              {TRUST_HISTORY.map(h => (
                <span key={h.month} className="text-xs text-muted">{h.month}</span>
              ))}
            </div>
            <div className="trust-hint mt-4">
              📈 Your score has grown <strong>+32 points</strong> in 6 months. Keep it up!
            </div>
          </div>

          {/* Improvement tips */}
          <div className="card animate-fade-in-up stagger-4 mb-5">
            <div className="card-title mb-4">How to Improve Your Score</div>
            <div className="tips-list" role="list">
              {IMPROVEMENT_TIPS.map((tip, i) => (
                <div key={i} className="tip-row" role="listitem">
                  <span className="tip-icon" aria-hidden="true">💡</span>
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="card animate-fade-in-up stagger-5">
            <div className="card-title mb-4">Improve Your Score Now</div>
            <button className="btn btn-primary w-full mb-3" id="go-verify-btn" onClick={() => navigate('/verify')}>
              🪪 Add Identity Verification
            </button>
            <button className="btn btn-outline w-full mb-3" id="go-vouch-btn" onClick={() => navigate('/vouch')}>
              🤝 Invite Community Vouchers
            </button>
            <button className="btn btn-ghost w-full" id="go-repay-btn" onClick={() => navigate('/loan/repayment')}>
              💳 Make a Repayment
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
