export const LOW_LEVEL = 20;
const REFILL_MIN_RISE = 15;

export const hhmm = (ts) => ts.slice(11, 16);

export function getDelta(readings) {
  if (readings.length < 2) return null;
  const [prev, last] = readings.slice(-2);
  return { change: last.level_percent - prev.level_percent, since: hhmm(prev.timestamp) };
}

export function timeOf(readings, date, value) {
  const hit = readings.find((r) => r.timestamp.startsWith(date) && r.level_percent === value);
  return hit ? hhmm(hit.timestamp) : null;
}

export function findRefills(readings) {
  const out = [];
  for (let i = 1; i < readings.length; i++) {
    const rise = readings[i].level_percent - readings[i - 1].level_percent;
    if (rise >= REFILL_MIN_RISE) {
      out.push({ from: readings[i - 1].timestamp, to: readings[i].timestamp, toLevel: readings[i].level_percent, rise });
    }
  }
  return out;
}