import React from 'react';
import CategoryManager from '../sections/Categories/CategoryManager';

/**
 * Categories page for managing expense categories.
 */
export default function CategoriesPage() {
  return (
    <div className="categories">
      <div className="section">
        <h2 className="section-title">Manage Categories</h2>
        <CategoryManager />
      </div>
    </div>
  );
}
