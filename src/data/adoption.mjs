import categories from './adoption-categories.json' with {type: 'json'};
// One public schema for the website and its Worker. Reject rather than repair
// data: flooring or dropping fields here could hide a collector privacy defect.
const dimensions = ['variant', 'flavor', 'arch', 'age_bucket'];
function keys(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).sort().join() !== [...expected].sort().join()) throw Error('Invalid public fields');
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value).toISOString().slice(0, 10) !== value) throw Error('Invalid week');
  return Date.parse(value);
}
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) throw Error('Invalid timestamp');
}
function count(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value % 10 !== 0) throw Error('Unsafe public count');
}
function margin(value, total = false, dimension = null) {
  keys(value, ['status', total ? 'count' : 'counts']);
  const data = value[total ? 'count' : 'counts'];
  if (!['reported', 'suppressed', 'unavailable'].includes(value.status)) throw Error('Invalid margin');
  if (value.status !== 'reported') {
    if (data !== null) throw Error('Private margin');
  } else if (total) count(data);
  else {
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length > 100) throw Error('Invalid categories');
    for (const [key, n] of Object.entries(data)) {
      if (!categories[dimension]?.includes(key)) throw Error('Invalid category');
      count(n);
      if (n === 0) throw Error('Empty category');
    }
  }
}
export function validateAdoption(feed, now = Date.now()) {
  keys(feed, ['schema', 'methodology', 'generated_at', 'collection_started', 'weeks']);
  if (feed.schema !== 1 || feed.methodology !== 'tunaos-countme-v1') throw Error('Unknown methodology');
  timestamp(feed.generated_at);
  if (feed.collection_started !== null) timestamp(feed.collection_started);
  if (Date.parse(feed.generated_at) > now + 300000 || (feed.collection_started && Date.parse(feed.collection_started) > Date.parse(feed.generated_at))) throw Error('Future feed');
  if (!Array.isArray(feed.weeks) || feed.weeks.length > 104) throw Error('Invalid history');
  let previous = -Infinity;
  const current = new Date(now); current.setUTCHours(0, 0, 0, 0);
  current.setUTCDate(current.getUTCDate() - (current.getUTCDay() + 6) % 7);
  for (const week of feed.weeks) {
    keys(week, ['week_start', 'week_end', 'status', 'total', 'dimensions']);
    const start = date(week.week_start), end = date(week.week_end);
    if (new Date(start).getUTCDay() !== 1 || end - start !== 604800000 || end > current.getTime() || start <= previous) throw Error('Nonclosed or unordered week');
    previous = start;
    if (!['complete', 'degraded', 'unavailable'].includes(week.status)) throw Error('Invalid week status');
    margin(week.total, true); keys(week.dimensions, dimensions);
    for (const key of dimensions) margin(week.dimensions[key], false, key);
    if (week.total.status === 'reported' && dimensions.some(key => week.dimensions[key].status === 'reported' && Object.values(week.dimensions[key].counts).reduce((sum, n) => sum + n, 0) > week.total.count)) throw Error('Invalid margin total');
    if (week.total.status !== 'reported' && dimensions.some(key => week.dimensions[key].status === 'reported')) throw Error('Suppression bypass');
    if (week.status === 'unavailable' && (week.total.status !== 'unavailable' || dimensions.some(key => week.dimensions[key].status !== 'unavailable'))) throw Error('Unavailable data');
  }
  return feed;
}
export function estimateText(total) {
  return total.status === 'reported' ? total.count === 0 ? '0' : `${total.count.toLocaleString()}–${(total.count + 9).toLocaleString()}` : total.status === 'suppressed' ? 'Suppressed for privacy' : 'Unavailable';
}

export function adoptionWarnings(feed, now = Date.now()) {
  const warnings = [];
  if (now - Date.parse(feed.generated_at) > 86400000) warnings.push('The public feed is more than 24 hours old. These metrics may be stale.');
  const current = new Date(now); current.setUTCHours(0, 0, 0, 0);
  current.setUTCDate(current.getUTCDate() - (current.getUTCDay() + 6) % 7);
  if (feed.collection_started && Date.parse(feed.collection_started) < current.getTime() && feed.weeks.at(-1)?.week_end !== current.toISOString().slice(0, 10)) {
    warnings.push('The latest closed UTC week is missing. Publication may have stopped even though the feed is reachable. Missing data is not zero adoption.');
  }
  return warnings;
}
