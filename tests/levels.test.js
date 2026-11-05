import { describe, it, expect } from "vitest";
import { processReadings } from "../src/lib/levels";
import raw from "../src/data/readings.json";

const r = (timestamp, level_percent) => ({ timestamp, level_percent });

describe("processReadings", () => {
  it("computes current, min, max from mock data", () => {
    const out = processReadings(raw);
    expect(out).toMatchObject({ current: 55, min: 18, max: 78, date: "2026-11-02", isLow: false });
  });

  it("keeps the 18% dip in alert history", () => {
    expect(processReadings(raw).lowEvents).toEqual([r("2026-11-02T16:00:00", 18)]);
  });

  it("sorts unsorted input", () => {
    const out = processReadings([r("2026-11-02T10:00:00", 50), r("2026-11-02T06:00:00", 80)]);
    expect(out.current).toBe(50);
  });

  it("alert is strictly below 20", () => {
    expect(processReadings([r("2026-11-02T06:00:00", 20)]).isLow).toBe(false);
    expect(processReadings([r("2026-11-02T06:00:00", 19)]).isLow).toBe(true);
  });

  it("rejects invalid entries", () => {
    const bad = [null, r("2026-11-02T06:00:00", -5), r("2026-11-02T06:00:00", 101),
      r("2026-11-02T06:00:00", "50"), r("2026-11-02T06:00:00", null), r("Nov 2, 2026", 40)];
    expect(processReadings([...bad, r("2026-11-02T07:00:00", 60)]).readings).toHaveLength(1);
  });

  it("uses latest data date as today", () => {
    const out = processReadings([r("2026-11-01T06:00:00", 5), r("2026-11-02T06:00:00", 60), r("2026-11-02T08:00:00", 40)]);
    expect(out).toMatchObject({ date: "2026-11-02", min: 40, max: 60 });
  });

  it("handles empty and non-array input", () => {
    expect(processReadings([]).current).toBeNull();
    expect(processReadings(undefined).readings).toEqual([]);
  });
});