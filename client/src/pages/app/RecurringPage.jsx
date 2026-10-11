import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { RECURRING_FREQUENCIES } from '../../utils/constants';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';

const RecurringPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshTrigger, onRefresh } = useOutletContext() || {};

  const [recurringList, setRecurringList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRecurring = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, aRes, cRes] = await Promise.all([
        api.get('/recurring'),
        api.get('/accounts'),
        api.get('/categories')
      ]);
      setRecurringList(rRes.data.recurringTransactions || []);
      setAccounts(aRes.data.accounts || []);
      setCategories(cRes.data.categories || []);

      if (aRes.data.accounts?.length > 0 && !accountId) {
        setAccountId(aRes.data.accounts[0]._id);
      }
    } catch (err) {
      showToast('Error loading recurring schedules.', 'error');
    } finally {
      setLoading(false);
    }
  }, [accountId, showToast]);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring, refreshTrigger]);

  const openCreateModal = () => {
    setTitle('');
    setType('expense');
    setAmount('');
    setFrequency('monthly');
    setCategoryId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setMerchant('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0 || !accountId) {
      showToast('Please fill all required schedule fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/recurring', {
        title: title.trim(),
        type,
        amount: Number(amount),
        frequency,
        account: accountId,
        category: categoryId || null,
        startDate,
        merchant: merchant.trim()
      });

      showToast('Recurring schedule created successfully.', 'success');
      setModalOpen(false);
      fetchRecurring();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save recurring schedule.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async (id, title) => {
    try {
      const res = await api.post(`/recurring/${id}/process`);
      showToast(res.data.message || `Processed ${title}.`, 'success');
      fetchRecurring();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to process schedule.', 'error');
    }
  };

  const handleTogglePause = async (id) => {
    try {
      const res = await api.patch(`/recurring/${id}/pause`);
      showToast(res.data.message, 'info');
      fetchRecurring();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this recurring schedule?')) return;
    try {
      await api.delete(`/recurring/${id}`);
      showToast('Schedule cancelled.', 'success');
      fetchRecurring();
    } catch (err) {
      showToast('Failed to delete schedule.', 'error');
    }
  };

  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Recurring Payments & Subscriptions
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Automate monthly bills, salaries, rent, and subscriptions with leap-year-safe scheduling
          </span>
        </div>

        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <Plus size={16} /> New Recurring Schedule
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading recurring schedules..." />
      ) : recurringList.length === 0 ? (
        <EmptyState
          title="No recurring payments scheduled"
          description="Add your monthly salary, rent, electricity, Netflix, or loan EMI to track upcoming bills."
          actionLabel="Create Schedule"
          onAction={openCreateModal}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Frequency</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category & Account</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Next Due Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringList.map((rec) => (
                  <tr key={rec._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--deep-blue)' }}>{rec.title}</div>
                      {rec.merchant && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rec.merchant}</span>}
                    </td>
                    <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                      {rec.frequency}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
                        {rec.category?.name || 'Uncategorized'}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {rec.account?.name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {formatDate(rec.nextDueDate)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        className="badge"
                        style={{
                          background: rec.status === 'active' ? 'var(--mint-green)' : 'var(--warning-bg)',
                          color: rec.status === 'active' ? 'var(--success-green)' : 'var(--warning-text)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: rec.type === 'income' ? 'var(--success-green)' : 'var(--text-primary)' }}>
                      {rec.type === 'income' ? '+' : '-'} {formatCurrency(rec.amount, rec.currency || currency)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleProcess(rec._id, rec.title)}
                          disabled={rec.status !== 'active'}
                          title="Execute current occurrence"
                        >
                          Post Now
                        </button>
                        <button
                          onClick={() => handleTogglePause(rec._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                          title={rec.status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
                        >
                          {rec.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(rec._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-text)', padding: '4px' }}
                          title="Cancel Schedule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Recurring Schedule">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Rent, Monthly Salary, Netflix Subscription"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Type *</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Amount ({currency}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="100.00"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Frequency *</label>
              <select className="form-select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                {RECURRING_FREQUENCIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Account *</label>
              <select className="form-select" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                <option value="" disabled>Select account</option>
                {accounts.map(a => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Uncategorized</option>
                {categories.filter(c => c.type === type).map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Merchant / Company</label>
              <input
                type="text"
                placeholder="e.g. Landlord, Electric Corp"
                className="form-input"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Recurring Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecurringPage;
