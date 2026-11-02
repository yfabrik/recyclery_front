import { describe, expect, it } from "vitest";
import { MORNING_ENDS_AT_MINUTES, timeSlotOfMinutes } from "./workdayTimeSlots";

describe("timeSlotOfMinutes", () => {
  it("puts the last minute before 12:00 in the morning", () => {
    expect(timeSlotOfMinutes(11 * 60 + 59)).toBe("morning");
  });

  it("puts 12:00 itself in the afternoon", () => {
    expect(timeSlotOfMinutes(12 * 60)).toBe("afternoon");
  });

  it("puts midnight in the morning and the evening in the afternoon", () => {
    expect(timeSlotOfMinutes(0)).toBe("morning");
    expect(timeSlotOfMinutes(18 * 60)).toBe("afternoon");
  });

  it("cuts at 12:00", () => {
    expect(MORNING_ENDS_AT_MINUTES).toBe(720);
  });
});
