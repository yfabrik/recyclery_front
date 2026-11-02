import { describe, expect, it } from "vitest";
import {
  dayStripBounds,
  formatDuration,
  formatWindow,
  hourTicks,
  splitRows,
  taskMinuteWindow,
  totalMinutes,
  unavailableReasonText,
} from "./dayModel";
import { leaDay, makeTask, sophieDay, karimDay } from "../../../stories/fixtures/employeeDay";

describe("taskMinuteWindow", () => {
  it("reads a Task's UTC instants as Paris minutes (winter: UTC+1)", () => {
    const task = makeTask({ id: 1, name: "Tri", from: [8, 30], to: [11] });

    expect(taskMinuteWindow(task)).toEqual({ start: 8 * 60 + 30, end: 11 * 60 });
  });
});

describe("formatWindow / formatDuration", () => {
  it("pads clock times", () => {
    expect(formatWindow({ start: 9 * 60, end: 12 * 60 + 5 })).toBe("09:00–12:05");
  });

  it("writes minutes, whole hours and hours with minutes", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(5 * 60)).toBe("5 h");
    expect(formatDuration(90)).toBe("1 h 30");
    expect(formatDuration(0)).toBe("0 min");
  });
});

describe("totalMinutes", () => {
  it("sums the windows", () => {
    expect(totalMinutes([{ start: 60, end: 120 }, { start: 180, end: 210 }])).toBe(90);
    expect(totalMinutes([])).toBe(0);
  });
});

describe("dayStripBounds", () => {
  it("rounds outwards to whole hours around every window", () => {
    expect(dayStripBounds([{ start: 8 * 60 + 30, end: 11 * 60 }, { start: 13 * 60, end: 16 * 60 + 15 }])).toEqual({
      start: 8 * 60,
      end: 17 * 60,
    });
  });

  it("falls back to a working day when there is no window (no Workday, nothing assigned)", () => {
    expect(dayStripBounds([])).toEqual({ start: 8 * 60, end: 18 * 60 });
  });
});

describe("hourTicks", () => {
  it("has one tick per hour on a short axis", () => {
    expect(hourTicks({ start: 8 * 60, end: 11 * 60 })).toEqual([480, 540, 600, 660]);
  });

  it("has one tick every 2 hours once the axis is longer than 12 hours", () => {
    expect(hourTicks({ start: 6 * 60, end: 20 * 60 })).toEqual([360, 480, 600, 720, 840, 960, 1080, 1200]);
  });
});

describe("splitRows", () => {
  it("puts held Tasks in one column, assignable and unavailable Tasks in the other, keeping order", () => {
    const { assigned, others } = splitRows(leaDay.rows);

    expect(assigned.map((row) => row.task.name)).toEqual(["Tri arrivage", "Vente atelier"]);
    expect(others.map((row) => row.task.name)).toEqual(["Collecte"]);
  });

  it("keeps unavailable rows next to assignable ones", () => {
    const { assigned, others } = splitRows(sophieDay.rows);

    expect(assigned).toEqual([]);
    expect(others.map((row) => row.status)).toEqual(["unavailable", "unavailable", "assignable"]);
  });
});

describe("unavailableReasonText", () => {
  it("explains each reason", () => {
    expect(unavailableReasonText({ reason: "outside-hours" })).toBe("Hors de ses horaires de travail");
    expect(unavailableReasonText({ reason: "vacation" })).toBe("En congé");
  });

  it("names the Task that keeps the Employee busy", () => {
    const busy = karimDay.rows.find((row) => row.reason === "busy");

    expect(busy && unavailableReasonText(busy)).toBe("Déjà sur « Tri textile »");
    expect(unavailableReasonText({ reason: "busy" })).toBe("Déjà occupé");
  });

  it("still says something when the endpoint sends no reason", () => {
    expect(unavailableReasonText({})).toBe("Indisponible");
  });
});
