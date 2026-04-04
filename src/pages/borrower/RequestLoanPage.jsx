import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../components/shared/ToastProvider';
import { calcLoan } from '../../utils/formatters';

export const RequestLoanPage = () => {
  const { podStrength, verification } = useContext(AppContext);
  const [amount, setAmount] = useState(10000);
  const [period, setPeriod] = useState(3);
  const [purpose, setPurpose] = useState('');
  const [story, setStory] = useState('');
  const [riskTier, setRiskTier] = useState('Low');
  const [weeklyPayment, setWeeklyPayment] = useState(0);
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const data = calcLoan(amount, period * 4, podStrength, verification);
    setWeeklyPayment(data.weekly);
    setRiskTier(amount > 30000 ? 'High' : amount > 15000 ? 'Medium' : 'Low');
  }, [amount, period, podStrength, verification]);

  const riskColor = { Low: 'var(--color-success)', Medium: 'var(--color-warning)', High: 'var(--color-danger)' };
  const riskPill = { Low: 'pill-success', Medium: 'pill-warning', High: 'pill-danger' };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (window.showTcDialog) {
      window.showTcDialog(
        'Submit Loan Request',
        `You are requesting ₹${amount.toLocaleString('en-IN')} for ${period} month(s). Your community will review and fund it within 24 hours.`,
        () => {
          showToast('Loan request submitted! Your community will review it shortly.', 'success');
          navigate('/dashboard');
        }
      );
    }
  };

  return (
    <section className="screen active" aria-label="Request a Loan">
      <div className="loan-grid">
        <form className="card animate-fade-in-up" onSubmit={handleSubmit}>
          <div className="card-title mb-1">New Loan Application</div>
          <div className="card-subtitle mb-6">Tell us what you need and why</div>

          {/* Amount slider */}
          <div className="form-group">
            <label className="form-label" htmlFor="loan-amount-slider">
              Loan Amount (₹)
              <span className="form-label-value">₹{amount.toLocaleString('en-IN')}</span>
            </label>
            <input
              type="range"
              id="loan-amount-slider"
              className="amount-slider"
              min="1000" max="50000" step="1000"
              value={amount}
              onChange={e => setAmount(parseInt(e.target.value))}
            />
            <div className="slider-labels">
              <span>₹1,000</span>
              <span>₹25,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Purpose */}
          <div className="form-group">
            <label className="form-label" htmlFor="loan-purpose">Purpose (plain language)</label>
            <input
              className="form-control"
              id="loan-purpose"
              type="text"
              placeholder="e.g. Buying a sewing machine for my tailoring business"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              required
            />
          </div>

          {/* Repayment period */}
          <div className="form-group">
            <label className="form-label">Repayment Period</label>
            <div className="duration-grid">
              {[1, 3, 6].map(m => (
                <button
                  type="button"
                  key={m}
                  className={`btn-duration ${period === m ? 'active' : ''}`}
                  onClick={() => setPeriod(m)}
                  id={`period-${m}m`}
                >
                  <div className="font-semibold">{m} Month{m > 1 ? 's' : ''}</div>
                  <div className="text-xs text-muted">{m * 4} weeks</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional story */}
          <div className="form-group">
            <label className="form-label" htmlFor="loan-story">
              Your Story <span className="text-muted">(optional — increases funding chance)</span>
            </label>
            <textarea
              className="form-control"
              id="loan-story"
              rows="3"
              placeholder="Tell lenders why this loan matters to you..."
              value={story}
              onChange={e => setStory(e.target.value)}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          {/* Photo upload hint */}
          <div className="form-group">
            <div className="upload-zone-sm">
              <span>📷</span>
              <span className="text-sm text-muted">Add a photo to your loan story (optional)</span>
            </div>
          </div>

          {/* Live estimate */}
          <div className="live-estimate-panel">
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Weekly repayment</span>
              <span className="font-semibold text-lg">₹{weeklyPayment.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-6" id="submit-loan-btn">
            Submit Loan Request →
          </button>
          <div className="text-center text-xs text-muted mt-3">
            🔒 Prototype — no real funds transferred
          </div>
        </form>

        {/* Risk panel */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-title mb-4">Auto Risk Assessment</div>

          <div className="risk-tier-display text-center mb-6">
            <div style={{ fontSize: '3rem', fontWeight: '800', color: riskColor[riskTier] }}>{riskTier}</div>
            <span className={`pill ${riskPill[riskTier]}`}>Risk Tier</span>
          </div>

          <div className="risk-factors-list">
            <div className="factor-row">
              <span className="text-sm">Loan Amount</span>
              <span className={`pill text-xs ${amount <= 15000 ? 'pill-success' : amount <= 30000 ? 'pill-warning' : 'pill-danger'}`}>
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="factor-row">
              <span className="text-sm">Repayment Period</span>
              <span className="pill pill-success text-xs">{period} month{period > 1 ? 's' : ''}</span>
            </div>
            <div className="factor-row">
              <span className="text-sm">Community Pod</span>
              <span className={`pill text-xs ${podStrength === 'strong' ? 'pill-success' : 'pill-warning'}`}>
                {podStrength.charAt(0).toUpperCase() + podStrength.slice(1)}
              </span>
            </div>
            <div className="factor-row">
              <span className="text-sm">Verification</span>
              <span className={`pill text-xs ${verification === 'ngo' ? 'pill-success' : 'pill-warning'}`}>
                {verification === 'ngo' ? 'NGO + Phone' : verification === 'phone' ? 'Phone only' : 'None'}
              </span>
            </div>
          </div>

          <div className="trust-hint mt-4">
            {riskTier === 'Low' && '✅ Low risk — your loan will likely be funded quickly.'}
            {riskTier === 'Medium' && '⚠️ Medium risk — consider adding more vouchers to improve funding chances.'}
            {riskTier === 'High' && '🔴 High risk — the amount is large. Consider splitting across two requests.'}
          </div>
        </div>
      </div>
    </section>
  );
};
