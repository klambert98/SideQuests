// Utilities for handling date-only values consistently in local time
// Treat strings like 'YYYY-MM-DD' as date-only without timezone.

export function parseLocalDate(value: Date | string): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string') {
    const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      // Construct a local-time Date at midnight of the given calendar day.
      return new Date(y, mo, d);
    }
    // Fallback: parse via Date for full ISO strings with time.
    const iso = new Date(value);
    return iso;
  }
  // Fallback
  return new Date(value as any);
}

export function formatMonthDay(value: Date | string, locale = 'en-US') {
  const d = parseLocalDate(value);
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function formatDay(value: Date | string, locale = 'en-US') {
  const d = parseLocalDate(value);
  return d.toLocaleDateString(locale, { day: '2-digit' });
}

export function formatFullDate(value: Date | string, locale = 'en-US') {
  const d = parseLocalDate(value);
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}
