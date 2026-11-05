import { describe, expect, it } from "vitest";
import { sliderMarks } from "./geometry";

const h = (hours: number, minutes = 0) => hours * 60 + minutes;

describe("sliderMarks", () => {
  it("is the clock's 15-minute grid for a Task that sits on it", () => {
    expect(sliderMarks({ start: h(9), end: h(10) }).map((mark) => mark.value)).toEqual([
      h(9),
      h(9, 15),
      h(9, 30),
      h(9, 45),
      h(10),
    ]);
  });

  it("keeps the clock's grid, not the Task's offset, when the Task starts at 10:01", () => {
    const values = sliderMarks({ start: h(10, 1), end: h(11) }).map((mark) => mark.value);
    expect(values).toEqual([h(10, 1), h(10, 15), h(10, 30), h(10, 45), h(11)]);
  });

  it("includes the Task's own off-grid end", () => {
    const values = sliderMarks({ start: h(11, 30), end: h(12, 7) }).map((mark) => mark.value);
    expect(values).toEqual([h(11, 30), h(11, 45), h(12), h(12, 7)]);
  });

  it("offers just the two edges for a Task shorter than a grid step", () => {
    const values = sliderMarks({ start: h(10, 1), end: h(10, 10) }).map((mark) => mark.value);
    expect(values).toEqual([h(10, 1), h(10, 10)]);
  });

  it("labels whole hours only", () => {
    const labelled = sliderMarks({ start: h(10, 1), end: h(12, 7) })
      .filter((mark) => mark.label !== undefined)
      .map((mark) => [mark.value, mark.label]);
    expect(labelled).toEqual([
      [h(11), "11:00"],
      [h(12), "12:00"],
    ]);
  });
});
