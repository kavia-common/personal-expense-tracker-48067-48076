import { render, screen } from '@testing-library/react';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './state/store';
import { BrowserRouter } from 'react-router-dom';

test('renders app shell', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
  const shell = screen.getByTestId('app-shell');
  expect(shell).toBeInTheDocument();
});
