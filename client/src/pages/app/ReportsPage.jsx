import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reportType, setReportType] = useState('overview');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/summary?reportType=${reportType}&startDate=${startDate}&endDate=${endDate}`);
      setReportData(res.data);
    } catch (err) {
      showToast('Error generating financial report.', 'error');
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate, showToast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Print/Export Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Financial Reports & Statements
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Comprehensive statements, category breakdowns, and audit-ready summaries
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Printer size={16} /> Print Report
          </button>
          <a
            href={`/api/v1/import-export/export/transactions?startDate=${startDate}&endDate=${endDate}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
          >
            <Download size={16} /> Export Statement CSV
          </a>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--primary-blue)" />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--deep-blue)' }}>
            Report Period:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ fontSize: 'var(--font-size-xs)', width: '160px' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ fontSize: 'var(--font-size-xs)', width: '160px' }}
          />
          <button className="btn btn-primary btn-sm" onClick={fetchReport}>
            Generate
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Compiling financial statement..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive Summary Card */}
          <div className="card">
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
              Executive Cash Flow Summary ({formatDate(startDate)} — {formatDate(endDate)})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--mint-green)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--success-green)', fontWeight: 600 }}>RECOGNIZED INCOME</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--success-green)', marginTop: '4px' }}>
                  {formatCurrency(reportData?.summary?.totalIncome, currency)}
                </p>
              </div>

              <div style={{ padding: '16px', background: 'var(--soft-peach)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: '#c95116', fontWeight: 600 }}>RECOGNIZED EXPENSES</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#c95116', marginTop: '4px' }}>
                  {formatCurrency(reportData?.summary?.totalExpenses, currency)}
                </p>
              </div>

              <div style={{ padding: '16px', background: 'var(--soft-blue)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 600 }}>NET CASH FLOW</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--deep-blue)', marginTop: '4px' }}>
                  {formatCurrency(reportData?.summary?.netCashFlow, currency)}
                </p>
              </div>

              <div style={{ padding: '16px', background: 'var(--pale-lavender)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: '#6b46c1', fontWeight: 600 }}>SAVINGS RATE</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#6b46c1', marginTop: '4px' }}>
                  {reportData?.summary?.savingsRate || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Category Expenditure Breakdown Table */}
          <div className="card">
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
              Category Spending Breakdown
            </h3>

            {reportData?.categoryExpenses?.categories?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', padding: '16px 0' }}>
                No category expenses found for this time period.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Transactions</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Share of Total</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.categoryExpenses?.categories?.map((cat, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--deep-blue)' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: cat.color, marginRight: '8px' }} />
                        {cat.name}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {cat.transactionCount}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '100px', height: '6px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div style={{ width: `${cat.percentage}%`, height: '100%', background: cat.color }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.percentage}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--deep-blue)' }}>
                        {formatCurrency(cat.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
