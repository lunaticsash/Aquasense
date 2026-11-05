const LOW_THRESHOLD = 20;

const isValid = (r) =>
  r &&
  typeof r.timestamp === "string" &&
  !Number.isNaN(Date.parse(r.timestamp)) &&
  Number.isFinite(r.level_percent) &&
  r.level_percent >= 0 &&
  r.level_percent <= 100;

export function processReadings(raw) {
  const readings = (Array.isArray(raw) ? raw : [])
    .filter(isValid)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (!readings.length) {
    return { readings, current: null, min: null, max: null, date: null, isLow: false, lowEvents: [] };
  }

  const current = readings.at(-1).level_percent;
  const date = readings.at(-1).timestamp.slice(0, 10); // "today" = latest data date
  const levels = readings.filter((r) => r.timestamp.startsWith(date)).map((r) => r.level_percent);

  return {
    readings,
    current,
    min: Math.min(...levels),
    max: Math.max(...levels),
    date,
    isLow: current < LOW_THRESHOLD,
    lowEvents: readings.filter((r) => r.level_percent < LOW_THRESHOLD),
  };
}