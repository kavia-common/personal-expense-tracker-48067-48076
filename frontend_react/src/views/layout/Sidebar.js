import React from 'react';
import NavLink from './NavLinkPatch';

/**
 * Sidebar provides primary navigation across app sections.
 * It is keyboard navigable and uses ARIA attributes for accessibility.
 */
export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="sidebar-header">
        <div className="brand-mark" aria-hidden="true">💧</div>
        <div className="brand-name">Ocean Expenses</div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard">
          <span aria-hidden="true">📊</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/expenses">
          <span aria-hidden="true">💸</span>
          <span>Expenses</span>
        </NavLink>
        <NavLink to="/categories">
          <span aria-hidden="true">🏷️</span>
          <span>Categories</span>
        </NavLink>
        <NavLink to="/reports">
          <span aria-hidden="true">📈</span>
          <span>Reports</span>
        </NavLink>
      </nav>
    </aside>
  );
}
