import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addExpense } from '../../../state/slices/expensesSlice';
import { useCategories } from '../../../state/slices/categoriesSlice';

/**
 * Form to add an expense to local state. Will later integrate with API.
 */
export default function ExpenseForm() {
  const dispatch = useDispatch();
  const { categories } = useCategories();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'misc');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    dispatch(
      addExpense({
        title,
        amount: Number(amount),
        categoryId,
        date,
      })
    );
    setTitle('');
    setAmount('');
  };

  return (
    <form onSubmit={submit} className="form-grid" aria-label="Add expense form">
      <label>
        <span>Title</span>
        <input className="search-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        <span>Amount</span>
        <input className="search-input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </label>
      <label>
        <span>Category</span>
        <select className="search-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Date</span>
        <input className="search-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <div style={{ alignSelf: 'end' }}>
        <button className="btn primary" type="submit">Add</button>
      </div>
    </form>
  );
}
