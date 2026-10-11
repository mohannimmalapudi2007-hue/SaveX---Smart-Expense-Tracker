import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CURRENCIES } from '../../utils/constants';
import {
  User,
  Lock,
  Globe,
  Sliders,
  Download,
  Trash2,
  CheckCircle,
  Eye
} from 'lucide-react';
import Modal from '../../components/common/Modal';

const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'USD');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Accessibility State
  const [fontSize, setFontSize] = useState(user?.accessibilityPreferences?.fontSize || 'normal');

  // Deletion Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        preferredCurrency,
        timezone,
        accessibilityPreferences: { fontSize }
      });
    } catch (err) {
      // handled in context
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch('/auth/change-password', { currentPassword, newPassword });
      showToast('Password changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/users/export-data');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `savex-backup-${user?.email}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Full data archive exported successfully.', 'success');
    } catch (err) {
      showToast('Failed to export data.', 'error');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      showToast('Please enter your password to confirm.', 'error');
      return;
    }

    setDeleting(true);
    try {
      await api.post('/users/delete-account', { confirmationPassword: deletePassword });
      showToast('Your SaveX account has been deleted.', 'info');
      logout();
    } catch (err) {
      showToast(err.message || 'Deletion failed. Check password.', 'error');
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '880px' }}>
      <div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
          User Settings & Preferences
        </h2>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          Manage your identity, security credentials, accessibility settings, and personal data portability
        </span>
      </div>

      {/* Profile & Currency Preferences */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
          Profile & Regional Preferences
        </h3>

        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ background: 'var(--bg-main)', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Preferred Currency</label>
              <select
                className="form-select"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol}) — {c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Timezone</label>
              <input
                type="text"
                className="form-input"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. UTC, Asia/Kolkata, America/New_York"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Interface Text Size</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['normal', 'large', 'xlarge'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: fontSize === size ? 'var(--soft-blue)' : '#FFFFFF',
                    color: fontSize === size ? 'var(--primary-blue)' : 'var(--text-primary)',
                    fontWeight: fontSize === size ? 600 : 500,
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {size} Text
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={updatingProfile}>
            {updatingProfile ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>

      {/* Security: Change Password */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
          Change Password
        </h3>

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              required
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password (Min. 8 characters)</label>
              <input
                type="password"
                required
                minLength={8}
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Data Management & Account Deletion */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>
          Data Portability & Account Lifecycle
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--deep-blue)' }}>Export All Personal Data</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Download a JSON archive of your entire profile, accounts, transactions, and budgets
            </span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleExportData}>
            <Download size={14} /> Download Archive
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--error-text)' }}>Permanently Delete Account</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Irreversibly delete your account, authentication tokens, and all financial documents
            </span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 size={14} /> Delete Account
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Account Deletion">
        <form onSubmit={handleDeleteAccount}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--error-text)', lineHeight: 1.6, marginBottom: '16px' }}>
            Warning: This action is permanent. All your transactions, account ledgers, budgets, and savings goals will be immediately deleted from the database.
          </p>

          <div className="form-group">
            <label className="form-label">Enter Password to Confirm *</label>
            <input
              type="password"
              required
              className="form-input"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Permanently Delete Everything'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
