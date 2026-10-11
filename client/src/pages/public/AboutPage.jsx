import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Target, Shield, HeartHandshake, Award } from 'lucide-react';

const AboutPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: '840px', padding: '60px 20px', flex: 1 }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
          About SaveX
        </h1>
        <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '36px' }}>
          SaveX was founded with a clear mission: empower individuals and households to take control of their finances through accurate, transparent, and beautiful software.
        </p>

        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--deep-blue)', marginBottom: '12px' }}>
            Our Core Principles
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <h4 style={{ color: 'var(--primary-blue)', marginBottom: '6px' }}>1. Mathematical Precision</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                We don't cut corners with binary floating-point math. Every transaction is computed in integer minor units to guarantee 100% accounting fidelity.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--primary-blue)', marginBottom: '6px' }}>2. Data Ownership & Privacy</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Your financial data belongs exclusively to you. You can export or delete your entire history at any time with a single click.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--primary-blue)', marginBottom: '6px' }}>3. Explainable Financial Intelligence</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Our financial insights explain exactly where their calculations come from, giving you reliable clarity rather than opaque guesses.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
