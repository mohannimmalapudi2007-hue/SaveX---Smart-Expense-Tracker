import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const TermsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: '800px', padding: '60px 20px', flex: 1 }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
          Terms of Use
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Last updated: October 2026
        </p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: 1.7, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          <p>
            By accessing or using SaveX, you agree to these Terms of Use.
          </p>

          <h3 style={{ color: 'var(--deep-blue)' }}>1. Financial Software, Not an Advisory Firm</h3>
          <p>
            SaveX is a personal finance software application designed for budgeting, expense tracking, and goal planning. SaveX is not a licensed financial advisory firm, broker, or depository institution. Calculations and insights generated within the application do not constitute professional investment or tax advice.
          </p>

          <h3 style={{ color: 'var(--deep-blue)' }}>2. User Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account password and ensuring the accuracy of transaction details you manually input or import.
          </p>

          <h3 style={{ color: 'var(--deep-blue)' }}>3. Availability & Service</h3>
          <p>
            While we strive for continuous service reliability, SaveX is provided "as is" and "as available". We recommend regularly backing up your financial records using our built-in CSV and JSON export tools.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;
