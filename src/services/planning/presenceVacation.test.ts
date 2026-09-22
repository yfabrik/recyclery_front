import { describe, expect, it } from "vitest";
import {
  employeeIdsOnVacationOnDate,
  vacationOverlapsDate,
} from "./presenceVacation";

describe("vacationOverlapsDate", () => {
  it("includes the start and end dates", () => {
    const vacation = { start_date: "2026-09-01", end_date: "2026-09-03" };

    expect(vacationOverlapsDate(vacation, "2026-09-01")).toBe(true);
    expect(vacationOverlapsDate(vacation, "2026-09-03")).toBe(true);
  });

  it("includes a day in the middle of the range", () => {
    expect(
      vacationOverlapsDate(
        { start_date: "2026-09-01", end_date: "2026-09-03" },
        "2026-09-02",
      ),
    ).toBe(true);
  });

  it("excludes days outside the range", () => {
    const vacation = { start_date: "2026-09-01", end_date: "2026-09-03" };

    expect(vacationOverlapsDate(vacation, "2026-08-31")).toBe(false);
    expect(vacationOverlapsDate(vacation, "2026-09-04")).toBe(false);
  });
});

describe("employeeIdsOnVacationOnDate", () => {
  it("returns only employees whose Vacation covers that date", () => {
    const vacations = [
      { employee_id: 1, start_date: "2026-09-01", end_date: "2026-09-03" },
      { employee_id: 2, start_date: "2026-09-07", end_date: "2026-09-10" },
      { employee_id: 3, start_date: "2026-09-02", end_date: "2026-09-02" },
    ];

    expect([...employeeIdsOnVacationOnDate(vacations, "2026-09-02")].sort()).toEqual(
      [1, 3],
    );
  });

  it("returns an empty set when nobody is on Vacation that date", () => {
    expect(
      employeeIdsOnVacationOnDate(
        [{ employee_id: 1, start_date: "2026-09-01", end_date: "2026-09-03" }],
        "2026-09-04",
      ).size,
    ).toBe(0);
  });
});
