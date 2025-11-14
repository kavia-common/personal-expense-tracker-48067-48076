import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addExpenseQuick } from '../../state/slices/expensesSlice';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

/**
 * Top navigation bar for quick actions and search.
 * Includes a theme toggle, quick add, and search input.
 */
export default function TopNav() {
  const dispatch = useDispatch();
  const { experimentsEnabled } = useFeatureFlags();

  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const onQuickAdd = () => {
    // Adds a placeholder expense for demonstration/testing via async thunk (persists to local)
    dispatch(
      addExpenseQuick({
        title: 'Coffee',
        amount: 3.5,
        categoryId: 'misc',
        date: new Date().toISOString().slice(0, 10),
      })
    );
  };

  return (
    <header className="topnav">
      <div className="search-wrap" role="search">
        <input
          aria-label="Search expenses"
          className="search-input"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="actions-wrap">
        <button className="btn primary" onClick={onQuickAdd} aria-label="Quick add expense">
          + Quick Add
        </button>
        <button
          className="btn ghost"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {experimentsEnabled && (
          <span className="badge exp" title="Experiments enabled">
            EXP
          </span>
        )}
      </div>
    </header>
  );
}
