import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOCK_LOANS } from '../../data/mockData';
import { useToast } from '../../components/shared/ToastProvider';
import { fundPct, riskBadge } from '../../components/shared/SharedComponents';

export const FundLoanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();

  // Fall back to first loan if no state passed
  const loan = location.state?.loan || MOCK_LOANS[0];
  const [fundAmount, setFundAmount] = useState(Math.min(loan.amount - loan.funded, 2000));

  const pct = fundPct(loan.funded, loan.amount);
  const interestRate = loan.riskTier === 'Low' ? 12 : loan.riskTier === 'Medium' ? 16 : 20;
  const expectedReturn = Math.round(fundAmount * (1 + (interestRate / 100) * (parseInt(loan.repaymentPeriod) / 12)));
  const { cls, label } = riskBadge(loan.riskTier);

  const handleConfirm = () => {
    if (window.showTcDialog) {
      window.showTcDialog(
        'Confirm Funding',
        `You are funding ₹${fundAmount.toLocaleString('en-IN')} for ${loan.borrower}'s loan. Expected return: ₹${expectedReturn.toLocaleString('en-IN')} over ${loan.repaymentPeriod}.`,
        () => {
          showToast(`✅ ₹${fundAmount.toLocaleString('en-IN')} funded successfully!`, 'success');
          navigate('/lender');
        }
      );
    }
  };

  return (
    <section className="screen active" aria-label="Fund a Loan">
      <div className="loan-grid">

        {/* Left — Details */}
        <div className="card animate-fade-in-up">
          <div className="card-title mb-1">Fund This Loan</div>
          <div className="card-subtitle mb-5">Review borrower details before committing</div>

          {/* Borrower summary card */}
          <div className="borrower-summary-card">
            <div className="avatar avatar-lg" style={{ background: loan.avatarColor }}>{loan.initials}</div>
            <div className="borrower-summary-info">
              <div className="font-semibold">{loan.borrower}</div>
              <div className="text-xs text-muted">{loan.location} · Trust Score: {loan.trustScore}</div>
              <span className={`pill ${cls} text-xs mt-1`} style={{ display: 'inline-block' }}>{label}</span>
            </div>
          </div>

          <div className="loan-purpose-text mt-4">"{loan.story}"</div>

          {/* Funding progress */}
          <div className="mt-5">
            <div className="loan-progress-label">
              <span>₹{loan.funded.toLocaleString('en-IN')} funded</span>
              <span>of ₹{loan.amount.toLocaleString('en-IN')} · {pct}%</span>
            </div>
            <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs text-muted mt-1">{loan.daysLeft} days left · {loan.repaymentPeriod} term</div>
          </div>

          {/* Amount to fund */}
          <div className="form-group mt-6">
            <label className="form-label" htmlFor="fund-amount">
              Amount to Fund (₹)
              <span className="form-label-value">₹{fundAmount.toLocaleString('en-IN')}</span>
            </label>
            <input
              type="range"
              id="fund-amount"
              className="amount-slider"
              min="500"
              max={loan.amount - loan.funded}
              step="500"
              value={fundAmount}
              onChange={e => setFundAmount(parseInt(e.target.value))}
            />
            <div className="slider-labels">
              <span>₹500</span>
              <span>₹{Math.round((loan.amount - loan.funded) / 2).toLocaleString('en-IN')}</span>
              <span>₹{(loan.amount - loan.funded).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Expected return */}
          <div className="live-estimate-panel mt-4" style={{ background: '#FDE8C0', border: '1px solid #FAC775' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>Expected Return</span>
              <span className="font-bold text-lg" style={{ color: 'var(--color-warning)' }}>
                ₹{expectedReturn.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-xs text-muted mt-1">
              {interestRate}% p.a. · +₹{(expectedReturn - fundAmount).toLocaleString('en-IN')} interest over {loan.repaymentPeriod}
            </div>
          </div>

          {/* Smart contract summary */}
          <div className="card mt-4" style={{ background: '#EEEDFE', border: '1px solid #AFA9EC' }}>
            <div className="font-semibold text-sm mb-2" style={{ color: '#534AB7' }}>Smart Contract Summary</div>
            <div className="contract-terms text-xs" style={{ color: '#534AB7', lineHeight: 1.8 }}>
              <div>• Loan: ₹{loan.amount.toLocaleString('en-IN')} total · ₹{fundAmount.toLocaleString('en-IN')} your share</div>
              <div>• Repayment: Weekly instalments over {loan.repaymentPeriod}</div>
              <div>• Risk: {loan.riskTier} · Trust Score: {loan.trustScore}/100</div>
              <div>• Community vouchers: verified</div>
              <div>• Simulated — no real funds transferred</div>
            </div>
          </div>

          <button
            className="btn btn-primary w-full mt-5"
            id="confirm-fund-btn"
            onClick={handleConfirm}
          >
            ✓ Confirm &amp; Fund ₹{fundAmount.toLocaleString('en-IN')} →
          </button>
        </div>

        {/* Right — Risk panel */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-title mb-4">Risk &amp; Return Analysis</div>

          <div className="risk-tier-display text-center mb-5">
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: loan.riskTier === 'Low' ? 'var(--color-success)' : loan.riskTier === 'Medium' ? 'var(--color-warning)' : 'var(--color-danger)' }}>
              {loan.riskTier}
            </div>
            <div className="text-muted text-sm">Risk Tier</div>
          </div>

          <div className="factor-row">
            <span className="text-sm">Borrower Trust Score</span>
            <span className="font-semibold">{loan.trustScore}/100</span>
          </div>
          <div className="factor-row">
            <span className="text-sm">Interest Rate</span>
            <span className="font-semibold">{interestRate}% p.a.</span>
          </div>
          <div className="factor-row">
            <span className="text-sm">Repayment Period</span>
            <span className="font-semibold">{loan.repaymentPeriod}</span>
          </div>
          <div className="factor-row">
            <span className="text-sm">Already Funded</span>
            <span className="font-semibold">{pct}%</span>
          </div>

          <div className="trust-hint mt-5">
            {loan.riskTier === 'Low' && '✅ Low-risk loan — strong trust score and community backing.'}
            {loan.riskTier === 'Medium' && '⚠️ Medium risk — borrower has good history but limited vouchers.'}
            {loan.riskTier === 'High' && '🔴 High risk — diversify your portfolio if funding this loan.'}
          </div>

          <button className="btn btn-outline w-full mt-5" onClick={() => navigate('/loans')} id="back-to-loans-btn">
            ← Browse Other Loans
          </button>
        </div>
      </div>
    </section>
  );
};
