import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './state/store';
import { fetchCategories } from './state/slices/categoriesSlice';
import { fetchExpenses } from './state/slices/expensesSlice';

// Bootstrapper to load initial local data on app startup
function Bootstrap() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchExpenses());
  }, [dispatch]);
  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Bootstrap />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
