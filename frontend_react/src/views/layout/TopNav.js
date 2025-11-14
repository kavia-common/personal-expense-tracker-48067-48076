import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addExpenseQuick, filterChanged, selectFilters } from '../../state/slices/expensesSlice';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Top navigation bar for quick actions and search.
 * Includes a theme toggle, quick add, and search input with a leading icon.
 * The search field is debounced (≈300ms) and writes to global expenses filter (query).
 * Pressing Enter navigates to /expenses to reveal results if the user is on another page.
 */
export default function TopNav() {
  const dispatch = useDispatch();
  const { experimentsEnabled } = useFeatureFlags();
  const navigate = useNavigate();
  const location = useLocation();
  const globalFilters = useSelector(selectFilters);

  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  // Initialize from global filter query so TopNav reflects store state (including persisted session)
  const [search, setSearch] = useState(globalFilters.query || '');

  // Keep input synced when global query changes elsewhere (e.g., Filters component)
  useEffect(() => {
    setSearch(globalFilters.query || '');
  }, [globalFilters.query]);

  // Apply theme attribute on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Debounced dispatcher to update Redux filter without spamming
  const timeoutRef = useRef(null);
  const debounceMs = 300;

  // PUBLIC_INTERFACE
  const dispatchQuery = useMemo(() => {
    /** Debounced query dispatcher for wiring external search inputs to expenses filter. */
    return (q) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dispatch(filterChanged({ query: q }));
      }, debounceMs);
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onChangeSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    dispatchQuery(val);
  };

  const onKeyDownSearch = (e) => {
    if (e.key === 'Enter') {
      // Force immediate sync (avoid waiting debounce) then navigate if needed
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      dispatch(filterChanged({ query: search }));
      if (location.pathname !== '/expenses') {
        navigate('/expenses');
      }
    }
  };

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
            onChange={onChangeSearch}
            onKeyDown={onKeyDownSearch}
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
