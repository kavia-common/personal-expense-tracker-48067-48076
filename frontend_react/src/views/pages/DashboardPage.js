import React from 'react';
import Cards from '../sections/Dashboard/Cards';
import Charts from '../sections/Dashboard/Charts';

/**
 * Dashboard page combining summary cards and charts.
 */
export default function DashboardPage() {
  return (
    <div className="dashboard">
      <Cards />
      <div style={{ height: 14 }} />
      <Charts />
    </div>
  );
}
