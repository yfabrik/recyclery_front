import { describe, expect, it } from "vitest";
import {
  EMPLOYEES,
  inesOnVacationDay,
  karimDay,
  leaDay,
  marcDay,
  sophieDay,
} from "../../../stories/fixtures/employeeDay";
import { deriveDayRows, seedDayRanges, type DayRange } from "./localDay";

const summary = (rows: ReturnType<typeof deriveDayRows>) =>
  rows.map((row) => [row.task.name, row.status, row.reason] as const);

describe("seedDayRanges", () => {
  it("turns the Time ranges of every held Task into local ranges keyed by their server id", () => {
    const ranges = seedDayRanges(leaDay);

    expect(ranges.map(({ taskId, id, start, end }) => [taskId, id, start, end])).toEqual([
      [1, 100, 8 * 60 + 30, 9 * 60 + 30],
      [1, 101, 10 * 60, 11 * 60],
      [3, 300, 13 * 60, 15 * 60],
    ]);
    expect(ranges.every((range) => range.key === `server-${range.id}`)).toBe(true);
    expect(ranges.every((range) => range.employeeId === EMPLOYEES.lea.id)).toBe(true);
  });
});

describe("deriveDayRows from the server's own ranges", () => {
  it.each([
    ["Léa", leaDay],
    ["Sophie", sophieDay],
    ["Karim", karimDay],
    ["Marc", marcDay],
    ["Inès", inesOnVacationDay],
  ])("gives %s's day the statuses, reasons and free windows the endpoint sent", (_name, day) => {
    const rows = deriveDayRows(day, seedDayRanges(day));

    expect(rows.map((row) => row.task.id)).toEqual(day.rows.map((row) => row.task.id));
    expect(rows.map((row) => row.status)).toEqual(day.rows.map((row) => row.status));
    expect(rows.map((row) => row.reason)).toEqual(day.rows.map((row) => row.reason));
    expect(rows.map((row) => row.blockedBy?.id)).toEqual(day.rows.map((row) => row.blockedBy?.id));
    expect(rows.filter((row) => row.status === "assignable").map((row) => row.freeWindows)).toEqual(
      day.rows
        .filter((row) => row.status === "assignable")
        .map((row) =>
          row.freeWindows.map(({ start_time, end_time }) => ({
            start: Number(start_time.slice(0, 2)) * 60 + Number(start_time.slice(3)),
            end: Number(end_time.slice(0, 2)) * 60 + Number(end_time.slice(3)),
          })),
        ),
    );
  });

  it("lists an assigned Task's ranges earliest first", () => {
    const [tri] = deriveDayRows(leaDay, [...seedDayRanges(leaDay)].reverse());

    expect(tri?.ranges.map((range) => range.start)).toEqual([8 * 60 + 30, 10 * 60]);
  });
});

describe("deriveDayRows after local changes", () => {
  const local = (taskId: number, start: number, end: number): DayRange => ({
    key: `local-${taskId}`,
    id: null,
    employeeId: EMPLOYEES.karim.id,
    taskId,
    start,
    end,
  });

  it("makes a Task assigned as soon as the Employee holds a range on it", () => {
    const rows = deriveDayRows(leaDay, [...seedDayRanges(leaDay), local(2, 11 * 60, 13 * 60)]);

    expect(summary(rows).map(([, status]) => status)).toEqual(["assigned", "assigned", "assigned"]);
  });

  it("frees the Tasks a removed assignment was blocking, with their free window", () => {
    // Karim drops "Tri textile" (id 4): "Tri arrivage" (id 1) is no longer busy.
    const rows = deriveDayRows(karimDay, []);

    expect(summary(rows)).toEqual([
      ["Tri arrivage", "assignable", undefined],
      ["Tri textile", "assignable", undefined],
      ["Vente atelier", "assignable", undefined],
    ]);
    expect(rows[0]?.freeWindows).toEqual([{ start: 9 * 60, end: 11 * 60 }]);
  });

  it("blocks an overlapping Task behind the new range and names the Task holding it", () => {
    // Karim takes "Tri arrivage" on 09:00-11:00: "Tri textile" keeps only 11:00-12:00 ...
    const taking = deriveDayRows(karimDay, [local(1, 9 * 60, 11 * 60)]);
    expect(taking.find((row) => row.task.id === 4)?.freeWindows).toEqual([{ start: 11 * 60, end: 12 * 60 }]);

    // ... and with 09:00-12:00 taken, it has none left: busy, blocked by "Tri arrivage".
    const full = deriveDayRows(karimDay, [local(1, 9 * 60, 12 * 60)]);
    const textile = full.find((row) => row.task.id === 4);
    expect(textile?.status).toBe("unavailable");
    expect(textile?.reason).toBe("busy");
    expect(textile?.blockedBy?.id).toBe(1);
  });

  it("keeps a Task outside the Employee's hours unavailable whatever happens to the others", () => {
    const rows = deriveDayRows(sophieDay, []);

    expect(summary(rows).slice(0, 2)).toEqual([
      ["Tri arrivage", "unavailable", "outside-hours"],
      ["Collecte", "unavailable", "outside-hours"],
    ]);
  });

  it("makes every Task the Employee does not hold unavailable on a Vacation day, those just removed included", () => {
    const rows = deriveDayRows(inesOnVacationDay, []);

    expect(summary(rows).map(([, status, reason]) => `${status}/${reason}`)).toEqual([
      "unavailable/vacation",
      "unavailable/vacation",
      "unavailable/vacation",
    ]);
    // Tasks still held stay assigned: a Vacation conflict is shown, not hidden.
    const held = deriveDayRows(inesOnVacationDay, [local(1, 9 * 60, 10 * 60)]);
    expect(held.map((row) => row.status)).toEqual(["assigned", "unavailable", "unavailable"]);
  });
});
