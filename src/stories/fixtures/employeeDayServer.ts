/**
 * A fake server for the Employee day dialog stories: `GET /api/employees/:id/tasks` answers
 * with the day as the stories' writes have left it, and the existing task write endpoints
 * (assign, remove, and the Time range create/update/delete) change it and are logged.
 *
 * The day is changed the simple way (a row becomes `assigned`/`assignable`); the other rows
 * are not recomputed, the dialog derives those itself. What matters to the stories is that a
 * refetch after a refused write returns the day as the server really holds it.
 */
import type { EmployeeTaskRowDto, EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import type { IsoTime } from "@recyclerie/api/primitives/zod";
import type { AxiosRequestConfig } from "axios";
import { apiError, ok, type FakeServer } from "../fakeAxios";
import { makeRange } from "./employeeDay";

export interface FakeWrite {
  method: "POST" | "PUT" | "DELETE";
  url: string;
  /** The request body (`undefined` for a DELETE). */
  body: unknown;
}

export interface FakeApiError {
  status: number;
  message: string;
}

export interface EmployeeDayServerOptions {
  employeeId: number;
  /** The day the server holds when the story starts. */
  day: EmployeeTasksDayDto;
  /** Every `GET /api/employees/:id/tasks` is answered with this error. */
  failReadsWith?: FakeApiError;
  /** Return an error to refuse that write (nothing is changed), or nothing to accept it. */
  rejectWrite?: (write: FakeWrite) => FakeApiError | undefined;
  /** Return a delay in milliseconds to answer that write late (the day changes when it is answered). */
  delayWrite?: (write: FakeWrite) => number | undefined;
  /** Called with the URL and params of each read. */
  onRead?: (url: string, params: unknown) => void;
  /** Called with each write received, refused ones included. */
  onWrite?: (write: FakeWrite) => void;
}

type TimeRangeBody = { start_time: IsoTime; end_time: IsoTime };

const ASSIGN_URL = /^\/api\/tasks\/(\d+)\/employees$/;
const EMPLOYEE_URL = /^\/api\/tasks\/(\d+)\/employees\/(\d+)$/;
const RANGE_URL = /^\/api\/tasks\/(\d+)\/employees\/(\d+)\/time-ranges(?:\/(\d+))?$/;

export function createEmployeeDayServer({
  employeeId,
  day,
  failReadsWith,
  rejectWrite,
  delayWrite,
  onRead,
  onWrite,
}: EmployeeDayServerOptions) {
  const current: EmployeeTasksDayDto = structuredClone(day);
  let nextRangeId = 9000;
  const writes: FakeWrite[] = [];

  const rowOf = (taskId: string | undefined): EmployeeTaskRowDto | undefined =>
    current.rows.find((row) => String(row.task.id) === taskId);

  /** Logs the write, then refuses it (a rejected promise) or lets `apply` change the day, possibly late. */
  const write = (method: FakeWrite["method"], url: string, body: unknown, apply: () => unknown) => {
    const received: FakeWrite = { method, url, body };
    writes.push(received);
    onWrite?.(received);
    const refusal = rejectWrite?.(received);
    const respond = () => (refusal ? apiError(refusal.status, refusal.message) : ok(apply()));
    const delay = delayWrite?.(received);
    return delay ? new Promise((resolve) => setTimeout(resolve, delay)).then(respond) : respond();
  };

  const server: FakeServer = {
    get: (url, config: AxiosRequestConfig | undefined) => {
      if (url !== `/api/employees/${employeeId}/tasks`) return Promise.reject(new Error(`Unhandled GET ${url}`));
      onRead?.(url, config?.params);
      if (failReadsWith) return apiError(failReadsWith.status, failReadsWith.message);
      return ok({ employee_id: employeeId, days: [structuredClone(current)] });
    },

    post: (url, _config, body) => {
      const assign = ASSIGN_URL.exec(url);
      const create = RANGE_URL.exec(url);
      const { start_time, end_time } = body as TimeRangeBody;
      if (assign) {
        const row = rowOf(assign[1]);
        return write("POST", url, body, () => {
          const created = makeRange(nextRangeId++, employeeId, Number(assign[1]), start_time, end_time);
          if (row) Object.assign(row, { status: "assigned", timeRanges: [created] });
          return created;
        });
      }
      if (create) {
        const row = rowOf(create[1]);
        return write("POST", url, body, () => {
          const created = makeRange(nextRangeId++, employeeId, Number(create[1]), start_time, end_time);
          row?.timeRanges.push(created);
          return created;
        });
      }
      return Promise.reject(new Error(`Unhandled POST ${url}`));
    },

    put: (url, _config, body) => {
      const match = RANGE_URL.exec(url);
      if (!match?.[3]) return Promise.reject(new Error(`Unhandled PUT ${url}`));
      const { start_time, end_time } = body as TimeRangeBody;
      return write("PUT", url, body, () => {
        const range = rowOf(match[1])?.timeRanges.find((candidate) => String(candidate.id) === match[3]);
        if (range) Object.assign(range, { start_time, end_time });
        return range;
      });
    },

    delete: (url) => {
      const employee = EMPLOYEE_URL.exec(url);
      if (employee) {
        const row = rowOf(employee[1]);
        return write("DELETE", url, undefined, () => {
          if (row) Object.assign(row, { status: "assignable", timeRanges: [] });
          return { removed: true };
        });
      }
      const range = RANGE_URL.exec(url);
      if (range?.[3]) {
        const row = rowOf(range[1]);
        return write("DELETE", url, undefined, () => {
          if (row) row.timeRanges = row.timeRanges.filter((candidate) => String(candidate.id) !== range[3]);
          return { removed: true };
        });
      }
      return Promise.reject(new Error(`Unhandled DELETE ${url}`));
    },
  };

  return { server, writes, getDay: () => structuredClone(current) };
}
