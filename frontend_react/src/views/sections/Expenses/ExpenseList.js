import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteExpense, selectFilteredExpenses, updateExpenseAsync } from '../../../state/slices/expensesSlice';
import { formatCurrency } from '../../../utils/formatters';
import { useCategories } from '../../../state/slices/categoriesSlice';

/**
 * Renders a list of expenses with inline edit capability and delete action.
 * Persists via apiClient/localRepo in offline mode.
 */
export default function ExpenseList() {
  const dispatch = useDispatch();
  const items = useSelector(selectFilteredExpenses);
  const { categories } = useCategories();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', date: '', categoryId: '' });
  const [saving, setSaving] = useState({});
  const [error, setError] = useState('');

  const catNameById = categories.reduce((m, c) => {
    m[c.id] = c.name;
    return m;
  }, {});

  const beginEdit = (e) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      amount: String(e.amount),
      date: e.date,
      categoryId: e.categoryId,
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', amount: '', date: '', categoryId: '' });
    setError('');
  };

  const saveEdit = async (id) => {
    const title = String(form.title || '').trim();
    const amount = Number(form.amount);
    if (!title) {
      setError('Title cannot be empty.');
      return;
    }
    if (Number.isNaN(amount) || amount < 0) {
      setError('Amount must be a non-negative number.');
      return;
    }
    try {
      setSaving((s) => ({ ...s, [id]: true }));
      await dispatch(updateExpenseAsync({ id, changes: { ...form, amount } })).unwrap();
      // success cue
      setSaving((s) => ({ ...s, [id]: 'success' }));
      setTimeout(() => setSaving((s) => ({ ...s, [id]: false })), 800);
      cancelEdit();
    } catch (e) {
      setSaving((s) => ({ ...s, [id]: false }));
      setError(e?.message || 'Failed to save changes.');
    }
  };

  if (!items.length) {
    return <p className="muted">No expenses yet. Add your first expense below.</p>;
  }

  return (
    <div role="table" aria-label="Expense list">
      <div role="rowgroup">
        <div role="row" className="list-row header">
          <div role="columnheader">Title</div>
          <div role="columnheader">Category</div>
          <div role="columnheader">Amount</div>
          <div role="columnheader">Date</div>
          <div role="columnheader" aria-label="Actions" />
        </div>
      </div>
      <div role="rowgroup">
        {items.map((e) => (
          <div role="row" className="list-row" key={e.id} aria-live="polite">
            {editingId === e.id ? (
              <>
                <div role="cell">
                  <label>
                    <span className="sr-only">Title</span>
                    <input
                      className="search-input"
                      value={form.title}
                      onChange={(ev) => setForm((f) => ({ ...f, title: ev.target.value }))}
                      aria-label="Edit title"
                      required
                    />
                  </label>
                </div>
                <div role="cell">
                  <label>
                    <span className="sr-only">Category</span>
                    <select
                      className="search-input"
                      value={form.categoryId}
                      onChange={(ev) => setForm((f) => ({ ...f, categoryId: ev.target.value }))}
                      aria-label="Edit category"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div role="cell">
                  <label>
                    <span className="sr-only">Amount</span>
                    <input
                      className="search-input"
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(ev) => setForm((f) => ({ ...f, amount: ev.target.value }))}
                      aria-label="Edit amount"
                      required
                      min="0"
                    />
                  </label>
                </div>
                <div role="cell">
                  <label>
                    <span className="sr-only">Date</span>
                    <input
                      className="search-input"
                      type="date"
                      value={form.date}
                      onChange={(ev) => setForm((f) => ({ ...f, date: ev.target.value }))}
                      aria-label="Edit date"
                    />
                  </label>
                </div>
                <div role="cell" style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    className="btn primary"
                    onClick={() => saveEdit(e.id)}
                    disabled={saving[e.id] === true}
                    aria-label={`Save ${e.title}`}
                  >
                    {saving[e.id] === true ? 'Saving…' : 'Save'}
                  </button>
                  <button className="btn" onClick={cancelEdit} aria-label={`Cancel editing ${e.title}`}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div role="cell">{e.title}</div>
                <div role="cell">{catNameById[e.categoryId] || e.categoryId}</div>
                <div role="cell">{formatCurrency(e.amount)}</div>
                <div role="cell">{e.date}</div>
                <div role="cell" style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn" onClick={() => beginEdit(e)} aria-label={`Edit ${e.title}`}>✏️</button>
                  <button className="btn" onClick={() => dispatch(deleteExpense(e.id))} aria-label={`Delete ${e.title}`}>
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {!!error && <p className="muted" role="alert" style={{ marginTop: 8 }}>Error: {error}</p>}
    </div>
  );
}
