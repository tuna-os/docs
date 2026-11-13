const DAY_MS = 24 * 60 * 60 * 1000;

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function isTally(value, numerator) {
  return value !== null
    && typeof value === 'object'
    && isCount(value[numerator])
    && isCount(value.total)
    && value[numerator] <= value.total;
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function parseFactoryHealth(text) {
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return null;
  }

  const summary = payload?.summary;
  if (!summary
      || !isTally(summary.factory_health, 'green')
      || !isTally(summary.install, 'tested')
      || !isTally(summary.lifecycle, 'tested')
      || !isCount(summary.never_tested)
      || summary.known_regressions === null
      || typeof summary.known_regressions !== 'object'
      || !isCount(summary.known_regressions.blocking)
      || !isCount(summary.known_regressions.advisory)
      || !isDate(summary.last_full_sweep)) {
    return null;
  }

  return summary;
}

export function sweepAge(date, now = Date.now()) {
  if (!isDate(date)) return 'unknown';
  const then = Date.parse(`${date}T00:00:00Z`);
  const days = Math.floor((now - then) / DAY_MS);
  if (days < 0) return 'unknown';
  if (days === 0) return 'today';
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
