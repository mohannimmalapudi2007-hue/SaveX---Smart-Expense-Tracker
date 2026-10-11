import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const PrivacyPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: '800px', padding: '60px 20px', flex: 1 }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
          Privacy Information
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Last updated: October 2026
        </p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: 1.7, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          <p>
            SaveX is committed to protecting your privacy and personal financial information. This Privacy Notice outlines how we collect, use, and safeguard your data.
          </p>

          <h3 style={{ color: 'var(--deep-blue)' }}>1. Information We Collect</h3>
          <p>
            We collect the information you provide directly, such as your display name, email address, password hash, transaction details, account names, and financial budgets. We do not store plaintext banking passwords.
          </p>

          <h3 style={{ color: 'var(--deep-blue)' }}>2. How We Use Your Data</h3>
          <p>
            Your information is used strictly to provide personal financial management features: calculating net worth, budgeting utilization, savings rate analytics, and custom financial alerts.
          </p>

          <h3 style={{ color: 'var(--deep-blue)' }}>3. Data Isolation & Security</h3>
          <p>
            Your financial records are strictly isolated to your user account. We enforce industry-standard password hashing (bcrypt), token-based authentication, and encryption during transit.
          </p>

          <h3 style={{ color: 'var(--deep-blue)' }}>4. Your Rights: Export and Deletion</h3>
          <p>
            You retain 100% ownership of your data. You may export your entire transaction history and profile at any time, or permanently delete your account and all associated records from your settings.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
