# Frontend Environment Variables

Provide these variables via `.env` at the project root or container environment.

- REACT_APP_API_BASE: Preferred base URL for API (e.g., http://localhost:4000/api)
- REACT_APP_BACKEND_URL: Fallback base URL for API if API_BASE not provided
- REACT_APP_HEALTHCHECK_PATH: Path to health endpoint (default: /health). When combined with REACT_APP_API_BASE above, health URL becomes http://localhost:4000/api/health
- REACT_APP_FEATURE_FLAGS: Comma-separated list of flags (e.g., charts,newFilters)
- REACT_APP_EXPERIMENTS_ENABLED: "true" to enable experimental UI

The apiClient will use REACT_APP_API_BASE or REACT_APP_BACKEND_URL and append request paths.

Integration note:
- Backend routes are mounted at /api/* so REACT_APP_API_BASE should include /api.
- Example: REACT_APP_API_BASE=http://localhost:4000/api and REACT_APP_HEALTHCHECK_PATH=/health
