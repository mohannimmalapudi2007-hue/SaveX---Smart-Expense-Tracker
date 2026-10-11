import React from 'react';
import { HelpCircle, BookOpen, Key, AlertCircle, FileText } from 'lucide-react';

const HelpPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>
      <div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
          Help & Documentation
        </h2>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          Quick guides, accounting rules, and best practices for using SaveX
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Accounting Rules */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <BookOpen size={20} color="var(--primary-blue)" />
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>Accounting Rules in SaveX</h3>
          </div>
          <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '18px' }}>
            <li><strong>Transfers:</strong> Moving money from Checking to Savings reduces the source balance and increases destination balance without counting as an expense.</li>
            <li><strong>Refunds:</strong> A refund offsets previous expenses, restoring your account balance without artificially inflating recognized income.</li>
            <li><strong>Minor Units:</strong> All money is processed in integer minor units (paise/cents) to prevent floating point calculation drift.</li>
          </ul>
        </div>

        {/* CSV Format */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <FileText size={20} color="var(--success-green)" />
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>CSV Format Guidelines</h3>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            When uploading a CSV file to SaveX, ensure your file contains these columns:
          </p>
          <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'monospace', marginTop: '8px' }}>
            Date, Description, Amount, Type, Category, Notes
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
            Allowed types: expense, income, transfer, refund. Dates can be YYYY-MM-DD or MM/DD/YYYY.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
