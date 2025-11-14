//
//
// Local repository for offline persistence using localStorage with optional IndexedDB fallback.
// Provides CRUD for categories and expenses and helpers for reporting.
//
// PUBLIC INTERFACE: All exported functions maintain API-like signatures to be used by apiClient.
//
const STORAGE_KEYS = {
  categories: 'ocean.expenses.categories',
  expenses: 'ocean.expenses.items',
  meta: 'ocean.expenses.meta',
};

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food' },
  { id: 'transport', name: 'Transport' },
  { id: 'rent', name: 'Rent' },
  { id: 'misc', name: 'Misc' },
];

// Simple unique ID generator for local entities (prefix + timestamp + random)
function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Safe JSON parse
function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

// LocalStorage helpers
function lsGet(key, fallback) {
  const raw = window.localStorage.getItem(key);
  if (raw == null) return fallback;
  return safeParse(raw, fallback);
}

function lsSet(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

// Initialize seed data if empty
function ensureSeed() {
  const meta = lsGet(STORAGE_KEYS.meta, {});
  let changed = false;

  let categories = lsGet(STORAGE_KEYS.categories, null);
  if (!Array.isArray(categories) || categories.length === 0) {
    categories = DEFAULT_CATEGORIES.slice();
    lsSet(STORAGE_KEYS.categories, categories);
    changed = true;
  }

  let expenses = lsGet(STORAGE_KEYS.expenses, null);
  if (!Array.isArray(expenses)) {
    expenses = [];
    lsSet(STORAGE_KEYS.expenses, expenses);
    changed = true;
  }

  if (changed) {
    lsSet(STORAGE_KEYS.meta, { ...meta, seededAt: new Date().toISOString() });
  }
}

// Boot time seed
try {
  ensureSeed();
} catch {
  // localStorage may not be available in some environments (e.g., SSR/tests)
  // In such case, we silently ignore; callers should handle empty arrays.
}

/**
 * Normalize expense object ensuring required fields and types.
 */
function normalizeExpense(input) {
  const e = { ...input };
  e.id = e.id || uid('exp');
  e.title = String(e.title || '').trim();
  e.amount = Number(e.amount || 0);
  e.categoryId = e.categoryId || 'misc';
  // store as YYYY-MM-DD
  try {
    const d = input.date ? new Date(input.date) : new Date();
    e.date = d.toISOString().slice(0, 10);
  } catch {
    e.date = new Date().toISOString().slice(0, 10);
  }
  return e;
}

/**
 * Compute monthly totals from a list of expenses.
 * Returns [{month: 'YYYY-MM', total: number}]
 */
function computeMonthlyTotals(expenses) {
  const map = new Map();
  (expenses || []).forEach((e) => {
    const d = new Date(e.date || Date.now());
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + (Number(e.amount) || 0));
  });
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([month, total]) => ({ month, total }));
}

/**
 * Compute totals by category from a list of expenses.
 * Returns { [categoryId]: totalAmount }
 */
function computeByCategory(expenses) {
  return (expenses || []).reduce((acc, e) => {
    acc[e.categoryId] = (acc[e.categoryId] || 0) + (Number(e.amount) || 0);
    return acc;
  }, {});
}

/**
 * PUBLIC_INTERFACE
 * List all categories.
 */
export async function listCategories() {
  /** Returns an array of {id, name} from local storage. */
  try {
    ensureSeed();
    return lsGet(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

/**
 * PUBLIC_INTERFACE
 * Create a category.
 */
export async function createCategory({ name }) {
  /** Creates a new category with generated id, returns created entity. */
  const trimmed = String(name || '').trim();
  if (!trimmed) throw new Error('Category name is required');
  const cats = lsGet(STORAGE_KEYS.categories, DEFAULT_CATEGORIES.slice());
  const newCat = { id: uid('cat'), name: trimmed };
  lsSet(STORAGE_KEYS.categories, [...cats, newCat]);
  return newCat;
}

/**
 * PUBLIC_INTERFACE
 * Update a category by id with provided changes.
 */
export async function updateCategory(id, changes = {}) {
  /** Updates a category name; validates non-empty. Returns updated entity. */
  const cats = lsGet(STORAGE_KEYS.categories, DEFAULT_CATEGORIES.slice());
  const idx = cats.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  const nextName = changes.name !== undefined ? String(changes.name).trim() : cats[idx].name;
  if (!nextName) throw new Error('Category name cannot be empty');
  const updated = { ...cats[idx], name: nextName };
  const next = cats.slice();
  next[idx] = updated;
  lsSet(STORAGE_KEYS.categories, next);
  return updated;
}

/**
 * PUBLIC_INTERFACE
 * Delete a category by id.
 */
export async function deleteCategory(id) {
  /** Deletes category by id and returns {deleted: true}. */
  const cats = lsGet(STORAGE_KEYS.categories, DEFAULT_CATEGORIES.slice());
  const filtered = cats.filter((c) => c.id !== id);
  lsSet(STORAGE_KEYS.categories, filtered);
  // Optional: cascade update expenses with removed category to 'misc'
  const items = lsGet(STORAGE_KEYS.expenses, []);
  const updated = items.map((e) => (e.categoryId === id ? { ...e, categoryId: 'misc' } : e));
  lsSet(STORAGE_KEYS.expenses, updated);
  return { deleted: true };
}

/**
 * PUBLIC_INTERFACE
 * List expenses with optional query params (basic support).
 */
export async function listExpenses(params = {}) {
  /** Returns an array of expense items with optional filter: {from, to, categoryId}. */
  const items = lsGet(STORAGE_KEYS.expenses, []);
  const { from, to, categoryId } = params || {};
  const inRange = (e) => {
    let ok = true;
    if (from) ok = ok && e.date >= from;
    if (to) ok = ok && e.date <= to;
    if (categoryId) ok = ok && e.categoryId === categoryId;
    return ok;
  };
  return items.filter(inRange);
}

/**
 * PUBLIC_INTERFACE
 * Create an expense.
 */
export async function createExpense(expense) {
  /** Creates an expense entry and returns created entity. */
  const e = normalizeExpense(expense || {});
  if (!e.title) throw new Error('Title is required');
  if (Number.isNaN(e.amount) || e.amount < 0) throw new Error('Amount must be >= 0');
  const items = lsGet(STORAGE_KEYS.expenses, []);
  lsSet(STORAGE_KEYS.expenses, [...items, e]);
  return e;
}

/**
 * PUBLIC_INTERFACE
 * Update an expense by id with provided changes.
 */
export async function updateExpense(id, changes = {}) {
  /** Updates expense fields; validates title non-empty and amount >= 0. Returns updated entity. */
  const items = lsGet(STORAGE_KEYS.expenses, []);
  const idx = items.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Expense not found');

  const existing = items[idx];
  const merged = {
    ...existing,
    ...changes,
  };

  // Normalize certain fields if supplied
  if (merged.title !== undefined) merged.title = String(merged.title).trim();
  if (merged.amount !== undefined) merged.amount = Number(merged.amount);
  if (merged.date !== undefined) {
    try {
      const d = new Date(merged.date);
      merged.date = d.toISOString().slice(0, 10);
    } catch {
      merged.date = existing.date;
    }
  }

  // Validation
  if (!merged.title) throw new Error('Title is required');
  if (Number.isNaN(merged.amount) || merged.amount < 0) throw new Error('Amount must be >= 0');
  if (!merged.categoryId) merged.categoryId = existing.categoryId || 'misc';

  const next = items.slice();
  next[idx] = merged;
  lsSet(STORAGE_KEYS.expenses, next);
  return merged;
}

/**
 * PUBLIC_INTERFACE
 * Delete expense by id.
 */
export async function deleteExpense(id) {
  /** Deletes an expense by id and returns {deleted: true}. */
  const items = lsGet(STORAGE_KEYS.expenses, []);
  const filtered = items.filter((e) => e.id !== id);
  lsSet(STORAGE_KEYS.expenses, filtered);
  return { deleted: true };
}

/**
 * PUBLIC_INTERFACE
 * Reports summary helper similar to backend: monthly and byCategory between from/to.
 */
export async function getReportsSummary({ from = '', to = '' } = {}) {
  /** Returns { monthly: [{month,total}], byCategory: {id: total} } computed locally. */
  const items = await listExpenses({ from, to });
  return {
    monthly: computeMonthlyTotals(items),
    byCategory: computeByCategory(items),
  };
}

/**
 * PUBLIC_INTERFACE
 * Local health check.
 */
export async function health() {
  /** Returns a simple OK payload for offline mode to mimic API health. */
  return { status: 'ok', mode: 'local' };
}
