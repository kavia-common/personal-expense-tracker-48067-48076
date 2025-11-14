const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  '';

const HEALTH_PATH = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';

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

// PUBLIC_INTERFACE
export const apiClient = {
  /** GET JSON helper */
  get: (p) => request(p, { method: 'GET' }),
  /** POST JSON helper */
  post: (p, data) => request(p, { method: 'POST', body: JSON.stringify(data) }),
  /** PUT JSON helper */
  put: (p, data) => request(p, { method: 'PUT', body: JSON.stringify(data) }),
  /** DELETE helper */
  delete: (p) => request(p, { method: 'DELETE' }),
  /** Health check to the backend */
  health: () => request(HEALTH_PATH, { method: 'GET' }),
};

export default apiClient;
