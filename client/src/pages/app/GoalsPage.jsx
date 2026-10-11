import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp
} from 'lucide-react';

const GoalsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshTrigger, onRefresh } = useOutletContext() || {};

  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Goal Creation/Edit Modal
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3978D4');

  // Contribution / Withdrawal Modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [actionType, setActionType] = useState('contribute'); // 'contribute' or 'withdraw'
  const [actionAmount, setActionAmount] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionAccountId, setActionAccountId] = useState('');
  const [syncWithAccount, setSyncWithAccount] = useState(false);

  // History Drawer Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyGoal, setHistoryGoal] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, aRes] = await Promise.all([
        api.get('/goals'),
        api.get('/accounts')
      ]);
      setGoals(gRes.data.goals || []);
      setAccounts(aRes.data.accounts || []);
    } catch (err) {
      showToast('Error loading savings goals.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals, refreshTrigger]);

  const openCreateGoal = () => {
    setGoalToEdit(null);
    setName('');
    setTargetAmount('');
    setTargetDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setPriority('medium');
    setDescription('');
    setColor('#3978D4');
    setGoalModalOpen(true);
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || Number(targetAmount) <= 0 || !targetDate) {
      showToast('Please fill all required goal fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        targetAmount: Number(targetAmount),
        targetDate,
        priority,
        description: description.trim(),
        color
      };

      if (goalToEdit) {
        await api.patch(`/goals/${goalToEdit._id}`, payload);
        showToast('Savings goal updated.', 'success');
      } else {
        await api.post('/goals', payload);
        showToast('Savings goal created!', 'success');
      }
      setGoalModalOpen(false);
      fetchGoals();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save savings goal.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openActionModal = (goal, type) => {
    setSelectedGoal(goal);
    setActionType(type);
    setActionAmount('');
    setActionNote('');
    setActionAccountId(accounts[0]?._id || '');
    setSyncWithAccount(false);
    setActionModalOpen(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionAmount || Number(actionAmount) <= 0) {
      showToast('Please enter a positive amount.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'contribute') {
        await api.post(`/goals/${selectedGoal._id}/contributions`, {
          amount: Number(actionAmount),
          note: actionNote.trim(),
          accountId: syncWithAccount ? actionAccountId : null,
          deductFromAccount: syncWithAccount
        });
        showToast('Contribution recorded successfully!', 'success');
      } else {
        await api.post(`/goals/${selectedGoal._id}/withdraw`, {
          amount: Number(actionAmount),
          note: actionNote.trim(),
          accountId: syncWithAccount ? actionAccountId : null,
          refundToAccount: syncWithAccount
        });
        showToast('Withdrawal recorded successfully!', 'success');
      }

      setActionModalOpen(false);
      fetchGoals();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      showToast('Savings goal deleted.', 'success');
      fetchGoals();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete goal.', 'error');
    }
  };

  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Savings Goals
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Set targets, build contribution funds, and track milestone percentages
          </span>
        </div>

        <button className="btn btn-primary btn-sm" onClick={openCreateGoal}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating goal progress..." />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No savings goals yet"
          description="Create a savings goal for a vacation, emergency fund, or major milestone."
          actionLabel="Create First Goal"
          onAction={openCreateGoal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {goals.map((g) => {
            const isDone = g.isCompleted;
            const pct = g.progressPercentage || 0;

            return (
              <div key={g._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--deep-blue)' }}>{g.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <Calendar size={13} /> Target: {formatDate(g.targetDate)}
                    </div>
                  </div>

                  <span
                    className="badge"
                    style={{
                      background: isDone ? 'var(--mint-green)' : 'var(--soft-blue)',
                      color: isDone ? 'var(--success-green)' : 'var(--primary-blue)'
                    }}
                  >
                    {isDone ? 'Completed' : `${pct}% Saved`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ height: '10px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, pct)}%`,
                        background: isDone ? 'var(--success-green)' : g.color || 'var(--primary-blue)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Amounts Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>SAVED SO FAR</span>
                    <p style={{ fontWeight: 700, color: 'var(--deep-blue)', marginTop: '2px' }}>
                      {formatCurrency(g.currentAmount, g.currency || currency)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>TARGET</span>
                    <p style={{ fontWeight: 700, color: 'var(--primary-blue)', marginTop: '2px' }}>
                      {formatCurrency(g.targetAmount, g.currency || currency)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Contribute / Withdraw / Ledger */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                    onClick={() => openActionModal(g, 'contribute')}
                  >
                    <ArrowUpRight size={14} /> Contribute
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                    onClick={() => openActionModal(g, 'withdraw')}
                    disabled={g.currentAmount <= 0}
                  >
                    <ArrowDownLeft size={14} /> Withdraw
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => {
                      setHistoryGoal(g);
                      setHistoryModalOpen(true);
                    }}
                    title="View Contribution History"
                  >
                    History
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '6px 10px' }}
                    onClick={() => handleDeleteGoal(g._id)}
                    title="Delete Goal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Add/Edit Modal */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
      >
        <form onSubmit={handleGoalSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund, Vacation in Italy"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Amount ({currency}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="5000.00"
                className="form-input"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Color Accent</label>
              <input
                type="color"
                className="form-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ height: '42px', padding: '4px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              rows="2"
              className="form-textarea"
              placeholder="Why are you saving for this?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : goalToEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribution / Withdrawal Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={actionType === 'contribute' ? `Add Contribution to ${selectedGoal?.name}` : `Withdraw from ${selectedGoal?.name}`}
      >
        <form onSubmit={handleActionSubmit}>
          <div className="form-group">
            <label className="form-label">Amount ({currency}) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="100.00"
              className="form-input"
              value={actionAmount}
              onChange={(e) => setActionAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Note</label>
            <input
              type="text"
              placeholder="e.g. Monthly transfer, bonus allocation"
              className="form-input"
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
            />
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={syncWithAccount}
                onChange={(e) => setSyncWithAccount(e.target.checked)}
              />
              {actionType === 'contribute'
                ? 'Deduct this amount from a bank account'
                : 'Deposit withdrawn amount back into an account'}
            </label>

            {syncWithAccount && (
              <div style={{ marginTop: '10px' }}>
                <label className="form-label" style={{ fontSize: '11px' }}>Linked Account</label>
                <select
                  className="form-select"
                  value={actionAccountId}
                  onChange={(e) => setActionAccountId(e.target.value)}
                >
                  {accounts.map(a => (
                    <option key={a._id} value={a._id}>{a.name} ({a.currentBalance} {a.currency})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setActionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Recording...' : actionType === 'contribute' ? 'Add Contribution' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribution History Ledger Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`${historyGoal?.name} — Contribution History`}
      >
        {historyGoal?.contributions?.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
            No contribution history recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
            {historyGoal?.contributions?.slice().reverse().map((entry, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  fontSize: 'var(--font-size-xs)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--deep-blue)' }}>{entry.note || 'Contribution'}</div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{formatDate(entry.date)}</span>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    color: entry.amount >= 0 ? 'var(--success-green)' : 'var(--error-text)',
                    fontSize: 'var(--font-size-sm)'
                  }}
                >
                  {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount, historyGoal.currency || currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GoalsPage;
