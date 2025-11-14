import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from './slices/expensesSlice';
import categoriesReducer from './slices/categoriesSlice';

/**
 * Application Redux store.
 */
export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    categories: categoriesReducer,
  },
});
