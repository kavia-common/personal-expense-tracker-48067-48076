import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { apiClient } from '../../services/apiClient';

// Thunks for expenses (localRepo in offline mode)

// PUBLIC_INTERFACE
export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async () => {
  /** Loads expenses from apiClient. */
  const data = await apiClient.get('/expenses');
  return Array.isArray(data) ? data : [];
});

// PUBLIC_INTERFACE
export const addExpense = createAsyncThunk('expenses/create', async (expense) => {
  /** Creates a new expense via apiClient and returns created entity. */
  const created = await apiClient.post('/expenses', expense);
  return created;
});

// PUBLIC_INTERFACE
export const addExpenseQuick = createAsyncThunk('expenses/createQuick', async (expense) => {
  /** Creates a new expense via apiClient (quick action). */
  const created = await apiClient.post('/expenses', expense);
  return created;
});

/** PUBLIC_INTERFACE */
export const deleteExpense = createAsyncThunk('expenses/delete', async (id) => {
  /** Deletes an expense by id via apiClient and returns deleted id. */
  await apiClient.delete(`/expenses/${id}`);
  return id;
});

/** PUBLIC_INTERFACE */
export const updateExpenseAsync = createAsyncThunk('expenses/update', async ({ id, changes }) => {
  /** Updates an expense via apiClient and returns updated entity. */
  const updated = await apiClient.put(`/expenses/${id}`, changes);
  return updated;
});

// Load persisted query from storage (optional persistence)
function loadPersistedQuery() {
  try {
    const v = window.sessionStorage.getItem('ocean.expenses.filters.query');
    return v ?? '';
  } catch {
    return '';
  }
}

const initialState = {
  items: [],
  // include query in filters; hydrate from sessionStorage if present
  filters: { query: loadPersistedQuery(), min: undefined, max: undefined, date: '' },
  loading: false,
  error: '',
};

const slice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    filterChanged(state, action) {
      /** Updates expense filter state and persists query to sessionStorage. */
      state.filters = { ...state.filters, ...action.payload };
      // persist query if supplied
      if (Object.prototype.hasOwnProperty.call(action.payload || {}, 'query')) {
        try {
          const q = String(action.payload.query ?? '');
          window.sessionStorage.setItem('ocean.expenses.filters.query', q);
        } catch {
          // ignore storage errors (e.g., SSR/tests)
        }
      }
    },
    // PUBLIC_INTERFACE
    resetFilters(state) {
      /** Resets filters to initial values and clears persisted query. */
      state.filters = { query: '', min: undefined, max: undefined, date: '' };
      try {
        window.sessionStorage.removeItem('ocean.expenses.filters.query');
      } catch {
        // ignore
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to load expenses';
        if (!state.items.length) state.items = [];
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(addExpenseQuick.fulfilled, (state, action) => {
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((e) => e.id !== id);
      })
      .addCase(updateExpenseAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((e) => e.id === updated.id);
        if (idx !== -1) state.items[idx] = updated;
      });
  },
});

export const { filterChanged, resetFilters } = slice.actions;

export default slice.reducer;

// Selectors
const selectExpensesState = (s) => s.expenses;
export const selectExpenses = (s) => selectExpensesState(s).items;
export const selectFilters = (s) => selectExpensesState(s).filters;

export const selectFilteredExpenses = createSelector([selectExpenses, selectFilters], (items, f) => {
  const q = String(f.query || '').toLowerCase();
  return items.filter((e) => {
    // Text search on title and note (if present)
    if (q) {
      const hayTitle = String(e.title || '').toLowerCase();
      const hayNote = String(e.note || '').toLowerCase();
      if (!hayTitle.includes(q) && !hayNote.includes(q)) return false;
    }
    if (typeof f.min === 'number' && Number(e.amount) < f.min) return false;
    if (typeof f.max === 'number' && Number(e.amount) > f.max) return false;
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
