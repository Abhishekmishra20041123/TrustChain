import React, { useState } from 'react';
import { MOCK_ACTIVITY } from '../data/mockData';

const ALL_ITEMS = [
  ...MOCK_ACTIVITY,
  { id: 'a7', type: 'repaid', actor: 'Kavita', amount: 750, time: '3d ago', icon: '✓' },
  { id: 'a8', type: 'requested', actor: 'Mohan', amount: 6000, time: '3d ago', icon: '📋' },
  { id: 'a9', type: 'funded', actor: 'Sneha', amount: 4000, time: '4d ago', icon: '₹' },
  { id: 'a10', type: 'repaid', actor: 'Ganesh', amount: 1000, time: '5d ago', icon: '✓' },
];

const typeStyle = {
  repaid: { label: 'Repaid ✓', color: 'var(--color-success)', bg: '#EAF3DE' },
  funded: { label: 'Funded', color: '#185FA5', bg: '#E6F1FB' },
  requested: { label: 'Requested', color: 'var(--color-warning)', bg: '#FDE8C0' },
  vouched: { label: 'Vouched', color: '#534AB7', bg: '#EEEDFE' },
};

export const TransactionLogPage = () => {
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const items = ALL_ITEMS.filter(i => filter === 'all' || i.type === filter);

  const handleExport = () => {
    const rows = [['Type', 'Actor', 'Amount', 'Time'],
      ...items.map(i => [i.type, i.actor, i.amount || '', i.time])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'trustchain_activity.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="screen active" aria-label="Transaction Log">
      <div className="page-header-row">
        <div>
          <h2 className="page-title-lg">Activity Log</h2>
          <div className="card-subtitle">All transactions on TrustChain</div>
        </div>
        <button className="btn btn-outline btn-sm" id="export-csv-btn" onClick={handleExport}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="filter-row">
          <div className="filter-group" role="group" aria-label="Filter by type">
            {['all', 'repaid', 'funded', 'requested'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                id={`filter-${f}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="filter-group date-filter" role="group" aria-label="Filter by date">
            {['all', '7d', '30d', '90d'].map(d => (
              <button
                key={d}
                className={`filter-btn ${dateFilter === d ? 'active' : ''}`}
                id={`date-filter-${d}`}
                onClick={() => setDateFilter(d)}
              >
                {d === 'all' ? 'All time' : `Last ${d}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="card animate-fade-in-up stagger-2">
        <div role="list" aria-label="Activity feed" className="txn-feed">
          {items.map(item => {
            const { label, color, bg } = typeStyle[item.type] || typeStyle.repaid;
            return (
              <div key={item.id} className="txn-row" role="listitem">
                <div className="txn-icon" style={{ background: bg, color }} aria-hidden="true">
                  {item.icon}
                </div>
                <div className="txn-body">
                  <div className="txn-title">
                    <span className="font-medium">{item.actor}</span>
                    {item.type === 'repaid' && <> repaid <strong>₹{item.amount?.toLocaleString('en-IN')}</strong></>}
                    {item.type === 'funded' && <> funded <strong>₹{item.amount?.toLocaleString('en-IN')}</strong></>}
                    {item.type === 'requested' && <> requested <strong>₹{item.amount?.toLocaleString('en-IN')}</strong> loan</>}
                    {item.type === 'vouched' && <> vouched for a community member</>}
                  </div>
                  <div className="txn-time text-xs text-muted">{item.time}</div>
                </div>
                <span className="pill text-xs" style={{ background: bg, color, border: 'none', flexShrink: 0 }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
