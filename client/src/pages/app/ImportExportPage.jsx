import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  FileCheck
} from 'lucide-react';

const ImportExportPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [file, setFile] = useState(null);

  const [previewData, setPreviewData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/accounts');
        setAccounts(res.data.accounts || []);
        if (res.data.accounts?.length > 0) {
          setSelectedAccountId(res.data.accounts[0]._id);
        }
      } catch (err) {
        showToast('Error loading accounts for import.', 'error');
      }
    };
    fetchAccounts();
  }, [showToast]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      showToast('Please select a .csv file.', 'error');
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setImportSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post('/import-export/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPreviewData(res.data);
      showToast('CSV uploaded and validated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to parse CSV.', 'error');
      setFile(null);
      setPreviewData(null);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !selectedAccountId) return;

    setImporting(true);
    try {
      const res = await api.post('/import-export/import/confirm', {
        transactions: previewData.preview,
        accountId: selectedAccountId
      });

      setImportSuccessMessage(res.data.message);
      showToast(res.data.message, 'success');
      setPreviewData(null);
      setFile(null);
    } catch (err) {
      showToast(err.message || 'Import failed.', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
          Import & Export Financial Records
        </h2>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          Migrate transactions safely with duplicate detection and formula-injection defense
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* CSV Import Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'var(--soft-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>Import Bank CSV</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Preview, map columns, and verify duplicates</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Account for Imported Transactions *</label>
            <select
              className="form-select"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              {accounts.map(a => (
                <option key={a._id} value={a._id}>{a.name} ({a.currentBalance} {a.currency})</option>
              ))}
            </select>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '36px 20px',
              textAlign: 'center',
              background: 'var(--bg-main)',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('csvFileInput').click()}
          >
            <input
              id="csvFileInput"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <FileSpreadsheet size={36} color="var(--primary-blue)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--deep-blue)', marginBottom: '4px' }}>
              {file ? file.name : 'Choose a CSV file or drag it here'}
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Supports headers: Date, Description, Amount, Category, Type, Notes
            </span>
          </div>

          {importSuccessMessage && (
            <div style={{ padding: '12px', background: 'var(--mint-green)', color: 'var(--success-green)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} /> {importSuccessMessage}
            </div>
          )}
        </div>

        {/* CSV Export Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'var(--mint-green)', color: 'var(--success-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>Export Financial Records</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Spreadsheet formula-injection protected CSV</span>
              </div>
            </div>

            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Download your complete transaction records for tax filing, Excel financial models, or local backup. Our export sanitizes leading symbols (`=`, `+`, `-`, `@`) to prevent spreadsheet calculation injection.
            </p>
          </div>

          <a
            href="/api/v1/import-export/export/transactions"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={16} /> Download Full Transactions CSV
          </a>
        </div>
      </div>

      {/* CSV Preview & Confirmation Table */}
      {previewData && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>
                Import Preview ({previewData.totalRows} rows detected)
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Headers: {previewData.headers?.join(', ')}
              </span>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleConfirmImport}
              disabled={importing}
            >
              <FileCheck size={16} /> {importing ? 'Importing...' : 'Confirm & Commit Import'}
            </button>
          </div>

          {previewData.duplicateCount > 0 && (
            <div style={{ padding: '10px 14px', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={16} />
              <span>
                <strong>Warning:</strong> {previewData.duplicateCount} candidate duplicate(s) detected matching existing amounts and descriptions.
              </span>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {previewData.headers?.map((h, idx) => (
                    <th key={idx} style={{ padding: '8px 12px', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.preview?.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {previewData.headers?.map((h, cIdx) => (
                      <td key={cIdx} style={{ padding: '8px 12px' }}>{row[h] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportPage;
