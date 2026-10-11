import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';

const BudgetsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshTrigger, onRefresh } = useOutletContext() || {};

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/categories?type=expense')
      ]);
      setBudgets(bRes.data.budgets || []);
      setCategories(cRes.data.categories || []);
    } catch (err) {
      showToast('Error loading budgets.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets, refreshTrigger]);

  const openCreateModal = () => {
    setBudgetToEdit(null);
    setName('');
    setPeriod('monthly');
    setCategoryId('');
    setLimit('');
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setBudgetToEdit(b);
    setName(b.name);
    setPeriod(b.period);
    setCategoryId(b.category?._id || '');
    setLimit(b.limit.toString());
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !limit || Number(limit) <= 0) {
      showToast('Please provide a budget name and positive limit.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        period,
        category: categoryId || null,
        limit: Number(limit)
      };

      if (budgetToEdit) {
        await api.patch(`/budgets/${budgetToEdit._id}`, payload);
        showToast('Budget updated successfully.', 'success');
      } else {
        await api.post('/budgets', payload);
        showToast('Budget created successfully.', 'success');
      }
      setModalOpen(false);
      fetchBudgets();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save budget.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      showToast('Budget deleted.', 'success');
      fetchBudgets();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete budget.', 'error');
    }
  };

  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Budgets & Spending Limits
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Monitor spending limits, utilisation percentages, and real-time threshold warnings
          </span>
        </div>

        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <Plus size={16} /> Create Budget
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating budget utilisation..." />
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No budgets created yet"
          description="Create your first monthly or category budget to keep spending in check."
          actionLabel="Create Budget"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {budgets.map((b) => {
            const isOver = b.isOverBudget;
            const util = b.utilization || 0;
            const barColor = isOver
              ? 'var(--error-text)'
              : util >= 90
              ? '#D97706'
              : util >= 75
              ? '#F59E0B'
              : 'var(--success-green)';

            return (
              <div key={b._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--deep-blue)' }}>{b.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{b.period.toUpperCase()}</span>
                      {b.category && (
                        <>
                          <span>•</span>
                          <span style={{ color: b.category.color, fontWeight: 500 }}>{b.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className="badge"
                    style={{
                      background: isOver ? 'var(--error-bg)' : util >= 90 ? 'var(--warning-bg)' : 'var(--mint-green)',
                      color: isOver ? 'var(--error-text)' : util >= 90 ? 'var(--warning-text)' : 'var(--success-green)'
                    }}
                  >
                    {isOver ? 'Over Limit' : `${util}% Used`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, util)}%`,
                        background: barColor,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Figures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>SPENT</span>
                    <p style={{ fontWeight: 700, color: 'var(--deep-blue)', marginTop: '2px' }}>
                      {formatCurrency(b.spent, b.currency || currency)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>REMAINING</span>
                    <p style={{ fontWeight: 700, color: isOver ? 'var(--error-text)' : 'var(--success-green)', marginTop: '2px' }}>
                      {formatCurrency(b.remaining, b.currency || currency)}
                    </p>
                  </div>
                </div>

                {/* Limit Info & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '12px',
                    fontSize: 'var(--font-size-xs)'
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Spending Limit: <strong>{formatCurrency(b.limit, b.currency || currency)}</strong>
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      onClick={() => openEditModal(b)}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      onClick={() => handleDelete(b._id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={budgetToEdit ? 'Edit Budget' : 'Create Budget'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Budget Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dining Out, Overall Monthly Spending"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Period *</label>
              <select
                className="form-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Spending Limit ({currency}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="1000.00"
                className="form-input"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category (Leave empty for Overall Budget)</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories (Overall Spending)</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : budgetToEdit ? 'Save Changes' : 'Create Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetsPage;
