import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { filterChanged } from '../../../state/slices/expensesSlice';
import { useFeatureFlags } from '../../../hooks/useFeatureFlags';

/**
 * Filters for expenses, including optional experimental filter input.
 */
export default function Filters() {
  const dispatch = useDispatch();
  const { experimentsEnabled } = useFeatureFlags();
  const [query, setQuery] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [date, setDate] = useState('');

  const apply = () => {
    dispatch(filterChanged({ query, min: Number(min) || undefined, max: Number(max) || undefined, date }));
  };

  return (
    <div className="filters">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 10 }}>
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" className="search-input" placeholder="Search title..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="sr-only" htmlFor="min">Min</label>
        <input id="min" className="search-input" type="number" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
        <label className="sr-only" htmlFor="max">Max</label>
        <input id="max" className="search-input" type="number" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
        <label className="sr-only" htmlFor="date">Date</label>
        <input id="date" className="search-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn primary" onClick={apply} aria-label="Apply filters">Apply</button>
      </div>
      {experimentsEnabled && (
        <div style={{ marginTop: 10 }}>
          <small className="muted">Experimental: Additional filter logic is enabled.</small>
        </div>
      )}
    </div>
  );
}
