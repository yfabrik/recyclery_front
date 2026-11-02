import { afterEach, describe, expect, it, vi } from "vitest";
import { toIsoDateTime, toIsoTime } from "@recyclerie/api/domain/date";
import type { TimeRangeDto } from "@recyclerie/api/responses/timeRanges";
import {
  buildGridCells,
  employeeTimeRangeLists,
  formatRangeCell,
  slotOfRange,
  type PrintEntryTask,
} from "./printEntries";

const marie = { id: 1, nom: "Dupont", prenom: "Marie" };
const jean = { id: 2, nom: "Martin", prenom: "Jean" };

let nextRangeId = 1;
function range(
  employeeId: number,
  taskId: number,
  start: string,
  end: string,
): TimeRangeDto {
  return {
    id: nextRangeId++,
    employee_id: employeeId,
    task_id: taskId,
    start_time: toIsoTime(start),
    end_time: toIsoTime(end),
    createdAt: toIsoDateTime("2026-03-01T08:00:00.000Z"),
    updatedAt: toIsoDateTime("2026-03-01T08:00:00.000Z"),
  };
}

/** A real Task also carries its own start/end, which the print must ignore. */
type TestTask = PrintEntryTask & { start_time?: string; end_time?: string };

function task(overrides: Partial<TestTask> & { id: number }): TestTask {
  return {
    store_id: 1,
    name: "Tri",
    category: "sorting",
    scheduled_date: "2026-03-02T00:00:00.000Z",
    Recyclery: { name: "Centre" },
    Employees: [marie],
    timeRanges: [],
    ...overrides,
  };
}

const NO_SELECTION: number[] = [];

describe("employeeTimeRangeLists", () => {
  it("sorts a day's entries by Time range start, not by the Task's stale start_time date", () => {
    // Both Tasks come from schedules created on different days: the date part of
    // their start_time is stale, and the afternoon one carries the earlier date.
    const afternoon = task({
      id: 1,
      name: "Vente",
      start_time: "2026-01-05T13:00:00.000Z",
      end_time: "2026-01-05T17:00:00.000Z",
      timeRanges: [range(1, 1, "14:00", "17:00")],
    });
    const morning = task({
      id: 2,
      name: "Tri",
      start_time: "2026-02-20T08:00:00.000Z",
      end_time: "2026-02-20T12:00:00.000Z",
      timeRanges: [range(1, 2, "09:00", "12:00")],
    });

    const [list] = employeeTimeRangeLists({
      tasks: [afternoon, morning],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    expect(list.items.map((item) => formatRangeCell(item))).toEqual([
      "09:00-12:00 Tri",
      "14:00-17:00 Vente",
    ]);
  });

  it("sorts by date before time", () => {
    const tuesday = task({
      id: 1,
      name: "Mardi",
      scheduled_date: "2026-03-03T00:00:00.000Z",
      timeRanges: [range(1, 1, "08:00", "10:00")],
    });
    const monday = task({
      id: 2,
      name: "Lundi",
      timeRanges: [range(1, 2, "15:00", "17:00")],
    });

    const [list] = employeeTimeRangeLists({
      tasks: [tuesday, monday],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    expect(list.items.map((item) => item.name)).toEqual(["Lundi", "Mardi"]);
  });

  it("gives an Employee two entries, in order, when they have two Time ranges on one Task", () => {
    const split = task({
      id: 1,
      name: "Vente",
      timeRanges: [range(1, 1, "14:00", "17:00"), range(1, 1, "09:00", "11:30")],
    });

    const [list] = employeeTimeRangeLists({
      tasks: [split],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    expect(list.items.map((item) => formatRangeCell(item))).toEqual([
      "09:00-11:30 Vente",
      "14:00-17:00 Vente",
    ]);
    expect(list.items.map((item) => slotOfRange(item))).toEqual([
      "morning",
      "afternoon",
    ]);
  });

  it("keeps each Employee's own ranges in store mode", () => {
    const shared = task({
      id: 1,
      Employees: [marie, jean],
      timeRanges: [range(1, 1, "09:00", "12:00"), range(2, 1, "14:00", "17:00")],
    });

    const lists = employeeTimeRangeLists({
      tasks: [shared],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    expect(
      lists.map((list) => [
        list.employeeId,
        list.items.map((item) => `${item.start_time}-${item.end_time}`),
      ]),
    ).toEqual([
      [1, ["09:00-12:00"]],
      [2, ["14:00-17:00"]],
    ]);
  });

  it("keeps only the selected Employees in employee mode", () => {
    const shared = task({
      id: 1,
      Employees: [marie, jean],
      timeRanges: [range(1, 1, "09:00", "12:00"), range(2, 1, "14:00", "17:00")],
    });

    const lists = employeeTimeRangeLists({
      tasks: [shared],
      mode: "employees",
      selectedEmployeeIds: [2],
    });

    expect(lists.map((list) => list.employeeId)).toEqual([2]);
    expect(lists[0].employeeName).toBe("Jean Martin");
  });

  it("carries the date and the Task's name and category on each entry", () => {
    const [list] = employeeTimeRangeLists({
      tasks: [
        task({
          id: 1,
          name: "Collecte",
          category: "collection",
          timeRanges: [range(1, 1, "09:00", "10:00")],
        }),
      ],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    expect(list.items[0]).toMatchObject({
      date: "2026-03-02",
      start_time: "09:00",
      end_time: "10:00",
      name: "Collecte",
      category: "collection",
    });
  });

  it("shows the Store name only when the printed Tasks mix Stores", () => {
    const centre = task({ id: 1, timeRanges: [range(1, 1, "09:00", "10:00")] });
    const nord = task({
      id: 2,
      store_id: 2,
      Recyclery: { name: "Nord" },
      timeRanges: [range(1, 2, "10:00", "11:00")],
    });

    const mixed = employeeTimeRangeLists({
      tasks: [centre, nord],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });
    const single = employeeTimeRangeLists({
      tasks: [centre],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    expect(mixed[0].items.map((item) => item.storeName)).toEqual([
      "Centre",
      "Nord",
    ]);
    expect(single[0].items.map((item) => item.storeName)).toEqual([null]);
  });

  describe("an Assignment with no Time range", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("is skipped, without falling back to the Task's hours, and warns", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const orphan = task({
        id: 1,
        start_time: "2026-03-02T09:00:00.000Z",
        end_time: "2026-03-02T12:00:00.000Z",
        Employees: [marie, jean],
        timeRanges: [range(2, 1, "14:00", "16:00")],
      });

      const lists = employeeTimeRangeLists({
        tasks: [orphan],
        mode: "store",
        selectedEmployeeIds: NO_SELECTION,
      });

      expect(lists.map((list) => list.employeeId)).toEqual([2]);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("is skipped when the Task has no timeRanges at all", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const { timeRanges: _omitted, ...withoutRanges } = task({ id: 1 });

      expect(
        employeeTimeRangeLists({
          tasks: [withoutRanges],
          mode: "store",
          selectedEmployeeIds: NO_SELECTION,
        }),
      ).toEqual([]);
    });
  });
});

describe("slotOfRange", () => {
  it("puts a range starting at 11:45 in the morning", () => {
    expect(slotOfRange({ start_time: "11:45" })).toBe("morning");
  });

  it("puts a range starting at 12:00 in the afternoon", () => {
    expect(slotOfRange({ start_time: "12:00" })).toBe("afternoon");
  });

  it("goes by the start of a range that crosses noon", () => {
    expect(slotOfRange({ start_time: "11:00" })).toBe("morning");
  });
});

describe("buildGridCells", () => {
  const days = ["2026-03-02", "2026-03-03"];

  it("lists a range crossing noon once, in the morning cell, with its full text", () => {
    const [list] = employeeTimeRangeLists({
      tasks: [
        task({
          id: 1,
          name: "Vente",
          timeRanges: [range(1, 1, "11:00", "13:00")],
        }),
      ],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    const cells = buildGridCells(list.items, days);

    expect(cells["2026-03-02-morning"]).toEqual([
      { text: "11:00-13:00 Vente", storeName: null },
    ]);
    expect(cells["2026-03-02-afternoon"]).toEqual([]);
  });

  it("creates an empty morning and afternoon cell for every day", () => {
    expect(buildGridCells([], days)).toEqual({
      "2026-03-02-morning": [],
      "2026-03-02-afternoon": [],
      "2026-03-03-morning": [],
      "2026-03-03-afternoon": [],
    });
  });

  it("drops an entry whose date is outside the displayed days", () => {
    const [list] = employeeTimeRangeLists({
      tasks: [
        task({
          id: 1,
          scheduled_date: "2026-03-20T00:00:00.000Z",
          timeRanges: [range(1, 1, "09:00", "10:00")],
        }),
      ],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    const cells = buildGridCells(list.items, days);

    expect(Object.values(cells).flat()).toEqual([]);
  });

  it("keeps the Store name on the line when the entry has one", () => {
    const [list] = employeeTimeRangeLists({
      tasks: [
        task({ id: 1, timeRanges: [range(1, 1, "09:00", "10:00")] }),
        task({
          id: 2,
          store_id: 2,
          Recyclery: { name: "Nord" },
          timeRanges: [range(1, 2, "10:00", "11:00")],
        }),
      ],
      mode: "store",
      selectedEmployeeIds: NO_SELECTION,
    });

    expect(buildGridCells(list.items, days)["2026-03-02-morning"]).toEqual([
      { text: "09:00-10:00 Tri", storeName: "Centre" },
      { text: "10:00-11:00 Tri", storeName: "Nord" },
    ]);
  });
});
