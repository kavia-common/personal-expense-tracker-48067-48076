import React from 'react';
import Filters from '../sections/Expenses/Filters';
import ExpenseList from '../sections/Expenses/ExpenseList';
import ExpenseForm from '../sections/Expenses/ExpenseForm';

/**
 * Expenses page includes filters, list of expenses, and a form to add new expenses.
 */
export default function ExpensesPage() {
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
      <div className="section">
        <h2 className="section-title">Add Expense</h2>
        <ExpenseForm />
      </div>
    </div>
  );
}
