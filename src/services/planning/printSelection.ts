export const PRINT_MODES = ["store", "employees"] as const;
export type PrintMode = (typeof PRINT_MODES)[number];

export type PrintEmployeeRef = {
  id: number;
  nom?: string;
  prenom?: string;
  fullName?: string;
};

export type PrintTask = {
  id: number;
  store_id: number | null;
  Employees?: PrintEmployeeRef[];
};

export type PrintableEmployee = {
  id: number;
  name: string;
};

export function printEmployeeName(employee: PrintEmployeeRef): string {
  const fromParts = `${employee.prenom ?? ""} ${employee.nom ?? ""}`.trim();
  return employee.fullName || fromParts || "Employé";
}

function assertNever(x: never): never {
  throw new Error(`unexpected print mode: ${String(x)}`);
}

export function filterPrintTasks<T extends PrintTask>(input: {
  mode: PrintMode;
  storeId: number | undefined;
  selectedEmployeeIds: readonly number[];
  tasks: readonly T[];
}): T[] {
  switch (input.mode) {
    case "store":
      if (input.storeId == null) {
        return [...input.tasks];
      }
      return input.tasks.filter((task) => task.store_id === input.storeId);
    case "employees": {
      if (input.selectedEmployeeIds.length === 0) {
        return [];
      }
      const selected = new Set(input.selectedEmployeeIds);
      return input.tasks.filter((task) =>
        (task.Employees ?? []).some((employee) => selected.has(employee.id)),
      );
    }
    default:
      input.mode satisfies never;
      return assertNever(input.mode);
  }
}

export function assigneesForPrint(
  task: PrintTask,
  mode: PrintMode,
  selectedEmployeeIds: readonly number[],
): PrintEmployeeRef[] {
  const assignees = task.Employees ?? [];
  switch (mode) {
    case "store":
      return [...assignees];
    case "employees": {
      const selected = new Set(selectedEmployeeIds);
      return assignees.filter((employee) => selected.has(employee.id));
    }
    default:
      mode satisfies never;
      return assertNever(mode);
  }
}

export function employeesWithAssignedTasks(
  tasks: readonly PrintTask[],
): PrintableEmployee[] {
  const byId = new Map<number, PrintableEmployee>();
  for (const task of tasks) {
    for (const employee of task.Employees ?? []) {
      if (!byId.has(employee.id)) {
        byId.set(employee.id, {
          id: employee.id,
          name: printEmployeeName(employee),
        });
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export function defaultSelectedEmployeeIds(
  tasks: readonly PrintTask[],
  storeId: number | undefined,
): number[] {
  const scoped =
    storeId == null
      ? tasks
      : tasks.filter((task) => task.store_id === storeId);
  const ids = new Set<number>();
  for (const task of scoped) {
    for (const employee of task.Employees ?? []) {
      ids.add(employee.id);
    }
  }
  return [...ids].sort((a, b) => a - b);
}

export function printedTasksMixStores(tasks: readonly PrintTask[]): boolean {
  const storeIds = new Set<number>();
  for (const task of tasks) {
    if (task.store_id != null) {
      storeIds.add(task.store_id);
    }
  }
  return storeIds.size > 1;
}
