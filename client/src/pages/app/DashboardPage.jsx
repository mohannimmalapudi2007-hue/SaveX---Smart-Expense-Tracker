import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import CashFlowChart from '../../components/charts/CashFlowChart';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Receipt,
  Repeat
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshTrigger, onRefresh } = useOutletContext() || {};

  const [timeframe, setTimeframe] = useState('this_month');
  const [summary, setSummary] = useState(null);
  const [cashFlow, setCashFlow] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, cfRes, catRes, txRes, insRes, billRes] = await Promise.all([
        api.get(`/analytics/summary?timeframe=${timeframe}`),
        api.get('/analytics/cash-flow?months=6'),
        api.get(`/analytics/categories?timeframe=${timeframe}&type=expense`),
        api.get('/transactions?limit=6&sortBy=date&sortOrder=desc'),
        api.get('/ai/insights'),
        api.get('/recurring/upcoming')
      ]);

      setSummary(sumRes.data.summary);
      setCashFlow(cfRes.data.cashFlow || []);
      setCategories(catRes.data.categories || []);
      setRecentTransactions(txRes.data.transactions || []);
      setInsights(insRes.data.insights || []);
      setUpcomingBills(billRes.data.upcoming || []);
    } catch (err) {
      showToast('Error loading financial dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  }, [timeframe, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  const handleProcessBill = async (billId) => {
    try {
      await api.post(`/recurring/${billId}/process`);
      showToast('Bill payment recorded successfully!', 'success');
      fetchDashboardData();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to process bill.', 'error');
    }
  };

  if (loading && !summary) {
    return <LoadingSpinner message="Calculating your financial overview..." />;
  }

  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Timeframe Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Financial Overview
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Consolidated totals for your active accounts and budgets
          </span>
        </div>

        {/* Timeframe Pills */}
        <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
          {[
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: timeframe === tab.id ? 'var(--primary-blue)' : 'transparent',
                color: timeframe === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: timeframe === tab.id ? 600 : 500,
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Available Balance"
          value={formatCurrency(summary?.totalAvailableBalance, currency)}
          subtitle="Net liquid cash & accounts"
          icon={<Wallet size={20} />}
          badgeColor="var(--soft-blue)"
          color="var(--primary-blue)"
        />
        <StatCard
          title="Recognized Income"
          value={formatCurrency(summary?.totalIncome, currency)}
          subtitle={`${timeframe.replace('_', ' ')} total`}
          icon={<TrendingUp size={20} />}
          badgeColor="var(--mint-green)"
          color="var(--success-green)"
        />
        <StatCard
          title="Recognized Expenses"
          value={formatCurrency(summary?.totalExpenses, currency)}
          subtitle="Net recognized spending"
          icon={<TrendingDown size={20} />}
          badgeColor="var(--soft-peach)"
          color="#c95116"
        />
        <StatCard
          title="Net Cash Flow"
          value={formatCurrency(summary?.netCashFlow, currency)}
          subtitle={`Savings rate: ${summary?.savingsRate || 0}%`}
          trend={summary?.netCashFlow >= 0 ? 'up' : 'down'}
          trendValue={summary?.netCashFlow >= 0 ? 'Positive' : 'Deficit'}
          icon={<PiggyBank size={20} />}
          badgeColor={summary?.netCashFlow >= 0 ? 'var(--mint-green)' : 'var(--error-bg)'}
          color={summary?.netCashFlow >= 0 ? 'var(--success-green)' : 'var(--error-text)'}
        />
      </div>

      {/* Financial Insights Banner */}
      {insights.length > 0 && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--pale-lavender)',
                color: '#6b46c1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--deep-blue)' }}>
                {insights[0].title}
              </span>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {insights[0].message}
              </p>
            </div>
          </div>
          <Link to="/app/insights" className="btn btn-secondary btn-sm">
            View All Insights <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Charts Grid: Cash Flow Trend & Category Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cash Flow 6-Month Trend */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>
              Cash Flow Trend (Last 6 Months)
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Income vs Expenses</span>
          </div>
          <CashFlowChart data={cashFlow} currency={currency} />
        </div>

        {/* Category Expense Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>
              Expense Breakdown by Category
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Total: {formatCurrency(summary?.totalExpenses, currency)}
            </span>
          </div>
          <CategoryPieChart data={categories} currency={currency} />
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Upcoming Bills */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Transactions (Spans 2 columns) */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>
              Recent Transactions
            </h3>
            <Link to="/app/transactions" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary-blue)', fontWeight: 500 }}>
              View all transactions →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add your first expense or income to populate your activity feed."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentTransactions.map((tx) => (
                <div
                  key={tx._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        background: tx.type === 'income' ? 'var(--mint-green)' : tx.type === 'transfer' ? 'var(--soft-blue)' : 'var(--soft-peach)',
                        color: tx.type === 'income' ? 'var(--success-green)' : tx.type === 'transfer' ? 'var(--primary-blue)' : '#c95116',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Receipt size={18} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--deep-blue)' }}>
                        {tx.description}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.account?.name || 'Account'}</span>
                        {tx.category && (
                          <>
                            <span>•</span>
                            <span style={{ color: tx.category.color }}>{tx.category.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 'var(--font-size-sm)',
                        color: tx.type === 'income' ? 'var(--success-green)' : tx.type === 'transfer' ? 'var(--primary-blue)' : 'var(--text-primary)'
                      }}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''} {formatCurrency(tx.amount, tx.currency || currency)}
                    </span>
                    <div style={{ marginTop: '2px' }}>
                      <span className={`badge badge-${tx.type}`}>
                        {tx.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bills Widget (Spans 1 column) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>
              Upcoming Bills
            </h3>
            <Link to="/app/recurring" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary-blue)', fontWeight: 500 }}>
              Manage →
            </Link>
          </div>

          {upcomingBills.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
              No bills due within the next 30 days.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingBills.slice(0, 4).map((bill) => (
                <div
                  key={bill._id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--deep-blue)' }}>
                      {bill.title}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: '#c95116' }}>
                      {formatCurrency(bill.amount, bill.currency || currency)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Due {formatDate(bill.nextDueDate)}
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 8px', fontSize: '10px' }}
                      onClick={() => handleProcessBill(bill._id)}
                    >
                      Post Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
