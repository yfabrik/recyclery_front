import { isoDateSchema } from "@recyclerie/api/primitives/zod";
import { describe, expect, it } from "vitest";
import { dateOfWeekday, formatDayLong } from "./employeeDayDate";

const date = (value: string) => isoDateSchema("date").parse(value);

describe("dateOfWeekday", () => {
  // Monday 2026-01-12 .. Sunday 2026-01-18
  const monday = date("2026-01-12");

  it("is the Monday plus the weekday's index, Monday first", () => {
    expect(dateOfWeekday(monday, 1)).toBe("2026-01-12");
    expect(dateOfWeekday(monday, 4)).toBe("2026-01-15");
    expect(dateOfWeekday(monday, 6)).toBe("2026-01-17");
  });

  it("puts Sunday (weekday 0) at the end of the week", () => {
    expect(dateOfWeekday(monday, 0)).toBe("2026-01-18");
  });

  it("crosses month, year and daylight-saving boundaries", () => {
    expect(dateOfWeekday(date("2025-12-29"), 5)).toBe("2026-01-02");
    expect(dateOfWeekday(date("2026-03-23"), 0)).toBe("2026-03-29");
    expect(dateOfWeekday(date("2026-10-26"), 0)).toBe("2026-11-01");
  });
});

describe("formatDayLong", () => {
  it("writes the French weekday, day and month of a calendar date", () => {
    expect(formatDayLong(date("2026-01-15"))).toBe("jeudi 15 janvier");
    expect(formatDayLong(date("2026-01-12"))).toBe("lundi 12 janvier");
    expect(formatDayLong(date("2026-03-01"))).toBe("dimanche 1 mars");
  });
});
