import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../views/pages/DashboardPage';
import ExpensesPage from '../views/pages/ExpensesPage';
import CategoriesPage from '../views/pages/CategoriesPage';
import ReportsPage from '../views/pages/ReportsPage';
import Layout from '../views/layout/Layout';

// PUBLIC_INTERFACE
export default function AppRoutes() {
  /** Router for the application. Defines main routes and wraps with the app Layout. */
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
