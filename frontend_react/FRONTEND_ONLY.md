# Frontend-only Mode

This project is currently scoped to run without a backend. All data is stored locally in your browser and never leaves your device unless you manually export or share it.

## What this means

- No server is required to run or test the app.
- All CRUD operations (categories, expenses) use a local repository implemented with `localStorage`.
- Reports and charts are generated on-device from the locally stored data.
- Health checks and API calls are simulated in the frontend.

The implementation lives in:
- `src/services/apiClient.js` — routes requests to local mode when no backend URL is configured.
- `src/services/localRepo.js` — a thin API-compatible repository using `localStorage`.

## Where your data lives

Data is persisted under the following `localStorage` keys:
- `ocean.expenses.categories`
- `ocean.expenses.items`

Seed categories are added on first run: Food, Transport, Rent, and Misc.

## Privacy implications

Because data never leaves your browser in this mode:
- Your entries are private to this device and browser profile.
- Clearing browser storage, using Incognito/Private windows, or switching devices will affect or remove the data.

## Resetting or clearing your data

To remove all locally stored data for this app:
1. Open your browser’s Developer Tools and navigate to Application/Storage.
2. Locate `Local Storage` for the app’s origin (typically `http://localhost:3000` in development).
3. Delete the keys:
   - `ocean.expenses.categories`
   - `ocean.expenses.items`

Alternatively, you can clear site data for the origin via your browser settings.

## Re-enabling a backend later

If and when a backend is introduced, you can configure:
- `REACT_APP_API_BASE` (e.g., `http://localhost:4000/api`)
- `REACT_APP_HEALTHCHECK_PATH` (defaults to `/health`)

When these are provided, the client will attempt to call the remote API instead of the local repository. See `src/ENVIRONMENT.md` for details.
