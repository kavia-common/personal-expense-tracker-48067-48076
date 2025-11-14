import React, { useState } from 'react';
import { useCategories, createCategoryAsync, deleteCategoryAsync, } from '../../../state/slices/categoriesSlice';
import { useDispatch } from 'react-redux';
import { updateCategoryAsync } from '../../../state/slices/categoriesSlice';

/**
 * Manage categories with persistence through apiClient/localRepo.
 */
export default function CategoryManager() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useCategories();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saveStatus, setSaveStatus] = useState({});

  const add = async (e) => {
    e.preventDefault();
    const trimmed = String(name).trim();
    if (!trimmed) return;
    await dispatch(createCategoryAsync({ name: trimmed }));
    setName('');
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (id) => {
    const trimmed = String(editName).trim();
    if (!trimmed) {
      alert('Name cannot be empty');
      return;
    }
    try {
      setSaveStatus((s) => ({ ...s, [id]: 'loading' }));
      await dispatch(updateCategoryAsync({ id, changes: { name: trimmed } })).unwrap();
      setSaveStatus((s) => ({ ...s, [id]: 'success' }));
      setTimeout(() => setSaveStatus((s) => ({ ...s, [id]: undefined })), 800);
      cancelEdit();
    } catch (e) {
      setSaveStatus((s) => ({ ...s, [id]: 'error' }));
      alert(e?.message || 'Failed to save category');
    }
  };

  return (
    <div>
      <form onSubmit={add} className="form-grid" aria-label="Add category form">
        <label>
          <span>Name</span>
          <input aria-label="Category name" className="search-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div style={{ alignSelf: 'end' }}>
          <button className="btn primary" type="submit" disabled={loading}>Add</button>
        </div>
      </form>

      <div style={{ height: 12 }} />

      {loading && <p className="muted" role="status">Loading…</p>}
      {!!error && <p className="muted" role="alert">Error: {error}</p>}

      <div role="list" aria-label="Category list">
        {categories.map((c) => (
          <div key={c.id} role="listitem" className="list-row">
            <div>
              {editingId === c.id ? (
                <label>
                  <span className="sr-only">Edit name for {c.name}</span>
                  <input
                    className="search-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label={`Edit category ${c.name}`}
                    required
                  />
                </label>
              ) : (
                c.name
              )}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {editingId === c.id ? (
                <>
                  <button
                    className="btn primary"
                    onClick={() => saveEdit(c.id)}
                    disabled={saveStatus[c.id] === 'loading'}
                    aria-label={`Save ${c.name}`}
                  >
                    {saveStatus[c.id] === 'loading' ? 'Saving…' : 'Save'}
                  </button>
                  <button className="btn" onClick={cancelEdit} aria-label={`Cancel editing ${c.name}`}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn" onClick={() => startEdit(c)} aria-label={`Edit ${c.name}`}>✏️</button>
                  <button className="btn" onClick={() => dispatch(deleteCategoryAsync(c.id))} aria-label={`Delete ${c.name}`}>
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && !loading && <p className="muted">No categories yet.</p>}
      </div>
    </div>
  );
}
