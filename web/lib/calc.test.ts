import { describe, expect, it } from "vitest";
import { arrivesUsd, costBand, lossUsd, timesMore, yearlySavingUsd } from "@/lib/calc";
import meta from "@/public/data/meta.json";
import trend from "@/public/data/trend.json";
import corridors from "@/public/data/corridors.json";
import firmTypes from "@/public/data/firm_types.json";

describe("the $200 maths", () => {
  it("loss is the cost % of $200", () => {
    expect(lossUsd(5.91)).toBeCloseTo(11.82, 2);
    expect(lossUsd(12.64)).toBeCloseTo(25.28, 2);
    expect(arrivesUsd(5.91)).toBeCloseTo(188.18, 2);
  });

  it("matches the notebook's loss columns", () => {
    for (const c of corridors) {
      // the notebook rounds the % first, so allow a cent of difference
      expect(Math.abs(lossUsd(c.avg_cost_pct) - c.avg_loss_usd_on_200)).toBeLessThan(0.02);
    }
    for (const f of firmTypes) expect(Math.abs(lossUsd(f.avg_cost_pct) - f.avg_loss_usd_on_200)).toBeLessThan(0.02);
  });

  it("yearly saving: 12 transfers, average vs cheapest", () => {
    // United Kingdom -> India: 1.91% average, 0.15% cheapest
    expect(yearlySavingUsd(1.91, 0.15, 12)).toBeCloseTo(42.24, 2);
    expect(yearlySavingUsd(2, 3, 12)).toBe(0); // never negative
  });

  it("times more", () => {
    expect(timesMore(12.64, 4.68)).toBeCloseTo(2.7, 1);
  });

  it("map bands", () => {
    expect(costBand(2.5)).toBe(0);
    expect(costBand(3)).toBe(0);
    expect(costBand(5.91)).toBe(2);
    expect(costBand(25)).toBe(4);
  });
});

describe("the data files agree with each other", () => {
  it("the headline average is the latest quarter of the trend", () => {
    const last = trend[trend.length - 1];
    expect(last.period_label).toBe(meta.latest_quarter);
    expect(last.avg_cost_pct).toBe(meta.avg_cost_pct);
    expect(last.services).toBe(meta.services);
  });

  it("every route's cheapest service costs no more than its average", () => {
    for (const c of corridors) expect(c.cheapest_pct).toBeLessThanOrEqual(c.avg_cost_pct);
  });

  it("route codes are sender + receiver country codes", () => {
    for (const c of corridors) expect(c.corridor).toBe(c.send_iso3 + c.receive_iso3);
  });
});
