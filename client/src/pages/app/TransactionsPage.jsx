import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import TransactionModal from '../../components/transactions/TransactionModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Search,
  Filter,
  Plus,
  Download,
  Copy,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

const TransactionsPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshTrigger, onRefresh } = useOutletContext() || {};

  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState('');
  const [account, setAccount] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Metadata for filter dropdowns
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [accRes, catRes] = await Promise.all([
          api.get('/accounts?includeArchived=true'),
          api.get('/categories')
        ]);
        setAccounts(accRes.data.accounts || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        // Soft fail
      }
    };
    fetchMetadata();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 15,
        sortBy,
        sortOrder
      });

      if (search.trim()) params.append('search', search.trim());
      if (type) params.append('type', type);
      if (account) params.append('account', account);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data.transactions || []);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      showToast('Error loading transactions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, type, account, category, startDate, endDate, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction? Account balances will be reverted.')) {
      return;
    }
    try {
      await api.delete(`/transactions/${id}`);
      showToast('Transaction deleted successfully.', 'success');
      fetchTransactions();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete transaction.', 'error');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/transactions/${id}/duplicate`);
      showToast('Transaction duplicated.', 'success');
      fetchTransactions();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate transaction.', 'error');
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (account) params.append('account', account);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    window.open(`/api/v1/import-export/export/transactions?${params.toString()}`, '_blank');
  };

  const resetFilters = () => {
    setSearch('');
    setType('');
    setAccount('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Transactions ({totalCount})
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            View, search, filter, and manage your complete financial history
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportCsv}>
            <Download size={16} /> Export CSV
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setTransactionToEdit(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> New Transaction
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'center' }}>
          {/* Search Field */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search description, merchant..."
              className="form-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '32px', fontSize: 'var(--font-size-xs)' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          {/* Type Filter */}
          <select
            className="form-select"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
            <option value="refund">Refund</option>
          </select>

          {/* Account Filter */}
          <select
            className="form-select"
            value={account}
            onChange={(e) => {
              setAccount(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            className="form-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Start Date */}
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: 'var(--font-size-xs)' }}
            placeholder="From Date"
          />

          {/* End Date */}
          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: 'var(--font-size-xs)' }}
            placeholder="To Date"
          />

          {/* Reset Filters */}
          <button className="btn btn-outline btn-sm" onClick={resetFilters} title="Reset all filters">
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Filtering transactions..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Try modifying your search filters or add a new transaction."
            actionLabel="Add Transaction"
            onAction={() => {
              setTransactionToEdit(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Account</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background var(--transition-fast)'
                    }}
                  >
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(tx.date)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--deep-blue)' }}>{tx.description}</div>
                      {tx.merchant && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.merchant}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {tx.category ? (
                        <span style={{ color: tx.category.color, fontWeight: 500 }}>
                          {tx.category.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {tx.type === 'transfer' ? (
                        <span>{tx.account?.name} → {tx.destinationAccount?.name}</span>
                      ) : (
                        tx.account?.name || 'Account'
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${tx.type}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: tx.type === 'income' ? 'var(--success-green)' : tx.type === 'transfer' ? 'var(--primary-blue)' : 'var(--text-primary)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''} {formatCurrency(tx.amount, tx.currency || currency)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleDuplicate(tx._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                          title="Duplicate transaction"
                          aria-label="Duplicate transaction"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setTransactionToEdit(tx);
                            setModalOpen(true);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-blue)', padding: '4px' }}
                          title="Edit transaction"
                          aria-label="Edit transaction"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-text)', padding: '4px' }}
                          title="Delete transaction"
                          aria-label="Delete transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-main)'
            }}
          >
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              Showing Page {currentPage} of {totalPages} ({totalCount} total entries)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Edit/Add Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        transactionToEdit={transactionToEdit}
        onSuccess={() => {
          fetchTransactions();
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default TransactionsPage;
