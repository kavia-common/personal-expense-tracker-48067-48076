import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteExpense, selectFilteredExpenses } from '../../../state/slices/expensesSlice';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Renders a list of expenses from the store with delete action.
 * Persists via apiClient/localRepo in offline mode.
 */
export default function ExpenseList() {
  const dispatch = useDispatch();
  const items = useSelector(selectFilteredExpenses);

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
          <div role="row" className="list-row" key={e.id}>
            <div role="cell">{e.title}</div>
            <div role="cell">{e.categoryId}</div>
            <div role="cell">{formatCurrency(e.amount)}</div>
            <div role="cell">{e.date}</div>
            <div role="cell" style={{ textAlign: 'right' }}>
              <button className="btn" onClick={() => dispatch(deleteExpense(e.id))} aria-label={`Delete ${e.title}`}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
