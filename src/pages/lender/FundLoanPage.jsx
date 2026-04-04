import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { MOCK_LOANS } from '../../data/mockData';
import { useToast } from '../../components/shared/ToastProvider';
import { fundPct, riskBadge } from '../../components/shared/SharedComponents';

export const FundLoanPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const showToast = useToast();
  const { contract, account, refreshTrustScore } = useContext(Web3Context);

  const loan = location.state?.loan || MOCK_LOANS[0];

  // For blockchain loans principal is stored; for mocks fallback to amount
  const principal = loan.principal ?? loan.amount;
  const isBlockchainLoan = typeof loan.id === 'number' && loan.borrowerAddress;

  const [funding, setFunding]   = useState(false);
  const [endorsing, setEndorsing] = useState(false);

  const pct            = fundPct(loan.funded ?? 0, principal);
  // On-chain interestRate stored on loan; fallback to tier mapping for mocks
  const interestRate   = loan.interestRate ?? (loan.riskTier === 'Low' ? 12 : loan.riskTier === 'Medium' ? 16 : 20);
  const expectedReturn = loan.totalOwed ?? Math.round(principal * (1 + interestRate / 100));
  const { cls, label } = riskBadge(loan.riskTier);

  const handleConfirm = async () => {
    if (!contract || !account) {
      showToast('Please connect your MetaMask wallet first!', 'error');
      return;
    }
    setFunding(true);
    try {
      showToast('Please confirm the funding transaction in MetaMask…', 'info');
      // Send exact principal as BigInt wei
      const loanId = isBlockchainLoan ? loan.id : 0;
      const tx     = await contract.fundLoan(loanId, { value: BigInt(principal) });
      showToast('Waiting for blockchain confirmation…', 'info');
      await tx.wait();
      showToast(`✅ ₹${principal.toLocaleString('en-IN')} funded! Lend again to diversify.`, 'success');
      navigate('/app/lender');
    } catch (err) {
      console.error(err);
      showToast('Transaction failed: ' + (err.reason || err.message), 'error');
    } finally {
      setFunding(false);
    }
  };

  const handleEndorse = async () => {
    if (!contract || !account || !isBlockchainLoan) {
      showToast('Can only endorse blockchain borrowers.', 'error');
      return;
    }
    setEndorsing(true);
    try {
      showToast('Confirm endorsement in MetaMask…', 'info');
      const tx = await contract.endorseUser(loan.borrowerAddress);
      await tx.wait();
      showToast("🌟 Endorsed! Borrower's Trust Score +5 on-chain.", 'success');
      await refreshTrustScore(account, contract);
    } catch (err) {
      const reason = err.reason || err.message || '';
      if (reason.includes('Already endorsed')) showToast('You already endorsed this borrower!', 'error');
      else showToast('Endorsement failed: ' + reason, 'error');
    } finally {
      setEndorsing(false);
    }
  };

  return (
    <section className="screen active" aria-label="Fund a Loan">
      <div className="loan-grid">

        {/* Left — Details */}
        <div className="card animate-fade-in-up">
          <div className="card-title mb-1">Fund This Loan</div>
          <div className="card-subtitle mb-5">Review borrower details before committing</div>

          {/* Borrower summary */}
          <div className="borrower-summary-card">
            <div className="avatar avatar-lg" style={{ background: loan.avatarColor }}>{loan.initials}</div>
            <div className="borrower-summary-info">
              <div className="font-semibold">{loan.borrower}</div>
              <div className="text-xs text-muted">{loan.location ?? 'Decentralized'} · Trust Score: {loan.trustScore}</div>
              <span className={`pill ${cls} text-xs mt-1`} style={{ display: 'inline-block' }}>{label}</span>
            </div>
          </div>

          <div className="loan-purpose-text mt-4">"{loan.story ?? loan.purpose}"</div>

          {/* Progress */}
          <div className="mt-5">
            <div className="loan-progress-label">
              <span>₹{(loan.funded ?? 0).toLocaleString('en-IN')} funded</span>
              <span>of ₹{principal.toLocaleString('en-IN')} · {pct}%</span>
            </div>
            <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs text-muted mt-1">{loan.daysLeft ?? 7} days left · {loan.repaymentPeriod ?? '3 Months'} term</div>
          </div>

          {/* On-chain financial summary */}
          <div className="live-estimate-panel mt-5" style={{ background: '#FDE8C0', border: '1px solid #FAC775' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>Amount Lent</span>
              <span className="font-bold" style={{ color: 'var(--color-warning)' }}>₹{principal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>Expected Interest ({interestRate}% flat)</span>
              <span className="font-bold" style={{ color: 'var(--color-warning)' }}>+₹{(expectedReturn - principal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center" style={{ borderTop: '1px solid #FAC775', paddingTop: '8px' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>Total to Receive on-chain ⛓️</span>
              <span className="font-bold text-lg" style={{ color: 'var(--color-warning)' }}>₹{expectedReturn.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Contract summary */}
          <div className="card mt-4" style={{ background: '#EEEDFE', border: '1px solid #AFA9EC' }}>
            <div className="font-semibold text-sm mb-2" style={{ color: '#534AB7' }}>Smart Contract Summary</div>
            <div className="contract-terms text-xs" style={{ color: '#534AB7', lineHeight: 1.8 }}>
              <div>• Principal: ₹{principal.toLocaleString('en-IN')} routed direct wallet-to-wallet</div>
              <div>• Interest rate locked on-chain at origination: {interestRate}%</div>
              <div>• Total repayment due: ₹{expectedReturn.toLocaleString('en-IN')}</div>
              <div>• Risk Tier: {loan.riskTier} · Trust Score: {loan.trustScore}</div>
              {isBlockchainLoan && <div>• ⛓️ Live blockchain loan</div>}
            </div>
          </div>

          <button
            className="btn btn-primary w-full mt-5"
            id="confirm-fund-btn"
            onClick={handleConfirm}
            disabled={funding}
          >
            <svg viewBox="0 0 32 32" fill="none" width="16" height="16" aria-hidden="true" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M29.5 12L20 4.5l-4-3-4 3-9.5 7.5L5 21l3 7.5L16 29l8-1.5 3-7.5 2.5-9z" fill="#F6851B" stroke="#F6851B" strokeWidth="1" strokeLinejoin="round" />
            </svg>
            {funding ? '⏳ Confirming…' : `Fund ₹${principal.toLocaleString('en-IN')} with Web3 →`}
          </button>

          {/* Endorsement button — only for real blockchain loans */}
          {isBlockchainLoan && (
            <button
              className="btn btn-outline w-full mt-3"
              id="endorse-btn"
              onClick={handleEndorse}
              disabled={endorsing}
              style={{ borderColor: '#3B9B9B', color: '#3B9B9B' }}
            >
              {endorsing ? '⏳ Endorsing…' : '🌟 Endorse This Borrower (+5 Trust Score on-chain)'}
            </button>
          )}
          <div className="text-center text-xs text-muted mt-2">🔒 Funds route directly P2P — no middleman holds your capital</div>
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
            <span className={`pill text-xs ${loan.trustScore >= 80 ? 'pill-success' : loan.trustScore >= 60 ? 'pill-warning' : 'pill-danger'}`}>{loan.trustScore}/100 ⛓️</span>
          </div>
          <div className="factor-row">
            <span className="text-sm">On-Chain Interest Rate</span>
            <span className={`pill text-xs ${interestRate === 12 ? 'pill-success' : interestRate === 16 ? 'pill-warning' : 'pill-danger'}`}>{interestRate}% flat</span>
          </div>
          <div className="factor-row">
            <span className="text-sm">Repayment Period</span>
            <span className="font-semibold">{loan.repaymentPeriod ?? '3 Months'}</span>
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
