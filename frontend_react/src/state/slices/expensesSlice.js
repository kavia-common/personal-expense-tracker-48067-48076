import { createSlice, nanoid, createSelector } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  filters: { query: '', min: undefined, max: undefined, date: '' },
};

const slice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare(expense) {
        return {
          payload: { id: nanoid(), ...expense },
        };
      },
    },
    addExpenseQuick: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare(expense) {
        return {
          payload: { id: nanoid(), ...expense },
        };
      },
    },
    deleteExpense(state, action) {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },
    filterChanged(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const { addExpense, addExpenseQuick, deleteExpense, filterChanged, resetFilters } = slice.actions;

export default slice.reducer;

// Selectors
const selectExpensesState = (s) => s.expenses;
export const selectExpenses = (s) => selectExpensesState(s).items;
export const selectFilters = (s) => selectExpensesState(s).filters;

export const selectFilteredExpenses = createSelector([selectExpenses, selectFilters], (items, f) => {
  return items.filter((e) => {
    if (f.query && !e.title.toLowerCase().includes(f.query.toLowerCase())) return false;
    if (typeof f.min === 'number' && e.amount < f.min) return false;
    if (typeof f.max === 'number' && e.amount > f.max) return false;
    if (f.date && e.date !== f.date) return false;
    return true;
  });
});

export const selectExpensesTotal = createSelector([selectFilteredExpenses], (items) =>
  items.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
);

export const selectExpensesCount = createSelector([selectFilteredExpenses], (items) => items.length);

export const selectExpensesByCategory = createSelector([selectExpenses], (items) => {
  return items.reduce((acc, e) => {
    acc[e.categoryId] = (acc[e.categoryId] || 0) + (Number(e.amount) || 0);
    return acc;
  }, {});
});

/**
 * Monthly totals selector:
 * Groups expenses by YYYY-MM and sums amount.
 */
export const selectMonthlyTotals = createSelector([selectExpenses], (items) => {
  const map = new Map();
  items.forEach((e) => {
    const d = new Date(e.date || Date.now());
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + (Number(e.amount) || 0));
  });
  // sort keys ascending
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([month, total]) => ({ month, total }));
});
