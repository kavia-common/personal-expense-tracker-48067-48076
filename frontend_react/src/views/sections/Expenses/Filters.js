import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filterChanged, resetFilters, selectFilters } from '../../../state/slices/expensesSlice';
import { useFeatureFlags } from '../../../hooks/useFeatureFlags';

/**
 * Filters for expenses, including optional experimental filter input.
 * Synchronizes with the global filter state so TopNav search and this UI stay in sync.
 */
export default function Filters() {
  const dispatch = useDispatch();
  const { experimentsEnabled } = useFeatureFlags();
  const globalFilters = useSelector(selectFilters);

  const [query, setQuery] = useState(globalFilters.query || '');
  const [min, setMin] = useState(globalFilters.min ?? '');
  const [max, setMax] = useState(globalFilters.max ?? '');
  const [date, setDate] = useState(globalFilters.date || '');

  // Keep local fields in sync when global filters change externally (e.g., TopNav)
  useEffect(() => {
    setQuery(globalFilters.query || '');
    setMin(globalFilters.min ?? '');
    setMax(globalFilters.max ?? '');
    setDate(globalFilters.date || '');
  }, [globalFilters.query, globalFilters.min, globalFilters.max, globalFilters.date]);

  const apply = () => {
    dispatch(
      filterChanged({
        query,
        min: min === '' ? undefined : Number(min),
        max: max === '' ? undefined : Number(max),
        date,
      })
    );
  };

  const clearAll = () => {
    setQuery('');
    setMin('');
    setMax('');
    setDate('');
    dispatch(resetFilters());
  };

  return (
    <div className="filters">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto auto', gap: 10 }}>
        <label className="sr-only" htmlFor="q">Search</label>
        <input
          id="q"
          className="search-input"
          placeholder="Search title or note..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="sr-only" htmlFor="min">Min</label>
        <input
          id="min"
          className="search-input"
          type="number"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <label className="sr-only" htmlFor="max">Max</label>
        <input
          id="max"
          className="search-input"
          type="number"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
        <label className="sr-only" htmlFor="date">Date</label>
        <input
          id="date"
          className="search-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="btn primary" onClick={apply} aria-label="Apply filters">Apply</button>
        <button className="btn" onClick={clearAll} aria-label="Clear filters">Clear</button>
      </div>
      {experimentsEnabled && (
        <div style={{ marginTop: 10 }}>
          <small className="muted">Experimental: Additional filter logic is enabled.</small>
        </div>
      )}
    </div>
  );
}
