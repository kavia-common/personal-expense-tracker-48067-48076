const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

// PUBLIC_INTERFACE
export function formatCurrency(value) {
  /** Format a number value to localized currency string. */
  const num = Number(value) || 0;
  return currency.format(num);
}

// PUBLIC_INTERFACE
export function formatDateISO(date) {
  /** Returns a YYYY-MM-DD string for a Date or input date string. */
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}
