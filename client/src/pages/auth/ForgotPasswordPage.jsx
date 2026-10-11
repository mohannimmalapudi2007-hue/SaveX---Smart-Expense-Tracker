import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
    } catch (err) {
      // Soft feedback
      setSubmitted(true);
    } finally {
      setLoading(false);
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
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <img src="/logo.svg" alt="SaveX" width="40" height="40" />
        <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--deep-blue)' }}>
          SaveX
        </span>
      </Link>

      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)', marginBottom: '8px' }}>
            Reset Password
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Enter your email to receive secure instructions.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={44} color="var(--success-green)" />
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              If an account matches <strong>{email}</strong>, a secure reset token has been issued.
            </p>
            {devToken && (
              <div style={{ padding: '12px', background: 'var(--soft-blue)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', wordBreak: 'break-all' }}>
                <strong>Local Development Token:</strong>
                <p style={{ marginTop: '4px' }}>{devToken}</p>
                <Link to={`/reset-password?token=${devToken}`} className="btn btn-primary btn-sm" style={{ marginTop: '8px', display: 'inline-block' }}>
                  Proceed to Reset
                </Link>
              </div>
            )}
            <Link to="/login" className="btn btn-outline" style={{ marginTop: '12px' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '16px', padding: '12px' }}
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/login" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
