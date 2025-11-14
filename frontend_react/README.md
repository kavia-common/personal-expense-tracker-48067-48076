# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Frontend-only mode

This application supports a frontend-only local mode. When no backend URL is configured, all data persists in your browser and reports are computed on-device. Backend URLs are optional and unused in this mode.

- Install dependencies: `npm install`
- Start the app: `npm start`

Data storage:
- Persisted via `localStorage` under:
  - `ocean.expenses.categories`
  - `ocean.expenses.items`

Reset local data:
1. Open your browser’s Developer Tools and go to Application/Storage.
2. Under Local Storage for `http://localhost:3000` (in development), delete:
   - `ocean.expenses.categories`
   - `ocean.expenses.items`
Alternatively, clear site data for the origin via browser settings.

Environment (optional):
You do not need any `.env` file to run in this mode. If you want to be explicit, you can add a `.env.local` with only relevant keys:
```
REACT_APP_FEATURE_FLAGS=charts
REACT_APP_EXPERIMENTS_ENABLED=false
# REACT_APP_HEALTHCHECK_PATH=/health
# Leave these unset to stay offline:
# REACT_APP_API_BASE=
# REACT_APP_BACKEND_URL=
```

If you later introduce a backend, set `REACT_APP_API_BASE` (e.g., `http://localhost:4000/api`) and optionally `REACT_APP_HEALTHCHECK_PATH` (default `/health`). The app will automatically attempt remote calls instead of the local repository. See `src/ENVIRONMENT.md` for full details.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
