import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Check, Wallet, PiggyBank, Target } from 'lucide-react';
import { CURRENCIES, ACCOUNT_TYPES } from '../../utils/constants';

const OnboardingPage = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'USD');

  // Account details
  const [accountName, setAccountName] = useState('Primary Checking');
  const [accountType, setAccountType] = useState('checking');
  const [openingBalance, setOpeningBalance] = useState('1000');

  // Budget details
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState('2500');

  // Savings goal details
  const [goalName, setGoalName] = useState('Emergency Fund');
  const [goalTarget, setGoalTarget] = useState('5000');

  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (skipAll = false) => {
    setSubmitting(true);
    try {
      if (skipAll) {
        await completeOnboarding({ displayName: displayName || user?.name });
      } else {
        await completeOnboarding({
          displayName,
          preferredCurrency,
          initialAccountName: accountName,
          initialAccountBalance: openingBalance ? Number(openingBalance) : 0,
          initialAccountType: accountType,
          monthlyBudgetLimit: monthlyBudgetLimit ? Number(monthlyBudgetLimit) : 0,
          savingsGoalName: goalName,
          savingsGoalTarget: goalTarget ? Number(goalTarget) : 0
        });
      }
      navigate('/app/dashboard');
    } catch (err) {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '24px'
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.svg" alt="SaveX" width="32" height="32" />
            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--deep-blue)' }}>
              SaveX Setup
            </span>
          </div>
          <button
            onClick={() => handleFinish(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 'var(--font-size-xs)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Skip setup
          </button>
        </div>

        <div className="card" style={{ padding: '36px' }}>
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)', marginBottom: '8px' }}>
                <Sparkles size={20} />
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>STEP 1 OF 3</span>
              </div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--deep-blue)', marginBottom: '6px' }}>
                Your Profile & Currency
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                How should SaveX address you and format your money?
              </p>

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Currency</label>
                <select
                  className="form-select"
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(2)}
                style={{ width: '100%', marginTop: '16px' }}
              >
                Continue to Accounts <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)', marginBottom: '8px' }}>
                <Wallet size={20} />
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>STEP 2 OF 3</span>
              </div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--deep-blue)', marginBottom: '6px' }}>
                Add Your First Account
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Track starting cash or bank balance. You can add more accounts later.
              </p>

              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Chase Checking, Cash Wallet"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  className="form-select"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Opening Balance ({preferredCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 1 }}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)', marginBottom: '8px' }}>
                <Target size={20} />
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>STEP 3 OF 3</span>
              </div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--deep-blue)', marginBottom: '6px' }}>
                Monthly Budget & Savings Goal
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Optional targets to help SaveX personalize your dashboard.
              </p>

              <div className="form-group">
                <label className="form-label">Monthly Overall Budget Limit ({preferredCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={monthlyBudgetLimit}
                  onChange={(e) => setMonthlyBudgetLimit(e.target.value)}
                  placeholder="e.g. 2500"
                />
              </div>

              <div className="form-group">
                <label className="form-label">First Savings Goal Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Emergency Fund, New Laptop"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Goal Target Amount ({preferredCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="e.g. 5000"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)} disabled={submitting}>
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleFinish(false)}
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? 'Setting up SaveX...' : 'Complete Setup & Open Dashboard'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
