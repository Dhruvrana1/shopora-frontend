const currency = import.meta.env.VITE_CURRENCY || 'INR';

export function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Price unavailable';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`;
  }
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function label(value) {
  const s = String(value || '').replace(/_/g, ' ');
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';
}

export const isPaid = (status) => String(status).toLowerCase() === 'paid';

/** Address may be an object (jsonb) or a JSON/plain string (text column). Returns display lines. */
export function addressLines(value) {
  if (!value) return [];
  let v = value;
  if (typeof v === 'string') {
    try {
      v = JSON.parse(v);
    } catch {
      return [v];
    }
  }
  if (typeof v !== 'object') return [String(v)];
  const cityLine = [v.city, v.state, v.postal_code].filter(Boolean).join(', ');
  const lines = [v.full_name, v.line1, v.line2, cityLine, v.country, v.phone].filter(Boolean);
  return lines.length ? lines : Object.values(v).filter(Boolean).map(String);
}
