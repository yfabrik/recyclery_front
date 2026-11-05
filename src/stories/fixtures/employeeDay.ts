/**
 * Fixtures for the Employee day dialog stories: the payload of
 * `GET /api/employees/:id/tasks` for a few typical days (Thursday 2026-01-15).
 *
 * Task times are UTC instants; in January Paris is UTC+1, so a Task running
 * 08:00-11:00 Paris carries `07:00Z`-`10:00Z`. `at(8)` / `at(8, 30)` take Paris time.
 */
import {
  isoDateSchema,
  isoDateTimeSchema,
  isoTimeSchema,
  type IsoDate,
  type IsoDateTime,
  type IsoTime,
} from "@recyclerie/api/primitives/zod";
import type {
  EmployeeTaskRowDto,
  EmployeeTasksDayDto,
  EmployeeTaskUnavailableReason,
} from "@recyclerie/api/responses/employeeTasks";
import type { EmployeeDto } from "@recyclerie/api/responses/employees";
import type { TaskDto } from "@recyclerie/api/responses/tasks";
import type { TimeRangeDto, WorkWindowDto } from "@recyclerie/api/responses/timeRanges";
import type { EmployeeVacationDto } from "@recyclerie/api/responses/vacations";

export const DAY: IsoDate = isoDateSchema("date").parse("2026-01-15");
const CREATED: IsoDateTime = isoDateTimeSchema("date").parse("2026-01-01T00:00:00.000Z");

const pad = (value: number) => String(value).padStart(2, "0");

/** Paris clock time `HH:MM` as the API sends it for Time ranges and work windows. */
export const hm = (hours: number, minutes = 0): IsoTime =>
  isoTimeSchema("heure").parse(`${pad(hours)}:${pad(minutes)}`);

/** The UTC instant of a Paris clock time on `DAY` (January: Paris = UTC+1). */
const at = (hours: number, minutes = 0): IsoDateTime =>
  isoDateTimeSchema("date").parse(`${DAY}T${pad(hours - 1)}:${pad(minutes)}:00.000Z`);

export const STORES = {
  centre: { id: 1, name: "Magasin centre", city: "Lille", is_active: true },
  nord: { id: 2, name: "Magasin nord", city: "Tourcoing", is_active: true },
};

export const makeEmployee = (id: number, prenom: string, nom: string): EmployeeDto => ({
  id,
  nom,
  prenom,
  fullName: `${prenom} ${nom}`,
  isActive: true,
  phone: null,
  email: null,
  createdAt: CREATED,
  updatedAt: CREATED,
});

export const EMPLOYEES = {
  lea: makeEmployee(1, "Léa", "Martin"),
  karim: makeEmployee(2, "Karim", "Benali"),
  sophie: makeEmployee(3, "Sophie", "Durand"),
  marc: makeEmployee(4, "Marc", "Petit"),
  ines: makeEmployee(5, "Inès", "Roux"),
};

interface TaskSpec {
  id: number;
  name: string;
  /** Paris `[hours, minutes]`. */
  from: readonly [number, number?];
  to: readonly [number, number?];
  store?: keyof typeof STORES | null;
}

export const makeTask = ({ id, name, from, to, store = "centre" }: TaskSpec): TaskDto => ({
  id,
  name,
  description: null,
  category: "custom",
  priority: "medium",
  required_skills: null,
  location: null,
  equipment_needed: null,
  hourly_rate: null,
  scheduled_date: isoDateTimeSchema("date").parse(`${DAY}T00:00:00.000Z`),
  start_time: at(...from),
  end_time: at(...to),
  notes: null,
  status: "pending",
  schedule_id: null,
  store_id: store ? STORES[store].id : null,
  collection_point_id: null,
  createdAt: CREATED,
  updatedAt: CREATED,
  day_of_week: 4,
  Recyclery: store ? STORES[store] : null,
});

export const makeRange = (
  id: number,
  employeeId: number,
  taskId: number,
  from: IsoTime,
  to: IsoTime,
): TimeRangeDto => ({
  id,
  employee_id: employeeId,
  task_id: taskId,
  start_time: from,
  end_time: to,
  createdAt: CREATED,
  updatedAt: CREATED,
});

const window_ = (from: IsoTime, to: IsoTime): WorkWindowDto => ({ start_time: from, end_time: to });

const assigned = (
  task: TaskDto,
  employeeId: number,
  ranges: readonly (readonly [IsoTime, IsoTime])[],
  freeWindows: WorkWindowDto[],
): EmployeeTaskRowDto => ({
  task,
  status: "assigned",
  timeRanges: ranges.map(([from, to], index) => makeRange(task.id * 100 + index, employeeId, task.id, from, to)),
  freeWindows,
});

const assignable = (task: TaskDto, freeWindows: WorkWindowDto[]): EmployeeTaskRowDto => ({
  task,
  status: "assignable",
  timeRanges: [],
  freeWindows,
});

const unavailable = (
  task: TaskDto,
  reason: EmployeeTaskUnavailableReason,
  blockedBy?: TaskDto,
): EmployeeTaskRowDto => ({
  task,
  status: "unavailable",
  timeRanges: [],
  freeWindows: [],
  reason,
  ...(blockedBy ? { blockedBy } : {}),
});

const TRI = makeTask({ id: 1, name: "Tri arrivage", from: [8], to: [11] });
const COLLECTE = makeTask({ id: 2, name: "Collecte", from: [11], to: [13] });
const VENTE = makeTask({ id: 3, name: "Vente atelier", from: [13], to: [16], store: "nord" });

/** Léa works 08:00-16:00 and holds two Tasks (two Time ranges on the first); one Task is still free. */
export const leaDay: EmployeeTasksDayDto = {
  date: DAY,
  workWindows: [window_(hm(8), hm(16))],
  vacation: null,
  rows: [
    assigned(TRI, EMPLOYEES.lea.id, [[hm(8, 30), hm(9, 30)], [hm(10), hm(11)]], [window_(hm(8), hm(11))]),
    assignable(COLLECTE, [window_(hm(11), hm(13))]),
    assigned(VENTE, EMPLOYEES.lea.id, [[hm(13), hm(15)]], [window_(hm(13), hm(16))]),
  ],
};

/** Sophie only works in the afternoon (13:00-17:00): the morning Task is out of hours. */
export const sophieDay: EmployeeTasksDayDto = {
  date: DAY,
  workWindows: [window_(hm(13), hm(17))],
  vacation: null,
  rows: [
    unavailable(TRI, "outside-hours"),
    unavailable(COLLECTE, "outside-hours"),
    assignable(VENTE, [window_(hm(13), hm(16))]),
  ],
};

const TEXTILE = makeTask({ id: 4, name: "Tri textile", from: [9], to: [12] });

/** Karim works 09:00-17:00 and holds "Tri textile" 09:00-12:00, so "Tri arrivage" is busy for him. */
export const karimDay: EmployeeTasksDayDto = {
  date: DAY,
  workWindows: [window_(hm(9), hm(17))],
  vacation: null,
  rows: [
    unavailable(TRI, "busy", TEXTILE),
    assigned(TEXTILE, EMPLOYEES.karim.id, [[hm(9), hm(12)]], [window_(hm(9), hm(12))]),
    assignable(VENTE, [window_(hm(13), hm(16))]),
  ],
};

/** Marc holds every Task of the day: nothing is left to assign. */
export const marcDay: EmployeeTasksDayDto = {
  date: DAY,
  workWindows: [window_(hm(8), hm(16))],
  vacation: null,
  rows: [
    assigned(TRI, EMPLOYEES.marc.id, [[hm(8), hm(11)]], [window_(hm(8), hm(11))]),
    assigned(COLLECTE, EMPLOYEES.marc.id, [[hm(11), hm(13)]], [window_(hm(11), hm(13))]),
  ],
};

/** No Workday that day and no Task planned. */
export const emptyDay: EmployeeTasksDayDto = {
  date: DAY,
  workWindows: [],
  vacation: null,
  rows: [],
};

/** A paid Vacation covering `DAY` (Wednesday to Friday of that week). */
export const paidVacation = (employeeId: number): EmployeeVacationDto => ({
  id: 70 + employeeId,
  employee_id: employeeId,
  start_date: isoDateSchema("date").parse("2026-01-14"),
  end_date: isoDateSchema("date").parse("2026-01-16"),
  reason: "paid_vacation",
  notes: null,
  createdAt: CREATED,
  updatedAt: CREATED,
});

/**
 * Inès works 08:00-16:00 but is on Vacation and holds nothing: the server turns every Task
 * of the day into an unavailable "vacation" row, no Task can be assigned to her.
 */
export const inesOnVacationDay: EmployeeTasksDayDto = {
  date: DAY,
  workWindows: [window_(hm(8), hm(16))],
  vacation: paidVacation(EMPLOYEES.ines.id),
  rows: [
    unavailable(TRI, "vacation"),
    unavailable(COLLECTE, "vacation"),
    unavailable(VENTE, "vacation"),
  ],
};

/**
 * A Vacation conflict: Inès is on Vacation (added after her Assignments, which stay) yet holds
 * "Tri arrivage" and "Collecte". The Task she does not hold is unavailable to her.
 */
export const inesVacationConflictDay: EmployeeTasksDayDto = {
  date: DAY,
  workWindows: [window_(hm(8), hm(16))],
  vacation: paidVacation(EMPLOYEES.ines.id),
  rows: [
    assigned(TRI, EMPLOYEES.ines.id, [[hm(8), hm(11)]], [window_(hm(8), hm(11))]),
    assigned(COLLECTE, EMPLOYEES.ines.id, [[hm(11), hm(13)]], [window_(hm(11), hm(13))]),
    unavailable(VENTE, "vacation"),
  ],
};
