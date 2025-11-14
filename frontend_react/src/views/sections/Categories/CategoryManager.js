import React, { useState } from 'react';
import { useCategories, createCategoryAsync, deleteCategoryAsync } from '../../../state/slices/categoriesSlice';
import { useDispatch } from 'react-redux';

/**
 * Manage categories with persistence through apiClient/localRepo.
 */
export default function CategoryManager() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useCategories();
  const [name, setName] = useState('');

  const add = (e) => {
    e.preventDefault();
    if (!name) return;
    dispatch(createCategoryAsync({ name }));
    setName('');
  };

  return (
    <div>
      <form onSubmit={add} className="form-grid" aria-label="Add category form">
        <label>
          <span>Name</span>
          <input className="search-input" value={name} onChange={(e) => setName(e.target.value)} required />
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
            <div>{c.name}</div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn" onClick={() => dispatch(deleteCategoryAsync(c.id))} aria-label={`Delete ${c.name}`}>
                🗑️
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && !loading && <p className="muted">No categories yet.</p>}
      </div>
    </div>
  );
}
