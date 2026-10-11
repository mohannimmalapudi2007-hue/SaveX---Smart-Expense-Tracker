import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Globe } from 'lucide-react';
import { CURRENCIES } from '../../utils/constants';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password, preferredCurrency);
      navigate('/onboarding');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
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
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg-main)',
        padding: '24px'
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <img src="/logo.svg" alt="SaveX" width="40" height="40" />
        <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--deep-blue)' }}>
          SaveX
        </span>
      </Link>

      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)', marginBottom: '8px' }}>
            Create Your Account
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Start your journey toward complete financial clarity.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--error-bg)',
              color: 'var(--error-text)',
              border: '1px solid var(--error-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              marginBottom: '20px'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min. 8 characters) *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                minLength={8}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Currency *</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                style={{ paddingLeft: '38px' }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
              <Globe size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: '20px', padding: '12px' }}
          >
            {submitting ? 'Creating Account...' : 'Get Started Free'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
