import { describe, expect, it } from "vitest";
import { computeChange, changeTone } from "./change";

describe("computeChange", () => {
  it("is the relative change vs the comparison value", () => {
    expect(computeChange(125, 100)).toEqual({ ratio: 0.25, direction: "up" });
    expect(computeChange(80, 100)).toEqual({ ratio: -0.2, direction: "down" });
    expect(computeChange(100, 100)).toEqual({ ratio: 0, direction: "flat" });
  });

  it("is null without a comparison (compare=none)", () => {
    expect(computeChange(125, null)).toBeNull();
    expect(computeChange(125, undefined)).toBeNull();
  });

  it("has no ratio when the comparison value is 0", () => {
    expect(computeChange(0, 0)).toEqual({ ratio: 0, direction: "flat" });
    expect(computeChange(40, 0)).toEqual({ ratio: null, direction: "up" });
  });

  it("measures a negative comparison value against its size", () => {
    // Net revenue went from −100 (more refunded than sold) to −50.
    expect(computeChange(-50, -100)).toEqual({ ratio: 0.5, direction: "up" });
  });
});

describe("changeTone", () => {
  it("shows a rise as good, unless lower is better (refunds)", () => {
    const up = computeChange(125, 100);
    expect(changeTone(up)).toBe("success");
    expect(changeTone(up, { lowerIsBetter: true })).toBe("error");
    expect(changeTone(computeChange(80, 100))).toBe("error");
    expect(changeTone(computeChange(100, 100))).toBe("neutral");
  });
});
