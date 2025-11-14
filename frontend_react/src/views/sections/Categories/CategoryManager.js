import React, { useState } from 'react';
import { useCategories, addCategory, deleteCategory } from '../../../state/slices/categoriesSlice';
import { useDispatch } from 'react-redux';

/**
 * Manage categories in local state.
 */
export default function CategoryManager() {
  const dispatch = useDispatch();
  const { categories } = useCategories();
  const [name, setName] = useState('');

  const add = (e) => {
    e.preventDefault();
    if (!name) return;
    dispatch(addCategory({ name }));
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
          <button className="btn primary" type="submit">Add</button>
        </div>
      </form>

      <div style={{ height: 12 }} />

      <div role="list" aria-label="Category list">
        {categories.map((c) => (
          <div key={c.id} role="listitem" className="list-row">
            <div>{c.name}</div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn" onClick={() => dispatch(deleteCategory(c.id))} aria-label={`Delete ${c.name}`}>
                🗑️
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="muted">No categories yet.</p>}
      </div>
    </div>
  );
}
