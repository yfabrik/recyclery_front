import { isoDateSchema } from "@recyclerie/api/primitives/zod";
import { describe, expect, it } from "vitest";
import {
  conflictCountAmong,
  taskCountsByDay,
  vacationConflicts,
  weekMarkersByWeekday,
  type MarkerTask,
} from "./weekTaskMarkers";

const date = (value: string) => isoDateSchema("date").parse(value);

// Week of Monday 2026-01-12 .. Sunday 2026-01-18 (Paris is UTC+1 in January).
const MONDAY = date("2026-01-12");

const task = (id: number, scheduledDate: string, employeeIds: number[]): MarkerTask => ({
  id,
  scheduled_date: scheduledDate,
  Employees: employeeIds.map((employeeId) => ({ id: employeeId })),
});

describe("taskCountsByDay", () => {
  it("counts the distinct Tasks of each Employee on each day", () => {
    const counts = taskCountsByDay([
      task(1, "2026-01-12T00:00:00.000Z", [10, 11]),
      task(2, "2026-01-12T00:00:00.000Z", [10]),
      task(3, "2026-01-13T00:00:00.000Z", [10]),
    ]);

    expect(counts.get(date("2026-01-12"))).toEqual(
      new Map([
        [10, 2],
        [11, 1],
      ]),
    );
    expect(counts.get(date("2026-01-13"))).toEqual(new Map([[10, 1]]));
  });

  it("counts a Task once for an Employee listed twice on it", () => {
    const counts = taskCountsByDay([task(1, "2026-01-12T00:00:00.000Z", [10, 10])]);

    expect(counts.get(date("2026-01-12"))?.get(10)).toBe(1);
  });

  it("ignores Tasks without Employees, or listed without the Employees include", () => {
    const counts = taskCountsByDay([
      task(1, "2026-01-12T00:00:00.000Z", []),
      { id: 2, scheduled_date: "2026-01-12T00:00:00.000Z" },
    ]);

    expect(counts.size).toBe(0);
  });

  it("puts a Task on the Paris day of its scheduled date", () => {
    // 23:30 UTC on the 12th is 00:30 on the 13th in Paris.
    const counts = taskCountsByDay([task(1, "2026-01-12T23:30:00.000Z", [10])]);

    expect(counts.has(date("2026-01-12"))).toBe(false);
    expect(counts.get(date("2026-01-13"))?.get(10)).toBe(1);
  });
});

describe("vacationConflicts", () => {
  const counts = new Map([
    [10, 2],
    [11, 1],
  ]);

  it("keeps the Employees on Vacation who hold Tasks, with their count", () => {
    expect(vacationConflicts(counts, new Set([10]))).toEqual(new Map([[10, 2]]));
  });

  it("ignores Employees on Vacation without a Task", () => {
    expect(vacationConflicts(counts, new Set([12]))).toEqual(new Map());
  });

  it("ignores Employees with Tasks who are not on Vacation", () => {
    expect(vacationConflicts(counts, new Set())).toEqual(new Map());
    expect(vacationConflicts(counts, undefined)).toEqual(new Map());
  });
});

describe("weekMarkersByWeekday", () => {
  const tasks = [
    task(1, "2026-01-12T00:00:00.000Z", [10, 11]), // Monday
    task(2, "2026-01-15T00:00:00.000Z", [10]), // Thursday
    task(3, "2026-01-15T00:00:00.000Z", [10, 12]),
    task(4, "2026-01-18T00:00:00.000Z", [11]), // Sunday
  ];

  it("crosses each day's Task counts with that day's Vacations", () => {
    const markers = weekMarkersByWeekday({
      tasks,
      weekStart: MONDAY,
      vacationEmployeeIdsByDay: {
        1: new Set([12]), // on Vacation Monday, but no Task that day
        4: new Set([10, 12]), // Thursday: 10 holds 2 Tasks, 12 holds 1
        0: new Set([10]), // Sunday: 10 holds nothing
      },
    });

    expect(markers[1]?.taskCounts).toEqual(
      new Map([
        [10, 1],
        [11, 1],
      ]),
    );
    expect(markers[1]?.conflicts).toEqual(new Map());
    expect(markers[4]?.taskCounts).toEqual(
      new Map([
        [10, 2],
        [12, 1],
      ]),
    );
    expect(markers[4]?.conflicts).toEqual(
      new Map([
        [10, 2],
        [12, 1],
      ]),
    );
    expect(markers[0]?.taskCounts).toEqual(new Map([[11, 1]]));
    expect(markers[0]?.conflicts).toEqual(new Map());
  });

  it("has no entry for a day without assigned Tasks", () => {
    const markers = weekMarkersByWeekday({ tasks, weekStart: MONDAY, vacationEmployeeIdsByDay: {} });

    expect(markers[2]).toBeUndefined();
    expect(markers[6]).toBeUndefined();
  });

  it("ignores Tasks outside the displayed week", () => {
    const markers = weekMarkersByWeekday({
      tasks: [task(9, "2026-01-19T00:00:00.000Z", [10]), task(8, "2026-01-11T00:00:00.000Z", [10])],
      weekStart: MONDAY,
      vacationEmployeeIdsByDay: { 1: new Set([10]), 0: new Set([10]) },
    });

    expect(markers).toEqual({});
  });
});

describe("conflictCountAmong", () => {
  const markers = {
    taskCounts: new Map([
      [10, 2],
      [11, 1],
    ]),
    conflicts: new Map([[10, 2]]),
  };

  it("counts conflicting Employees once, however many badges they have", () => {
    expect(conflictCountAmong(markers, [10, 11, 10])).toBe(1);
  });

  it("only counts the Employees the card lists", () => {
    expect(conflictCountAmong(markers, [11])).toBe(0);
  });
});
