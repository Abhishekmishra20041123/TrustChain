import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { MOCK_FRAUD_CASE } from '../../data/mockData';
import { VoteBar } from '../../components/shared/SharedComponents';
import { useToast } from '../../components/shared/ToastProvider';

export const FraudVotingPage = () => {
  const { hasVotedFraud, setHasVotedFraud } = useContext(AppContext);
  const showToast = useToast();
  const [fraudCase] = useState(MOCK_FRAUD_CASE);
  const [localVotes, setLocalVotes] = useState({ for: fraudCase.votesFor, against: fraudCase.votesAgainst });

  const handleVote = (vote) => {
    if (hasVotedFraud) return;
    setHasVotedFraud(vote);
    setLocalVotes(prev => ({
      for: prev.for + (vote === 'suspicious' ? 1 : 0),
      against: prev.against + (vote === 'legitimate' ? 1 : 0),
    }));
    showToast(`Vote recorded: ${vote === 'suspicious' ? 'Suspicious 🚨' : 'Legitimate ✓'}`, 'success');
  };

  const totalVotes = localVotes.for + localVotes.against;
  const outcome = localVotes.for / totalVotes > 0.5 ? 'revoke' : 'approve';

  return (
    <section className="screen active" aria-label="Community Fraud Voting">
      <div className="gov-grid">
        <div className="card animate-fade-in-up">
          <div className="loan-panel-header mb-5">
            <div>
              <div className="card-title">Community Fraud Review</div>
              <div className="card-subtitle">Case #{fraudCase.id.toUpperCase()} · Active voting</div>
            </div>
            <span className="pill pill-danger">🚨 Flagged</span>
          </div>

          {/* Flagged loan details */}
          <div className="borrower-summary-card mb-5">
            <div className="avatar avatar-lg" style={{ background: '#888' }}>{fraudCase.initials}</div>
            <div className="borrower-summary-info">
              <div className="font-semibold">{fraudCase.borrower}</div>
              <div className="text-xs text-muted">Loan request: ₹{fraudCase.amount.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted">Purpose: {fraudCase.purpose}</div>
            </div>
          </div>

          {/* Flag reason */}
          <div className="card mb-5" style={{ background: '#FFF0F0', border: '1px solid #FFCDD0' }}>
            <div className="font-semibold text-sm mb-2" style={{ color: 'var(--color-danger)' }}>⚠️ Flag Reason</div>
            <div className="text-sm">{fraudCase.flagReason}</div>
          </div>

          {/* Vote buttons */}
          <div className="vote-buttons-row mb-5">
            <button
              className={`btn vote-btn-suspicious ${hasVotedFraud === 'suspicious' ? 'selected' : ''}`}
              id="vote-suspicious-btn"
              onClick={() => handleVote('suspicious')}
              disabled={!!hasVotedFraud}
              aria-pressed={hasVotedFraud === 'suspicious'}
            >
              🚨 Vote: Suspicious
            </button>
            <button
              className={`btn vote-btn-legitimate ${hasVotedFraud === 'legitimate' ? 'selected' : ''}`}
              id="vote-legitimate-btn"
              onClick={() => handleVote('legitimate')}
              disabled={!!hasVotedFraud}
              aria-pressed={hasVotedFraud === 'legitimate'}
            >
              ✅ Vote: Legitimate
            </button>
          </div>

          {/* Vote count */}
          <div className="card" style={{ background: 'var(--color-bg)' }}>
            <div className="card-title mb-3">Community Vote Count</div>
            <VoteBar
              forVotes={localVotes.for}
              against={localVotes.against}
              total={fraudCase.totalVoters}
              forLabel="Suspicious"
              againstLabel="Legitimate"
              forColor="var(--color-danger)"
              againstColor="var(--color-success)"
            />

            {hasVotedFraud && (
              <div className={`trust-hint mt-4 ${outcome === 'revoke' ? 'text-danger' : 'text-success'}`}
                style={{ color: outcome === 'revoke' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                <strong>Projected Outcome:</strong>{' '}
                {outcome === 'revoke'
                  ? '🚫 Loan will be revoked — community majority voted Suspicious.'
                  : '✅ Loan will be approved — community majority voted Legitimate.'}
              </div>
            )}
          </div>
        </div>

        {/* Right — explainer */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-title mb-4">How Fraud Voting Works</div>
          <div className="tips-list mb-5">
            <div className="tip-row"><span>👁️</span><span className="text-sm">The community reviews flagged loans collectively</span></div>
            <div className="tip-row"><span>🗳️</span><span className="text-sm">Each verified member gets one vote per case</span></div>
            <div className="tip-row"><span>⚖️</span><span className="text-sm">51% majority determines the outcome automatically</span></div>
            <div className="tip-row"><span>🚫</span><span className="text-sm">Fraudulent loans are revoked and borrower is flagged</span></div>
          </div>
          <div className="card" style={{ background: '#EAF3DE', border: '1px solid #97C459' }}>
            <div className="font-semibold text-sm mb-2" style={{ color: '#3B6D11' }}>Your voting power</div>
            <div className="text-xs" style={{ color: '#3B6D11' }}>
              As a verified member with Trust Score 72, your vote carries full weight in community decisions.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
