import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addExpenseQuick } from '../../state/slices/expensesSlice';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

/**
 * Top navigation bar for quick actions and search.
 * Includes a theme toggle, quick add, and search input with a leading icon.
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
        {/* Visually hidden label for accessibility */}
        <label className="sr-only" htmlFor="topnav-search">Search expenses</label>
        <div className="search-input-with-icon">
          {/* Inline SVG icon, aria-hidden to avoid double announcement */}
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M10.5 3a7.5 7.5 0 0 1 5.966 12.148l4.193 4.193a1 1 0 0 1-1.414 1.414l-4.193-4.193A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"
              fill="currentColor"
            />
          </svg>
          <input
            id="topnav-search"
            aria-label="Search expenses"
            className="search-input"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
