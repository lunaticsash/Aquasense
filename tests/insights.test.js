import { describe, it, expect } from "vitest";
import { getDelta, timeOf, findRefills } from "../src/lib/insights";
import { processReadings } from "../src/lib/levels";
import raw from "../src/data/readings.json";

const r = (timestamp, level_percent) => ({ timestamp, level_percent });
const { readings, date } = processReadings(raw);

describe("getDelta", () => {
  it("compares last reading with previous", () => {
    expect(getDelta(readings)).toEqual({ change: 13, since: "18:00" });
  });
  it("is negative after a drop", () => {
    expect(getDelta([...readings, r("2026-11-02T22:00:00", 15)])).toEqual({ change: -40, since: "20:00" });
  });
  it("returns null for fewer than 2 readings", () => {
    expect(getDelta([])).toBeNull();
    expect(getDelta([r("2026-11-02T06:00:00", 50)])).toBeNull();
  });
});

describe("timeOf", () => {
  it("finds time of min and max", () => {
    expect(timeOf(readings, date, 18)).toBe("16:00");
    expect(timeOf(readings, date, 78)).toBe("06:00");
  });
  it("returns null when value is absent", () => {
    expect(timeOf(readings, date, 99)).toBeNull();
  });
});

describe("findRefills", () => {
  it("detects the 16:00 to 18:00 refill in mock data", () => {
    expect(findRefills(readings)).toMatchObject([
      { from: "2026-11-02T16:00:00", to: "2026-11-02T18:00:00", rise: 24 },
    ]);
  });
  it("counts a rise of exactly 15 but not 14", () => {
    expect(findRefills([r("2026-11-02T06:00:00", 10), r("2026-11-02T08:00:00", 25)])).toHaveLength(1);
    expect(findRefills([r("2026-11-02T06:00:00", 10), r("2026-11-02T08:00:00", 24)])).toHaveLength(0);
  });
  it("handles empty input", () => {
    expect(findRefills([])).toEqual([]);
  });
});