import React from 'react';
import Cards from '../sections/Dashboard/Cards';
import Charts from '../sections/Dashboard/Charts';
import RecentExpenses from '../sections/Dashboard/RecentExpenses';

/**
 * Dashboard page combining summary cards, recent expenses, and charts.
 */
export default function DashboardPage() {
  return (
    <div className="dashboard" style={{ display: 'grid', gap: 14 }}>
      <Cards />
      <RecentExpenses limit={6} />
      <Charts />
    </div>
  );
}
