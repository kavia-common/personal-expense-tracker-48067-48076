import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectExpenses } from '../../../state/slices/expensesSlice';
import { useCategories } from '../../../state/slices/categoriesSlice';
import { formatCurrency, formatDateISO } from '../../../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';

/**
 * RecentExpenses widget lists the most recent N expense items with quick actions.
 * Accessible markup via role="table" and labels. Uses Ocean Professional design tokens.
 */
export default function RecentExpenses({ limit = 5 }) {
  const navigate = useNavigate();
  const items = useSelector(selectExpenses);
  const { categories } = useCategories();

  // Build category id -> name map
  const catNameById = useMemo(() => {
    return (categories || []).reduce((m, c) => {
      m[c.id] = c.name;
      return m;
    }, {});
  }, [categories]);

  const recent = useMemo(() => {
    // Sort by date desc then fallback to creation-like order by id timestamp portion if exists
    const withParsed = (items || []).map((e) => {
      let t = 0;
      try {
        const d = new Date(e.date || Date.now());
        t = d.getTime();
      } catch {
        t = 0;
      }
      // attempt parse from id if prefixed with exp_<ts>_*
      const idTs = String(e.id || '').split('_')[1];
      const ts = parseInt(idTs, 36);
      return { ...e, _ts: Number.isFinite(t) ? t : 0, _ids: Number.isFinite(ts) ? ts : 0 };
    });
    withParsed.sort((a, b) => {
      if (b._ts !== a._ts) return b._ts - a._ts;
      return b._ids - a._ids;
    });
    return withParsed.slice(0, Math.max(1, limit));
  }, [items, limit]);

  const goAddExpense = () => {
    // Navigate to /expenses and attempt to scroll to the "Add Expense" section via hash
    // ExpensesPage renders an <h2> with text "Add Expense". We navigate to /expenses#add
    navigate('/expenses#add');
    // Scrolling is handled by browser. If not present, the page still navigates to /expenses.
  };

  return (
    <section className="section" aria-labelledby="recent-expenses-title">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h2 id="recent-expenses-title" className="section-title">Recent Expenses</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn" to="/expenses" aria-label="View all expenses">View all</Link>
          <button className="btn primary" onClick={goAddExpense} aria-label="Add a new expense quickly">
            + Add Expense
          </button>
        </div>
      </div>

      {(!items || items.length === 0) ? (
        <p className="muted" role="status">No expenses yet. Use “Add Expense” to create your first entry.</p>
      ) : (
        <div role="table" aria-label="Most recent expenses" style={{ marginTop: 10 }}>
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
            {recent.map((e) => (
              <div role="row" className="list-row" key={e.id}>
                <div role="cell">{e.title}</div>
                <div role="cell">{catNameById[e.categoryId] || e.categoryId}</div>
                <div role="cell">{formatCurrency(e.amount)}</div>
                <div role="cell">{formatDateISO(e.date)}</div>
                <div role="cell" style={{ textAlign: 'right' }}>
                  <Link className="btn" to="/expenses" aria-label={`View ${e.title} in expenses`}>Open</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
