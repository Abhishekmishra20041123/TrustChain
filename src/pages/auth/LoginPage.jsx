import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Web3Context } from '../../context/Web3Context';

export const LoginPage = () => {
  const { setIsLoggedIn, setUser, user } = useContext(AppContext);
  const { connectWallet, account } = useContext(Web3Context);
  const navigate = useNavigate();

  const handleMetamaskLogin = async (e) => {
    e.preventDefault();
    await connectWallet();
    setUser({ ...user, role: 'borrower' }); // Hackathon demo default
    setIsLoggedIn(true);
    navigate('/app/dashboard');
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" stroke="#3B9B9B" strokeWidth="2" />
            <path d="M10 16.5C10 13.46 12.46 11 15.5 11H22l-3 3h-3.5C12.91 14 12 14.91 12 16.5S12.91 19 14.5 19H18l3 3H14.5C12.46 22 10 19.54 10 16.5Z" fill="#3B9B9B" />
            <circle cx="22" cy="11" r="2" fill="#F4845F" />
            <circle cx="22" cy="22" r="2" fill="#E8A838" />
          </svg>
          <span className="auth-logo-name">TrustChain</span>
        </div>
        <div className="auth-tagline">Your community is your credit score</div>

        <form onSubmit={handleMetamaskLogin} className="auth-form mt-4">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Connect your Web3 Wallet to continue</p>
          
          <button type="submit" className="btn btn-primary w-full mt-4" id="connect-metamask-btn">
             <svg viewBox="0 0 32 32" fill="none" width="20" height="20" aria-hidden="true" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                <path d="M29.5 12L20 4.5l-4-3-4 3-9.5 7.5L5 21l3 7.5L16 29l8-1.5 3-7.5 2.5-9z" fill="#F6851B" stroke="#F6851B" strokeWidth="1" strokeLinejoin="round"/>
             </svg>
            Connect MetaMask
          </button>
          
          {account && (
             <div className="text-center mt-4 text-sm text-success">
               Connected: {account.substring(0,6)}...{account.substring(38)}
             </div>
          )}
          <div className="auth-divider">Secure Blockchain Authentication</div>
        </form>

        <div className="auth-footer-link">
          No account? <Link to="/signup">Create one here →</Link>
        </div>
      </div>

      {/* Side illustration */}
      <div className="auth-side" aria-hidden="true">
        <div className="auth-side-content">
          <div className="auth-side-title">Join 12,400+ community members</div>
          <div className="auth-side-stat">₹4.2 Cr disbursed · 94% repayment rate</div>
          <div className="auth-testimonial">
            <div className="avatar" style={{ background: '#E8A838' }}>PM</div>
            <blockquote>"I got ₹8,000 in 24 hours — no bank, no guarantor, just my neighbours."</blockquote>
            <cite>— Priya Mehta, Nashik</cite>
          </div>
        </div>
      </div>
    </div>
  );
};
