import React from 'react';
import Filters from '../sections/Expenses/Filters';
import ExpenseList from '../sections/Expenses/ExpenseList';
import ExpenseForm from '../sections/Expenses/ExpenseForm';

/**
 * Expenses page includes filters, list of expenses, and a form to add new expenses.
 */
export default function ExpensesPage() {
  // If navigated with #add, attempt to scroll the "Add Expense" section into view
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'add') {
        const el = document.getElementById('add-expense-section') || document.getElementById('add-expense');
        if (el && el.scrollIntoView) {
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
      }
    }
  }, []);
  return (
    <div className="expenses">
      <div className="section">
        <h2 className="section-title">Filters</h2>
        <Filters />
      </div>
      <div style={{ height: 14 }} />
      <div className="section">
        <h2 className="section-title">Expenses</h2>
        <ExpenseList />
      </div>
      <div style={{ height: 14 }} />
      <div className="section" id="add-expense-section">
        <h2 className="section-title" id="add-expense">Add Expense</h2>
        <ExpenseForm />
      </div>
    </div>
  );
}
