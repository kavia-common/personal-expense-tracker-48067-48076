import { createSlice, nanoid } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

const initialState = {
  categories: [
    { id: 'food', name: 'Food' },
    { id: 'transport', name: 'Transport' },
    { id: 'rent', name: 'Rent' },
    { id: 'misc', name: 'Misc' },
  ],
};

const slice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: {
      reducer(state, action) {
        state.categories.push(action.payload);
      },
      prepare({ name }) {
        return { payload: { id: nanoid(), name } };
      },
    },
    deleteCategory(state, action) {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addCategory, deleteCategory } = slice.actions;

export default slice.reducer;

// PUBLIC_INTERFACE
export function useCategories() {
  /** Hook to select categories list from store. */
  const categories = useSelector((s) => s.categories.categories);
  return { categories };
}
