import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_LOANS } from '../../data/mockData';
import { LoanCard } from '../../components/shared/SharedComponents';

export const BrowseLoansPage = () => {
  const navigate = useNavigate();
  const [riskFilter, setRiskFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');

  const filtered = MOCK_LOANS.filter(l => {
    const riskOk = riskFilter === 'all' || l.riskTier === riskFilter;
    const amountOk = amountFilter === 'all'
      || (amountFilter === 'small' && l.amount <= 5000)
      || (amountFilter === 'medium' && l.amount > 5000 && l.amount <= 15000)
      || (amountFilter === 'large' && l.amount > 15000);
    return riskOk && amountOk;
  });

  return (
    <section className="screen active" aria-label="Browse Loans">
      <div className="page-header-row">
        <div>
          <h2 className="page-title-lg">Browse Loans</h2>
          <div className="card-subtitle">Find a loan to fund and earn returns</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card animate-fade-in-up mb-5">
        <div className="filter-row">
          <div>
            <div className="form-label mb-2">Risk Tier</div>
            <div className="filter-group" role="group" aria-label="Filter by risk">
              {['all', 'Low', 'Medium', 'High'].map(r => (
                <button key={r} className={`filter-btn ${riskFilter === r ? 'active' : ''}`}
                  id={`risk-filter-${r.toLowerCase()}`} onClick={() => setRiskFilter(r)}>
                  {r === 'all' ? 'All' : `${r} Risk`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="form-label mb-2">Amount</div>
            <div className="filter-group" role="group" aria-label="Filter by amount">
              {[
                { val: 'all', label: 'All' },
                { val: 'small', label: '≤ ₹5k' },
                { val: 'medium', label: '₹5k–₹15k' },
                { val: 'large', label: '> ₹15k' },
              ].map(a => (
                <button key={a.val} className={`filter-btn ${amountFilter === a.val ? 'active' : ''}`}
                  id={`amount-filter-${a.val}`} onClick={() => setAmountFilter(a.val)}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loan cards */}
      <div className="loan-browse-grid">
        {filtered.length === 0 ? (
          <div className="card text-center text-muted" style={{ gridColumn: '1/-1', padding: 'var(--sp-10)' }}>
            No loans match your filters. Try a different combination.
          </div>
        ) : filtered.map(loan => (
          <LoanCard key={loan.id} loan={loan} onFund={() => navigate('/loan/fund', { state: { loan } })} showFundBtn={true} />
        ))}
      </div>
    </section>
  );
};
