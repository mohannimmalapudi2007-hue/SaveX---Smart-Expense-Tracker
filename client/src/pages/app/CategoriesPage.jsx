import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Tags, Plus, Edit2, Trash2 } from 'lucide-react';

const CategoriesPage = () => {
  const { showToast } = useToast();
  const { refreshTrigger, onRefresh } = useOutletContext() || {};

  const [activeTab, setActiveTab] = useState('expense');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3978D4');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/categories?type=${activeTab}`);
      setCategories(res.data.categories || []);
    } catch (err) {
      showToast('Error loading categories.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshTrigger]);

  const openCreateModal = () => {
    setCategoryToEdit(null);
    setName('');
    setColor('#3978D4');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setCategoryToEdit(cat);
    setName(cat.name);
    setColor(cat.color || '#3978D4');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (categoryToEdit) {
        await api.patch(`/categories/${categoryToEdit._id}`, { name: name.trim(), color });
        showToast('Category updated.', 'success');
      } else {
        await api.post('/categories', { name: name.trim(), type: activeTab, color });
        showToast('Category created.', 'success');
      }
      setModalOpen(false);
      fetchCategories();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete/archive this category?')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      showToast(res.data.message || 'Category deleted.', 'info');
      fetchCategories();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Could not delete category.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Financial Categories
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Organise income and expenses with system defaults and custom user tags
          </span>
        </div>

        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          className={activeTab === 'expense' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          onClick={() => setActiveTab('expense')}
        >
          Expense Categories
        </button>
        <button
          className={activeTab === 'income' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          onClick={() => setActiveTab('income')}
        >
          Income Categories
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingSpinner message="Loading categories..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderLeft: `4px solid ${cat.color || 'var(--primary-blue)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color || 'var(--primary-blue)' }} />
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--deep-blue)' }}>
                    {cat.name}
                  </h4>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {cat.isDefault ? 'Default Category' : 'Custom Category'}
                  </span>
                </div>
              </div>

              {!cat.isDefault && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(cat)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-text)', padding: '4px' }}
                    title="Delete / Archive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={categoryToEdit ? 'Edit Category' : `Create ${activeTab === 'expense' ? 'Expense' : 'Income'} Category`}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pet Care, Freelance Design"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Badge Color</label>
            <input
              type="color"
              className="form-input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ height: '42px', padding: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : categoryToEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
