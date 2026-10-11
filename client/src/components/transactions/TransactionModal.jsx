import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const TransactionModal = ({ isOpen, onClose, transactionToEdit, onSuccess }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [accRes, catRes] = await Promise.all([
            api.get('/accounts'),
            api.get('/categories')
          ]);
          setAccounts(accRes.data.accounts || []);
          setCategories(catRes.data.categories || []);

          if (!transactionToEdit && accRes.data.accounts?.length > 0) {
            setAccountId(accRes.data.accounts[0]._id);
          }
        } catch (err) {
          showToast('Failed to load accounts and categories.', 'error');
        }
      };
      fetchData();
    }
  }, [isOpen, transactionToEdit, showToast]);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setAccountId(transactionToEdit.account?._id || transactionToEdit.account || '');
      setDestinationAccountId(transactionToEdit.destinationAccount?._id || transactionToEdit.destinationAccount || '');
      setCategoryId(transactionToEdit.category?._id || transactionToEdit.category || '');
      setDate(transactionToEdit.date ? new Date(transactionToEdit.date).toISOString().split('T')[0] : '');
      setPaymentMethod(transactionToEdit.paymentMethod || 'bank_transfer');
      setMerchant(transactionToEdit.merchant || '');
      setNotes(transactionToEdit.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setDestinationAccountId('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('bank_transfer');
      setMerchant('');
      setNotes('');
    }
  }, [transactionToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      showToast('Please enter a valid positive amount.', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Please provide a description.', 'error');
      return;
    }
    if (!accountId) {
      showToast('Please select an account.', 'error');
      return;
    }
    if (type === 'transfer' && (!destinationAccountId || destinationAccountId === accountId)) {
      showToast('Please select a different destination account.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        amount: Number(amount),
        description: description.trim(),
        account: accountId,
        destinationAccount: type === 'transfer' ? destinationAccountId : null,
        category: type === 'transfer' ? null : categoryId || null,
        date,
        paymentMethod,
        merchant: merchant.trim(),
        notes: notes.trim()
      };

      if (transactionToEdit) {
        await api.patch(`/transactions/${transactionToEdit._id}`, payload);
        showToast('Transaction updated successfully.', 'success');
      } else {
        await api.post('/transactions', payload);
        showToast('Transaction recorded successfully.', 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error saving transaction.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit}>
        {/* Transaction Type Segmented Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
          {['expense', 'income', 'transfer', 'refund'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              style={{
                padding: '8px 4px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: type === t ? 'var(--primary-blue)' : '#FFFFFF',
                color: type === t ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: type === t ? 600 : 500,
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount & Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Amount ({user?.preferredCurrency || 'USD'}) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date *</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description *</label>
          <input
            type="text"
            placeholder="e.g. Weekly Groceries, Client Retainer..."
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Account Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: type === 'transfer' ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{type === 'transfer' ? 'Source Account *' : 'Account *'}</label>
            <select
              className="form-select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            >
              <option value="" disabled>Select account</option>
              {accounts.map(acc => (
                <option key={acc._id} value={acc._id}>
                  {acc.name} ({acc.currency} {acc.currentBalance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {type === 'transfer' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Destination Account *</label>
              <select
                className="form-select"
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                required
              >
                <option value="" disabled>Select destination</option>
                {accounts.filter(a => a._id !== accountId).map(acc => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name} ({acc.currency} {acc.currentBalance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Category (if not transfer) */}
        {type !== 'transfer' && (
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category (optional)</option>
              {filteredCategories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Merchant & Payment Method */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Merchant / Payee</label>
            <input
              type="text"
              placeholder="e.g. Amazon, Starbucks, Employer"
              className="form-input"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI / Instant Pay</option>
              <option value="digital_wallet">Digital Wallet</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <textarea
            rows="2"
            placeholder="Add any extra details or reference numbers..."
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
