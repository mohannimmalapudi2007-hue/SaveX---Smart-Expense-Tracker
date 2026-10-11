import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <nav
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '14px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo & Name */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" alt="SaveX Logo" width="34" height="34" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--deep-blue)', lineHeight: 1 }}>
              SaveX
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.02em' }}>
              Your Money. Your Goals.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            '@media (max-width: 768px)': { display: 'none' }
          }}
          className="desktop-nav"
        >
          <Link to="/features" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
            Features
          </Link>
          <Link to="/about" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
            About
          </Link>
          <Link to="/faq" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
            FAQ
          </Link>
        </div>

        {/* Desktop Auth CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="desktop-nav">
          {isAuthenticated ? (
            <Link to="/app/dashboard" className="btn btn-primary btn-sm">
              Open Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--deep-blue)',
            display: 'none',
            padding: '4px'
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid var(--border-color)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <Link to="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
          {isAuthenticated ? (
            <Link to="/app/dashboard" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
              Open Dashboard
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
