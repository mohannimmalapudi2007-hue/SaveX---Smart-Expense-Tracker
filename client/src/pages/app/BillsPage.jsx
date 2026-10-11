import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BellRing, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const BillsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshTrigger, onRefresh } = useOutletContext() || {};

  const [bills, setBills] = useState([]);
  const [totalUpcoming, setTotalUpcoming] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/recurring/upcoming');
      setBills(res.data.upcoming || []);
      setTotalUpcoming(res.data.totalUpcomingExpenses || 0);
    } catch (err) {
      showToast('Error loading upcoming bills.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills, refreshTrigger]);

  const handleProcess = async (id, title) => {
    try {
      await api.post(`/recurring/${id}/process`);
      showToast(`Recorded payment for ${title}.`, 'success');
      fetchBills();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to process bill.', 'error');
    }
  };

  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Bills & Reminders
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Total Due Next 30 Days: <strong>{formatCurrency(totalUpcoming, currency)}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Checking bill schedules..." />
      ) : bills.length === 0 ? (
        <EmptyState
          title="No bills due in the next 30 days"
          description="All your upcoming payments and subscriptions are either cleared or scheduled further out."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bills.map((bill) => {
            const dueDate = new Date(bill.nextDueDate);
            const now = new Date();
            const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            const isUrgent = diffDays <= 7;

            return (
              <div
                key={bill._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderLeft: `4px solid ${isUrgent ? 'var(--error-text)' : 'var(--primary-blue)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: isUrgent ? 'var(--error-bg)' : 'var(--soft-blue)',
                      color: isUrgent ? 'var(--error-text)' : 'var(--primary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isUrgent ? <AlertTriangle size={20} /> : <Calendar size={20} />}
                  </div>

                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>
                      {bill.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>Due: <strong>{formatDate(bill.nextDueDate)}</strong></span>
                      <span>•</span>
                      <span>{bill.frequency.toUpperCase()}</span>
                      <span>•</span>
                      <span>{bill.account?.name}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--deep-blue)' }}>
                      {formatCurrency(bill.amount, bill.currency || currency)}
                    </div>
                    <span style={{ fontSize: '10px', color: isUrgent ? 'var(--error-text)' : 'var(--text-muted)', fontWeight: isUrgent ? 600 : 400 }}>
                      {diffDays <= 0 ? 'Due Today' : `${diffDays} day(s) left`}
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleProcess(bill._id, bill.title)}
                  >
                    Post Payment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BillsPage;
