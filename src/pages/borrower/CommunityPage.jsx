import React, { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../components/shared/ToastProvider';

/**
 * CommunityPage — Full private trust network system.
 * Off-chain community data (name, members) is stored in AppContext (simulated DB).
 * On-chain: endorseUser() is called to permanently boost TrustScore when members endorse.
 */

const generateInviteCode = (name, creator) =>
  btoa(`${name}::${creator}`).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();

export const CommunityPage = () => {
  const showToast = useToast();
  const { contract, account, trustScore, refreshTrustScore } = useContext(Web3Context);
  const { communities, setCommunities, userCommunityId, setUserCommunityId } = useContext(AppContext);

  // ── View states ──────────────────────────────────────────────────────────────
  const [view, setView] = useState('landing'); // 'landing' | 'create' | 'join' | 'dashboard'
  const [communityName, setCommunityName] = useState('');
  const [communityDesc, setCommunityDesc] = useState('');
  const [inviteInput, setInviteInput]     = useState('');
  const [endorseAddr, setEndorseAddr]     = useState('');
  const [endorsing, setEndorsing]         = useState(false);
  const [loading, setLoading]             = useState(false);

  // Determine if user already in a community
  const myCommunity = userCommunityId
    ? (communities || []).find(c => c.id === userCommunityId)
    : null;

  useEffect(() => {
    if (myCommunity) setView('dashboard');
  }, [myCommunity]);

  // ── Create Community ─────────────────────────────────────────────────────────
  const handleCreate = (e) => {
    e.preventDefault();
    if (!account) { showToast('Connect your wallet first!', 'error'); return; }
    if (!communityName.trim()) { showToast('Please enter a community name.', 'error'); return; }

    setLoading(true);
    const id   = generateInviteCode(communityName, account);
    const code = generateInviteCode(communityName + 'invite', account);

    const newCommunity = {
      id,
      name:        communityName.trim(),
      description: communityDesc.trim(),
      admin:       account,
      inviteCode:  code,
      members: [{ address: account, role: 'admin', joinedAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };

    setCommunities(prev => [...(prev || []), newCommunity]);
    setUserCommunityId(id);
    setTimeout(() => { setLoading(false); setView('dashboard'); showToast(`🎉 Community "${communityName}" created! Share code: ${code}`, 'success'); }, 800);
  };

  // ── Join Community ────────────────────────────────────────────────────────────
  const handleJoin = (e) => {
    e.preventDefault();
    if (!account) { showToast('Connect your wallet first!', 'error'); return; }
    const target = (communities || []).find(c => c.inviteCode === inviteInput.toUpperCase().trim());
    if (!target) { showToast('Invalid invite code. Ask your community admin for the correct code.', 'error'); return; }
    if (target.members.some(m => m.address.toLowerCase() === account.toLowerCase())) {
      showToast('You are already a member of this community!', 'error'); return;
    }

    setLoading(true);
    const updated = {
      ...target,
      members: [...target.members, { address: account, role: 'member', joinedAt: new Date().toISOString() }]
    };
    setCommunities(prev => prev.map(c => c.id === target.id ? updated : c));
    setUserCommunityId(target.id);
    setTimeout(() => { setLoading(false); setView('dashboard'); showToast(`✅ Joined "${target.name}" successfully!`, 'success'); }, 600);
  };

  // ── Endorse Member On-Chain ──────────────────────────────────────────────────
  const handleEndorse = async (e) => {
    e.preventDefault();
    if (!contract || !account) { showToast('Connect your wallet!', 'error'); return; }
    if (!endorseAddr.trim() || endorseAddr.toLowerCase() === account.toLowerCase()) {
      showToast('Enter a valid different wallet address.', 'error'); return;
    }
    setEndorsing(true);
    try {
      showToast('Confirm endorsement in MetaMask…', 'info');
      const tx = await contract.endorseUser(endorseAddr.trim());
      await tx.wait();
      showToast("🌟 Endorsed! Their Trust Score +5 on-chain!", 'success');
      await refreshTrustScore(account, contract);
      setEndorseAddr('');
    } catch (err) {
      const reason = err.reason || err.message || '';
      if (reason.includes('Already endorsed')) showToast('You already endorsed this address!', 'error');
      else if (reason.includes('yourself'))     showToast('You cannot endorse yourself!', 'error');
      else showToast('Endorsement failed: ' + reason, 'error');
    } finally {
      setEndorsing(false);
    }
  };

  // ── Leave Community ─────────────────────────────────────────────────────────
  const handleLeave = () => {
    if (!myCommunity) return;
    const updated = {
      ...myCommunity,
      members: myCommunity.members.filter(m => m.address.toLowerCase() !== account.toLowerCase())
    };
    setCommunities(prev => prev.map(c => c.id === myCommunity.id ? updated : c));
    setUserCommunityId(null);
    setView('landing');
    showToast('You have left the community.', 'info');
  };

  const shortAddr = (a) => a ? `${a.slice(0, 8)}…${a.slice(-4)}` : '';

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <section className="screen active" aria-label="Community">
      <div className="page-header-row">
        <div>
          <h2 className="page-title-lg">Community &amp; Trust Pods</h2>
          <div className="card-subtitle">
            Private trust circles — your community is your credit score
          </div>
        </div>
        {trustScore !== null && (
          <span className="pill pill-success" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            ⛓️ Trust Score: <strong style={{ marginLeft: 4 }}>{trustScore}</strong>
          </span>
        )}
      </div>

      {/* ── LANDING (no community) ── */}
      {view === 'landing' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
          <div className="card animate-fade-in-up" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏘️</div>
            <div className="card-title mb-2">Create a Community</div>
            <div className="card-subtitle mb-5">Start a private trust circle. Invite your network to vouch for each other and unlock better loan rates together.</div>
            <button className="btn btn-primary w-full" onClick={() => setView('create')} id="create-community-btn">
              + Create Community
            </button>
          </div>
          <div className="card animate-fade-in-up stagger-1" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔑</div>
            <div className="card-title mb-2">Join a Community</div>
            <div className="card-subtitle mb-5">Have an invite code? Enter it below to join a private trust pod. Communities are invite-only — no public browsing.</div>
            <button className="btn btn-outline w-full" onClick={() => setView('join')} id="join-community-btn"
              style={{ borderColor: '#3B9B9B', color: '#3B9B9B' }}>
              Enter Invite Code →
            </button>
          </div>
        </div>
      )}

      {/* ── CREATE ── */}
      {view === 'create' && (
        <div className="card animate-fade-in-up" style={{ maxWidth: 520, margin: '0 auto' }}>
          <button className="btn btn-ghost" style={{ marginBottom: 16, fontSize: '0.85rem' }} onClick={() => setView('landing')}>
            ← Back
          </button>
          <div className="card-title mb-1">Create a Private Community</div>
          <div className="card-subtitle mb-5">You will be the admin. Share the generated invite code with trusted members only.</div>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label" htmlFor="community-name">Community Name</label>
              <input className="form-control" id="community-name" placeholder="e.g. Nashik Traders' Pod"
                value={communityName} onChange={e => setCommunityName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="community-desc">
                Description <span className="text-muted">(optional)</span>
              </label>
              <textarea className="form-control" id="community-desc" rows="2"
                placeholder="Who this community is for…"
                value={communityDesc} onChange={e => setCommunityDesc(e.target.value)}
                style={{ resize: 'vertical', minHeight: 64 }} />
            </div>
            <div className="trust-hint mb-4">
              🔒 This community is <strong>private</strong>. Members can only join with your unique invite code. No public listing.
            </div>
            <button type="submit" className="btn btn-primary w-full" id="confirm-create-btn" disabled={loading}>
              {loading ? '⏳ Creating…' : '🏘️ Create Community →'}
            </button>
          </form>
        </div>
      )}

      {/* ── JOIN ── */}
      {view === 'join' && (
        <div className="card animate-fade-in-up" style={{ maxWidth: 520, margin: '0 auto' }}>
          <button className="btn btn-ghost" style={{ marginBottom: 16, fontSize: '0.85rem' }} onClick={() => setView('landing')}>
            ← Back
          </button>
          <div className="card-title mb-1">Join a Community</div>
          <div className="card-subtitle mb-5">Enter the invite code shared by your community admin.</div>
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label className="form-label" htmlFor="invite-code">Invite Code</label>
              <input className="form-control" id="invite-code" placeholder="e.g. A1B2C3D4E5"
                value={inviteInput} onChange={e => setInviteInput(e.target.value)} required
                style={{ fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }} />
            </div>
            <div className="trust-hint mb-4">
              🔑 Communities are <strong>invite-only</strong>. You need a valid code from an existing member.
            </div>
            <button type="submit" className="btn btn-primary w-full" id="confirm-join-btn" disabled={loading}>
              {loading ? '⏳ Joining…' : '✅ Join Community →'}
            </button>
          </form>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {view === 'dashboard' && myCommunity && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

          {/* Community Header */}
          <div className="card animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3B9B9B, #534AB7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>
                    {myCommunity.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{myCommunity.name}</div>
                    {myCommunity.description && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>{myCommunity.description}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <span className="pill pill-success">{myCommunity.members.length} Member{myCommunity.members.length !== 1 ? 's' : ''}</span>
                  {myCommunity.admin.toLowerCase() === account?.toLowerCase() && (
                    <span className="pill" style={{ background: '#EEEDFE', color: '#534AB7', border: 'none' }}>👑 Admin</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {myCommunity.admin.toLowerCase() === account?.toLowerCase() && (
                  <div style={{ padding: 'var(--sp-3)', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--color-muted)', marginBottom: 4 }}>Your Invite Code</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.1em', color: '#3B9B9B' }}>
                      {myCommunity.inviteCode}
                    </div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', marginTop: 2 }}>Share privately with trusted members</div>
                  </div>
                )}
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }} onClick={handleLeave}>
                  Leave Community
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
            {/* Members List */}
            <div className="card animate-fade-in-up stagger-1">
              <div className="card-title mb-4">Members</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myCommunity.members.map((m, i) => (
                  <div key={m.address} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--sp-2) 0', borderBottom: i < myCommunity.members.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.role === 'admin' ? '#534AB7' : '#3B9B9B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                      {m.address.slice(2, 4).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                        {shortAddr(m.address)}
                        {m.address.toLowerCase() === account?.toLowerCase() && (
                          <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#3B9B9B' }}>(you)</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 2 }}>
                        {m.role === 'admin' ? '👑 Admin' : '👤 Member'} · Joined {new Date(m.joinedAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Endorse a Member */}
            <div className="card animate-fade-in-up stagger-2">
              <div className="card-title mb-2">🌟 Endorse a Member</div>
              <div className="card-subtitle mb-4">
                Endorsements are permanent on-chain! Each endorsement gives the recipient +5 Trust Score, making them eligible for better loan rates.
              </div>

              <div className="trust-hint mb-4" style={{ background: '#E0F4F4', border: '1px solid #3B9B9B22', color: '#3B9B9B' }}>
                <strong>How it works:</strong> You confirm a transaction in MetaMask (no ETH sent — gas only).
                The recipient's Trust Score increases by +5 permanently on the Ethereum blockchain.
                You can only endorse each address once.
              </div>

              <form onSubmit={handleEndorse}>
                <div className="form-group">
                  <label className="form-label" htmlFor="endorse-addr">Wallet Address to Endorse</label>
                  <input className="form-control" id="endorse-addr"
                    placeholder="0x…"
                    value={endorseAddr} onChange={e => setEndorseAddr(e.target.value)} required
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 4 }}>
                    Tip: Ask your community member to share their MetaMask address
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full" id="submit-endorse-btn" disabled={endorsing}>
                  {endorsing ? '⏳ Confirming on MetaMask…' : '🌟 Endorse &amp; Boost Trust Score →'}
                </button>
              </form>

              {/* Quick endorse existing members */}
              {myCommunity.members.filter(m => m.address.toLowerCase() !== account?.toLowerCase()).length > 0 && (
                <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 10 }}>Quick endorse a community member:</div>
                  {myCommunity.members
                    .filter(m => m.address.toLowerCase() !== account?.toLowerCase())
                    .map(m => (
                      <button key={m.address}
                        className="btn btn-outline"
                        style={{ width: '100%', marginBottom: 6, fontSize: '0.8rem', fontFamily: 'monospace', textAlign: 'left', padding: '8px 12px' }}
                        onClick={() => setEndorseAddr(m.address)}
                        type="button"
                      >
                        {shortAddr(m.address)} {m.role === 'admin' ? '👑' : ''}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
