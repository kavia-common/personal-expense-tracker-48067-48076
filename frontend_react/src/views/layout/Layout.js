import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './layout.css';

/**
 * Layout component providing the app shell with sidebar and top navigation.
 * Wraps all pages and ensures consistent styling and responsive behavior.
 */
export default function Layout({ children }) {
  return (
    <div className="app-shell" data-testid="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopNav />
        <main className="app-content" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
