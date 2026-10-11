import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        padding: '48px 0 24px 0',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '40px'
          }}
        >
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.svg" alt="SaveX Logo" width="28" height="28" />
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--deep-blue)' }}>
                SaveX
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your Money. Your Goals. Your Future. A smart, intuitive financial management platform designed for clarity and peace of mind.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--success-green)' }}>
              <ShieldCheck size={16} /> Privacy-first personal finance
            </div>
          </div>

          {/* Product Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--deep-blue)' }}>
              Product
            </h4>
            <Link to="/features" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Features</Link>
            <Link to="/login" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Web App</Link>
            <Link to="/register" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Free Account</Link>
          </div>

          {/* Resources & Support */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--deep-blue)' }}>
              Company & Help
            </h4>
            <Link to="/about" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>About SaveX</Link>
            <Link to="/faq" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>FAQ & Guides</Link>
            <Link to="/privacy" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Terms of Service</Link>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)'
          }}
        >
          <span>© {new Date().getFullYear()} SaveX Technologies. All rights reserved.</span>
          <span>Built with modern full-stack engineering standards.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
