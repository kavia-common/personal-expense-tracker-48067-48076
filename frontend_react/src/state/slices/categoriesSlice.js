import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { apiClient } from '../../services/apiClient';

// Thunks for loading and mutating categories via apiClient (local or remote)

// PUBLIC_INTERFACE
export const fetchCategories = createAsyncThunk('categories/fetchAll', async () => {
  /** Loads categories from apiClient (maps to local repository when offline). */
  const data = await apiClient.get('/categories');
  return Array.isArray(data) ? data : [];
});

// PUBLIC_INTERFACE
export const createCategoryAsync = createAsyncThunk('categories/create', async ({ name }) => {
  /** Creates a new category via apiClient and returns created entity. */
  const created = await apiClient.post('/categories', { name });
  return created;
});

// PUBLIC_INTERFACE
export const updateCategoryAsync = createAsyncThunk('categories/update', async ({ id, changes }) => {
  /** Updates a category via apiClient and returns updated entity. */
  const updated = await apiClient.put(`/categories/${id}`, changes);
  return updated;
});

// PUBLIC_INTERFACE
export const deleteCategoryAsync = createAsyncThunk('categories/delete', async (id) => {
  /** Deletes a category by id via apiClient and returns deleted id. */
  await apiClient.delete(`/categories/${id}`);
  return id;
});

const initialState = {
  categories: [],
  loading: false,
  error: '',
};

const slice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to load categories';
        // Fallback seed for UI continuity if nothing loaded
        if (!state.categories.length) {
          state.categories = [
            { id: 'food', name: 'Food' },
            { id: 'transport', name: 'Transport' },
            { id: 'rent', name: 'Rent' },
            { id: 'misc', name: 'Misc' },
          ];
        }
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        if (action.payload) state.categories.push(action.payload);
      })
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.categories.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.categories[idx] = updated;
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.categories = state.categories.filter((c) => c.id !== id);
      });
  },
});

export default slice.reducer;

// PUBLIC_INTERFACE
export function useCategories() {
  /** Hook to select categories list, loading and error from store. */
  const categories = useSelector((s) => s.categories.categories);
  const loading = useSelector((s) => s.categories.loading);
  const error = useSelector((s) => s.categories.error);
  return { categories, loading, error };
}
