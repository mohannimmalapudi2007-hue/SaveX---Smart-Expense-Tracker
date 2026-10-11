import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HelpCircle } from 'lucide-react';

const FaqPage = () => {
  const faqs = [
    {
      q: 'Is SaveX completely free to use?',
      a: 'Yes, SaveX is fully open and functional for tracking personal and household finances without subscription paywalls.'
    },
    {
      q: 'How does SaveX calculate net cash flow and savings rate?',
      a: 'Net cash flow equals recognised income minus recognised expenses for the period. Savings rate is calculated as net savings divided by recognized income multiplied by 100.'
    },
    {
      q: 'Does SaveX connect directly to my bank credentials?',
      a: 'No. To prioritize your security and avoid third-party aggregators selling your data, SaveX operates via user input and bank CSV imports.'
    },
    {
      q: 'What happens if I delete an account?',
      a: 'To safeguard your historical balances, SaveX checks if the account has transactions. If it does, we prompt you to archive it rather than corrupting your previous tax and spending records.'
    },
    {
      q: 'Can I export my data if I decide to switch tools?',
      a: 'Yes, SaveX includes an "Export Data" feature under Settings where you can download your entire profile, accounts, budgets, and transactions in structured JSON or CSV format.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: '800px', padding: '60px 20px', flex: 1 }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Find detailed answers to common questions about security, accounting methods, and data export.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {faqs.map((f, idx) => (
            <div key={idx} className="card">
              <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)', marginBottom: '8px' }}>
                {f.q}
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FaqPage;
