# Frontend Environment Variables

This app supports a frontend-only local mode. In this mode, all data is stored in the browser and there is no backend dependency.

Provide these variables via a `.env` or `.env.local` at the project root of this frontend container, or through your container environment.

## How local (frontend-only) mode is triggered

- If neither `REACT_APP_API_BASE` nor `REACT_APP_BACKEND_URL` is set, the app runs fully offline using a built-in local repository.
- The local repository uses `localStorage` to persist data and computes reports on-device. See “Local repository details” below.

This behavior is implemented in `src/services/apiClient.js`:
- When `API_BASE` resolves to an empty string, requests are routed to `localRepo` instead of a remote server.
- Health checks also resolve locally via `localRepo.health()` when offline.

## Variables currently used by the frontend

- `REACT_APP_FEATURE_FLAGS` (optional): Comma‑separated list of flags, e.g. `charts,newFilters`. If unspecified, charts default to enabled.
- `REACT_APP_EXPERIMENTS_ENABLED` (optional): Set to `"true"` to enable experimental UI affordances.
- `REACT_APP_HEALTHCHECK_PATH` (optional): Path to the health endpoint. Default: `/health`. In local mode this is handled by the local repository.

The following are optional and unused in frontend‑only mode:
- `REACT_APP_API_BASE` (optional): Preferred base URL for API (e.g., `http://localhost:4000/api`). If provided, the app will attempt remote requests.
- `REACT_APP_BACKEND_URL` (optional): Fallback base URL if `REACT_APP_API_BASE` is not provided.

Other variables sometimes seen in generic templates (e.g., `REACT_APP_FRONTEND_URL`, `REACT_APP_WS_URL`, `REACT_APP_NODE_ENV`, `REACT_APP_ENABLE_SOURCE_MAPS`, `REACT_APP_PORT`, `REACT_APP_TRUST_PROXY`, `REACT_APP_LOG_LEVEL`) are not used by this frontend and can be omitted.

## Local repository details

- Seed categories are added on first run: Food, Transport, Rent, Misc.
- Data persists under these localStorage keys:
  - `ocean.expenses.categories`
  - `ocean.expenses.items`
- Reports and charts are computed locally via Redux selectors and utility helpers; no backend is required.

## Optional backend integration

If you later introduce a backend:
- Routes are expected at `/api/*`, so set `REACT_APP_API_BASE` to include `/api`, e.g. `REACT_APP_API_BASE=http://localhost:4000/api`.
- `REACT_APP_HEALTHCHECK_PATH` defaults to `/health`, so the health URL becomes `http://localhost:4000/api/health`.

## Example .env.local for frontend-only mode

Use only the relevant keys:
```
# Optional, defaults shown
REACT_APP_FEATURE_FLAGS=charts
REACT_APP_EXPERIMENTS_ENABLED=false
# REACT_APP_HEALTHCHECK_PATH=/health
# Leave API variables unset to stay in offline/local mode:
# REACT_APP_API_BASE=
# REACT_APP_BACKEND_URL=
```
