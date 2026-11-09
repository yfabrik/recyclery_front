import { describe, expect, it } from "vitest";
import {
  canStepForward,
  presetRange,
  selectPeriod,
  stepPeriod,
} from "./period";

// Monday 9 November 2026.
const TODAY = "2026-11-09";

describe("presetRange", () => {
  it("cuts the current unit at today", () => {
    expect(presetRange("month", TODAY, TODAY)).toEqual({
      date_from: "2026-11-01",
      date_to: "2026-11-09",
    });
    expect(presetRange("quarter", TODAY, TODAY)).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-11-09",
    });
    expect(presetRange("year", TODAY, TODAY)).toEqual({
      date_from: "2026-01-01",
      date_to: "2026-11-09",
    });
  });

  it("covers a past unit in full", () => {
    expect(presetRange("month", "2026-02-14", TODAY)).toEqual({
      date_from: "2026-02-01",
      date_to: "2026-02-28",
    });
    expect(presetRange("quarter", "2026-05-20", TODAY)).toEqual({
      date_from: "2026-04-01",
      date_to: "2026-06-30",
    });
  });

  it("starts weeks on Monday", () => {
    // Sunday 8 November belongs to the week of Monday 2 November.
    expect(presetRange("week", "2026-11-08", TODAY)).toEqual({
      date_from: "2026-11-02",
      date_to: "2026-11-08",
    });
    expect(presetRange("week", TODAY, TODAY)).toEqual({
      date_from: "2026-11-09",
      date_to: "2026-11-09",
    });
  });
});

describe("selectPeriod", () => {
  it("opens the unit containing the end of the current selection", () => {
    expect(
      selectPeriod(
        { period: "custom", date_from: "2026-03-10", date_to: "2026-03-20" },
        "month",
        TODAY,
      ),
    ).toEqual({ period: "month", date_from: "2026-03-01", date_to: "2026-03-31" });
  });

  it("keeps the dates when switching to Personnalisé", () => {
    expect(
      selectPeriod(
        { period: "month", date_from: "2026-11-01", date_to: "2026-11-09" },
        "custom",
        TODAY,
      ),
    ).toEqual({ period: "custom", date_from: "2026-11-01", date_to: "2026-11-09" });
  });
});

describe("stepPeriod and canStepForward", () => {
  const currentMonth = { period: "month", date_from: "2026-11-01", date_to: "2026-11-09" } as const;

  it("goes back to the whole previous month", () => {
    expect(stepPeriod(currentMonth, -1, TODAY)).toEqual({
      period: "month",
      date_from: "2026-10-01",
      date_to: "2026-10-31",
    });
    expect(
      stepPeriod({ period: "month", date_from: "2026-03-01", date_to: "2026-03-31" }, -1, TODAY),
    ).toEqual({ period: "month", date_from: "2026-02-01", date_to: "2026-02-28" });
  });

  it("comes forward to the current month, cut at today", () => {
    expect(
      stepPeriod({ period: "month", date_from: "2026-10-01", date_to: "2026-10-31" }, 1, TODAY),
    ).toEqual(currentMonth);
  });

  it("steps weeks, quarters and years by one unit", () => {
    expect(
      stepPeriod({ period: "week", date_from: "2026-11-09", date_to: "2026-11-09" }, -1, TODAY),
    ).toEqual({ period: "week", date_from: "2026-11-02", date_to: "2026-11-08" });
    expect(
      stepPeriod({ period: "quarter", date_from: "2026-10-01", date_to: "2026-11-09" }, -1, TODAY),
    ).toEqual({ period: "quarter", date_from: "2026-07-01", date_to: "2026-09-30" });
    expect(
      stepPeriod({ period: "year", date_from: "2026-01-01", date_to: "2026-11-09" }, -1, TODAY),
    ).toEqual({ period: "year", date_from: "2025-01-01", date_to: "2025-12-31" });
  });

  it("steps a custom range by its own number of days", () => {
    expect(
      stepPeriod({ period: "custom", date_from: "2026-10-10", date_to: "2026-10-19" }, -1, TODAY),
    ).toEqual({ period: "custom", date_from: "2026-09-30", date_to: "2026-10-09" });
    expect(
      stepPeriod({ period: "custom", date_from: "2026-10-20", date_to: "2026-10-29" }, 1, TODAY),
    ).toEqual({ period: "custom", date_from: "2026-10-30", date_to: "2026-11-08" });
  });

  it("disables next beyond the current period", () => {
    expect(canStepForward(currentMonth, TODAY)).toBe(false);
    expect(
      canStepForward({ period: "month", date_from: "2026-10-01", date_to: "2026-10-31" }, TODAY),
    ).toBe(true);
    expect(
      canStepForward({ period: "week", date_from: "2026-11-09", date_to: "2026-11-09" }, TODAY),
    ).toBe(false);
    expect(
      canStepForward({ period: "custom", date_from: "2026-10-31", date_to: "2026-11-09" }, TODAY),
    ).toBe(false);
    expect(
      canStepForward({ period: "custom", date_from: "2026-10-20", date_to: "2026-10-29" }, TODAY),
    ).toBe(true);
  });
});
