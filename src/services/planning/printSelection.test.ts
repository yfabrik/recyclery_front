import { describe, expect, it } from "vitest";
import {
  assigneesForPrint,
  defaultSelectedEmployeeIds,
  employeesWithAssignedTasks,
  filterPrintTasks,
  printedTasksMixStores,
} from "./printSelection";

const marie = { id: 1, nom: "Dupont", prenom: "Marie", fullName: "Marie Dupont" };
const jean = { id: 2, nom: "Martin", prenom: "Jean", fullName: "Jean Martin" };

const centreMon = {
  id: 10,
  store_id: 1,
  Employees: [marie],
};
const nordTue = {
  id: 11,
  store_id: 2,
  Employees: [marie],
};
const centreJean = {
  id: 12,
  store_id: 1,
  Employees: [jean],
};
const unassigned = {
  id: 13,
  store_id: 1,
  Employees: [],
};

const weekTasks = [centreMon, nordTue, centreJean, unassigned];

describe("filterPrintTasks", () => {
  it("keeps only the selected Store's Tasks in store mode", () => {
    const printed = filterPrintTasks({
      mode: "store",
      storeId: 1,
      selectedEmployeeIds: [],
      tasks: weekTasks,
    });

    expect(printed.map((task) => task.id)).toEqual([10, 12, 13]);
  });

  it("keeps every Task when store mode has no Store filter", () => {
    const printed = filterPrintTasks({
      mode: "store",
      storeId: undefined,
      selectedEmployeeIds: [],
      tasks: weekTasks,
    });

    expect(printed.map((task) => task.id)).toEqual([10, 11, 12, 13]);
  });

  it("keeps Tasks assigned to the selected Employees, across Stores", () => {
    const printed = filterPrintTasks({
      mode: "employees",
      storeId: 1,
      selectedEmployeeIds: [1],
      tasks: weekTasks,
    });

    expect(printed.map((task) => task.id)).toEqual([10, 11]);
  });

  it("returns no Tasks when employee mode has an empty selection", () => {
    expect(
      filterPrintTasks({
        mode: "employees",
        storeId: 1,
        selectedEmployeeIds: [],
        tasks: weekTasks,
      }),
    ).toEqual([]);
  });
});

describe("assigneesForPrint", () => {
  it("keeps every assignee in store mode", () => {
    const shared = { id: 20, store_id: 1, Employees: [marie, jean] };
    expect(
      assigneesForPrint(shared, "store", [1]).map((employee) => employee.id),
    ).toEqual([1, 2]);
  });

  it("keeps only selected assignees in employee mode", () => {
    const shared = { id: 20, store_id: 1, Employees: [marie, jean] };
    expect(
      assigneesForPrint(shared, "employees", [1]).map((employee) => employee.id),
    ).toEqual([1]);
  });
});

describe("employeesWithAssignedTasks", () => {
  it("lists unique Employees who have at least one assigned Task", () => {
    expect(employeesWithAssignedTasks(weekTasks)).toEqual([
      { id: 2, name: "Jean Martin" },
      { id: 1, name: "Marie Dupont" },
    ]);
  });
});

describe("defaultSelectedEmployeeIds", () => {
  it("pre-selects Employees who have a Task at the current Store", () => {
    expect(defaultSelectedEmployeeIds(weekTasks, 1)).toEqual([1, 2]);
  });

  it("pre-selects every assigned Employee when no Store is selected", () => {
    expect(defaultSelectedEmployeeIds(weekTasks, undefined)).toEqual([1, 2]);
  });

  it("does not pre-select an Employee whose only Tasks are at another Store", () => {
    expect(defaultSelectedEmployeeIds(weekTasks, 2)).toEqual([1]);
  });
});

describe("printedTasksMixStores", () => {
  it("is true when printed Tasks belong to more than one Store", () => {
    expect(printedTasksMixStores([centreMon, nordTue])).toBe(true);
  });

  it("is false when every printed Task is at the same Store", () => {
    expect(printedTasksMixStores([centreMon, centreJean])).toBe(false);
  });

  it("is false when there are no printed Tasks", () => {
    expect(printedTasksMixStores([])).toBe(false);
  });
});
