import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { ACCOUNT_TYPES } from '../../utils/constants';
import {
  Wallet,
  Plus,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  CreditCard,
  Building,
  Coins
} from 'lucide-react';

const AccountsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshTrigger, onRefresh } = useOutletContext() || {};

  const [accounts, setAccounts] = useState([]);
  const [totalNetWorth, setTotalNetWorth] = useState(0);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [institutionName, setInstitutionName] = useState('');
  const [color, setColor] = useState('#3978D4');
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/accounts?includeArchived=${includeArchived}`);
      setAccounts(res.data.accounts || []);
      setTotalNetWorth(res.data.totalNetWorth || 0);
    } catch (err) {
      showToast('Error loading accounts.', 'error');
    } finally {
      setLoading(false);
    }
  }, [includeArchived, showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts, refreshTrigger]);

  const openCreateModal = () => {
    setAccountToEdit(null);
    setName('');
    setType('checking');
    setOpeningBalance('0');
    setInstitutionName('');
    setColor('#3978D4');
    setModalOpen(true);
  };

  const openEditModal = (acc) => {
    setAccountToEdit(acc);
    setName(acc.name);
    setType(acc.type);
    setOpeningBalance(acc.openingBalance.toString());
    setInstitutionName(acc.institutionName || '');
    setColor(acc.color || '#3978D4');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Account name is required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (accountToEdit) {
        await api.patch(`/accounts/${accountToEdit._id}`, {
          name: name.trim(),
          type,
          institutionName: institutionName.trim(),
          color
        });
        showToast('Account updated.', 'success');
      } else {
        await api.post('/accounts', {
          name: name.trim(),
          type,
          currency: user?.preferredCurrency || 'USD',
          openingBalance: Number(openingBalance) || 0,
          institutionName: institutionName.trim(),
          color
        });
        showToast('Account created successfully.', 'success');
      }
      setModalOpen(false);
      fetchAccounts();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArchive = async (id) => {
    try {
      const res = await api.patch(`/accounts/${id}/archive`);
      showToast(res.data.message, 'info');
      fetchAccounts();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to archive account.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account? (Only accounts with 0 transactions can be deleted)')) {
      return;
    }
    try {
      await api.delete(`/accounts/${id}`);
      showToast('Account deleted.', 'success');
      fetchAccounts();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Could not delete account.', 'error');
    }
  };

  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Financial Accounts
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Total Combined Net Worth: <strong>{formatCurrency(totalNetWorth, currency)}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
            />
            Show archived accounts
          </label>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Loading account balances..." />
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No accounts registered"
          description="Create your first bank account or wallet to track balances."
          actionLabel="Add Account"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {accounts.map((acc) => (
            <div
              key={acc._id}
              className="card"
              style={{
                borderLeft: `4px solid ${acc.color || 'var(--primary-blue)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: acc.isArchived ? 0.65 : 1
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--deep-blue)' }}>
                      {acc.name}
                    </h3>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {acc.institutionName ? `${acc.institutionName} • ` : ''}{acc.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {acc.isArchived && (
                    <span className="badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
                      Archived
                    </span>
                  )}
                </div>

                <div style={{ margin: '18px 0 12px 0' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT BALANCE</span>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--deep-blue)', marginTop: '2px' }}>
                    {formatCurrency(acc.currentBalance, acc.currency || currency)}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Opening: {formatCurrency(acc.openingBalance, acc.currency || currency)}
                  </span>
                </div>
              </div>

              {/* Account Card Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px',
                  marginTop: '12px'
                }}
              >
                <button
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={() => openEditModal(acc)}
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={() => toggleArchive(acc._id)}
                  title={acc.isArchived ? 'Restore account' : 'Archive account'}
                >
                  {acc.isArchived ? <RotateCcw size={13} /> : <Archive size={13} />} {acc.isArchived ? 'Restore' : 'Archive'}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={() => handleDelete(acc._id)}
                  title="Delete account"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Account Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={accountToEdit ? 'Edit Account' : 'Add New Account'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Main Checking, Savings Vault"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Account Type *</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {!accountToEdit && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Opening Balance ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Financial Institution</label>
              <input
                type="text"
                placeholder="e.g. Chase, Wells Fargo, Cash"
                className="form-input"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Accent Color</label>
              <input
                type="color"
                className="form-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ height: '42px', padding: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : accountToEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountsPage;
