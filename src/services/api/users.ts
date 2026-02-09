import type { AxiosResponse } from "axios";
import type { StoreModel, UserModel, WorkdaysModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/UserForm";

interface UserFilters {
  role?: "employee" | "admin";
  store_id?: number;
  active?: boolean;
  include?: string;
}

export const fetchUsers = (filters?: UserFilters): Promise<AxiosResponse<{ message: string, users: UserModel[] }>> =>
  axiosInstance.get("/api/users", { params: filters }); //TODO faut que role devienne un array
// export const getEmployees = () => axiosInstance.get("/api/users/employees")

export const createUser = (data: Schema) =>
  axiosInstance.post("/api/users", data);
export const updateUser = (id: number, data: Schema) =>
  axiosInstance.put(`/api/users/${id}`, data);
export const deleteUser = (id: number) =>
  axiosInstance.delete(`/api/users/${id}`);

export const updateUserPassword = (id: number, data: { password?: string }) =>
  axiosInstance.put(`/api/users/${id}/password`, data);

export const getRoles = () => axiosInstance.get("/api/users/roles");
export const getUsersStats = () => axiosInstance.get("/api/users/stats");

interface EmployeeStoreModel {
  employee_id: number;
  store_id: number;
  is_primary: boolean;
}


export const getAssignedStores = (employee_id: number): Promise<AxiosResponse<{ message: string, assignments: (StoreModel & { is_primary: boolean, EmployeeStore: { is_primary: boolean } })[] }>> =>
  axiosInstance.get(`/api/employee-stores/employee/${employee_id}`);

export const removeAssignedStores = (employee_id: number) =>
  axiosInstance.delete(`/api/employee-stores/employee/${employee_id}`);
export const addAssignedStore = (data: EmployeeStoreModel) =>
  axiosInstance.post("/api/employee-stores", data);

const DAY_OF_WEEK_FR = new Map([
  ["monday", "lundi"],
  ["tuesday", "mardi"],
  ["wednesday", "mercredi"],
  ["thursday", "jeudi"],
  ["friday", "vendredi"],
  ["saturday", "samedi"],
  ["sunday", "dimanche"],
]);

const DAY_OF_WEEK_EN = new Map([
  ["lundi", "monday"],
  ["mardi", "tuesday"],
  ["mercredi", "wednesday"],
  ["jeudi", "thursday"],
  ["vendredi", "friday"],
  ["samedi", "saturday"],
  ["dimanche", "sunday"],
]);

function parseTimeToDate(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(new Date().setHours(h ?? 0, m ?? 0));
}

/** Workday from API with start_time/end_time as Date and day_of_week in French */
export type WorkdaysModelTransformed = Omit<WorkdaysModel, "start_time" | "end_time"> & {
  start_time: Date;
  end_time: Date;
};

interface GetUserWorkdaysResponse {
  workdays?: WorkdaysModelTransformed[];
}

interface GetUserWorkdaysRawResponse {
  workdays?: WorkdaysModel[];
}

function transformWorkdaysResponse(
  data: GetUserWorkdaysRawResponse | string,
): GetUserWorkdaysResponse {
  const parsed: GetUserWorkdaysRawResponse =
    typeof data === "string" ? JSON.parse(data) : data;
  const raw = parsed?.workdays ?? [];
  const workdays: WorkdaysModelTransformed[] = raw.map((w) => ({
    ...w,
    day_of_week: DAY_OF_WEEK_FR.get(w.day_of_week) ?? "lundi",
    start_time: parseTimeToDate(w.start_time),
    end_time: parseTimeToDate(w.end_time),
  }));
  return { ...parsed, workdays };
}

export const getUserWorkdays = (id: number) =>
  axiosInstance.get<GetUserWorkdaysResponse>(`/api/employee-workdays/employee/${id}`, {
    transformResponse: [(data: GetUserWorkdaysRawResponse | string) => transformWorkdaysResponse(data)],
  });

/** Form payload shape: { week1: Workday[], week2: Workday[] } */
export interface WorkdaysFormPayload {
  week1: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_working: boolean;
    time_slot: "morning" | "afternoon";
  }>;
  week2: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_working: boolean;
    time_slot: "morning" | "afternoon";
  }>;
}

interface AddWorkdaysApiPayload {
  workdays: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_working: boolean;
    time_slot: "morning" | "afternoon";
    week: string;
  }>;
}

function transformWorkdaysPayload(data: WorkdaysFormPayload): AddWorkdaysApiPayload {
  const activeWorkdays = (Object.entries(data) as [keyof WorkdaysFormPayload, WorkdaysFormPayload["week1"]][])
    .flatMap(([key, arr]) =>
      arr.map((day) => ({
        ...day,
        day_of_week: DAY_OF_WEEK_EN.get(day.day_of_week) ?? day.day_of_week,
        week: key,
      })),
    )
    .filter((day) => day.is_working);
  return { workdays: activeWorkdays };
}

function transformWorkdaysRequest(data: WorkdaysFormPayload): string {
  return JSON.stringify(transformWorkdaysPayload(data));
}

export const addWorkdaysToUser = (id: number, data: WorkdaysFormPayload) =>
  axiosInstance.post(`/api/employee-workdays/employee/${id}`, data, {
    transformRequest: [(body: WorkdaysFormPayload) => transformWorkdaysRequest(body)],
  });
