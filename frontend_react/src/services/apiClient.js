const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  '';

const HEALTH_PATH = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';

let localMode = false;
try {
  localMode = !API_BASE; // If no base provided, use local repo
} catch {
  localMode = true;
}

let localRepo = null;
if (localMode) {
  // Lazy import to avoid bundling if remote mode is used (keeps tree-shaking simple)
  // In CRA, dynamic import is async; since we need sync here, we import statically.
  // It's acceptable as file is small.
  localRepo = require('./localRepo');
}

/**
 * Build absolute URL from a relative path, ensuring single slash.
 */
function url(path) {
  if (!API_BASE) return path;
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const p = String(path || '').startsWith('/') ? path : `/${path || ''}`;
  return `${base}${p}`;
}

/**
 * Internal fetch wrapper with JSON handling and error normalization.
 */
async function request(path, options = {}) {
  const res = await fetch(url(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const contentType = res.headers.get('content-type') || '';
  const isJSON = contentType.includes('application/json');
  const body = isJSON ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const err = new Error((body && body.message) || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/**
 * Map REST-like paths to localRepo functions in local mode.
 * We keep minimal routing to support current components:
 * - GET    /categories
 * - POST   /categories {name}
 * - DELETE /categories/:id
 * - GET    /expenses
 * - POST   /expenses {...}
 * - DELETE /expenses/:id
 * - GET    /reports/summary?from&to
 * - GET    /health
 */
async function localRoute(method, path, body) {
  const p = String(path || '');
  try {
    // Health
    if (p === HEALTH_PATH && method === 'GET') {
      return await localRepo.health();
    }
    // Reports summary
    if (p.startsWith('/reports/summary') && method === 'GET') {
      const qs = p.split('?')[1] || '';
      const urlParams = new URLSearchParams(qs);
      const from = urlParams.get('from') || '';
      const to = urlParams.get('to') || '';
      return await localRepo.getReportsSummary({ from, to });
    }
    // Categories
    if (p === '/categories' && method === 'GET') {
      return await localRepo.listCategories();
    }
    if (p === '/categories' && method === 'POST') {
      return await localRepo.createCategory(body || {});
    }
    if (p.startsWith('/categories/') && method === 'DELETE') {
      const id = p.split('/')[2];
      return await localRepo.deleteCategory(id);
    }
    // Expenses
    if (p === '/expenses' && method === 'GET') {
      return await localRepo.listExpenses();
    }
    if (p === '/expenses' && method === 'POST') {
      return await localRepo.createExpense(body || {});
    }
    if (p.startsWith('/expenses/') && method === 'DELETE') {
      const id = p.split('/')[2];
      return await localRepo.deleteExpense(id);
    }
  } catch (e) {
    // Normalize errors to look like fetch error
    const err = new Error(e?.message || 'Local route error');
    err.status = 400;
    throw err;
  }
  const err = new Error(`Local route not implemented for ${method} ${p}`);
  err.status = 404;
  throw err;
}

// PUBLIC_INTERFACE
export const apiClient = {
  /** GET JSON helper */
  get: (p) => (localMode ? localRoute('GET', p) : request(p, { method: 'GET' })),
  /** POST JSON helper */
  post: (p, data) => (localMode ? localRoute('POST', p, data) : request(p, { method: 'POST', body: JSON.stringify(data) })),
  /** PUT JSON helper */
  put: (p, data) => (localMode ? localRoute('PUT', p, data) : request(p, { method: 'PUT', body: JSON.stringify(data) })),
  /** DELETE helper */
  delete: (p) => (localMode ? localRoute('DELETE', p) : request(p, { method: 'DELETE' })),
  /** Health check to the backend (local in offline mode) */
  health: () => (localMode ? localRoute('GET', HEALTH_PATH) : request(HEALTH_PATH, { method: 'GET' })),
};

export default apiClient;
