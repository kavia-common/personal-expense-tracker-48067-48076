import React from 'react';
import { useSelector } from 'react-redux';
import { selectExpensesTotal, selectExpensesCount } from '../../../state/slices/expensesSlice';
import { useCategories } from '../../../state/slices/categoriesSlice';
import { formatCurrency } from '../../../utils/formatters';

/**
 * KPI cards for dashboard
 */
export default function Cards() {
  const total = useSelector(selectExpensesTotal);
  const count = useSelector(selectExpensesCount);
  const { categories } = useCategories();

  return (
    <div className="card-grid">
      <div className="card">
        <div className="muted">Total Spent</div>
        <div className="value">{formatCurrency(total)}</div>
      </div>
      <div className="card">
        <div className="muted">Transactions</div>
        <div className="value">{count}</div>
      </div>
      <div className="card">
        <div className="muted">Categories</div>
        <div className="value">{categories.length}</div>
      </div>
      <div className="card">
        <div className="muted">Monthly Budget</div>
        <div className="value">{formatCurrency(2000)}</div>
      </div>
    </div>
  );
}
