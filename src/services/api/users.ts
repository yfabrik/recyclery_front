import type {
  AssignEmployeeStoreResponse,
  EmployeeStoreByEmployeeResponse,
  RemoveEmployeeStoreResponse,
} from "@recyclerie/api/responses/employeeStore";
import type {
  CreateEmployeeWorkdaysResponse,
  ListEmployeeWorkdaysResponse,
} from "@recyclerie/api/responses/employeeWorkdays";
import type {
  CreateUserResponse,
  DeleteUserResponse,
  ListUsersResponse,
  UpdateUserPasswordResponse,
  UpdateUserResponse,
  UserStatsResponse,
} from "@recyclerie/api/responses/users";
import type { AssignEmployeeStoreInput } from "@recyclerie/api/schemas/employeeStore";
import type { UserAdminUpdatePasswordInput, UserCreateInput, UserListFilterInput, UserUpdateInput } from "@recyclerie/api/schemas/users";
import type { AxiosResponse } from "axios";
import type { EmployeeModel, UserModel, WorkdaysModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// interface UserFilters {
//   role?: UserRole;
//   store_id?: number;
//   active?: boolean;
//   include?: string;
// }
// export type { UserListFilter as UserFilters };

export const fetchUsers = (
  filters?: UserListFilterInput,
): Promise<AxiosResponse<ListUsersResponse>> =>
  axiosInstance.get<ListUsersResponse>("/api/users", { params: filters });

export const createUser = (
  data: UserCreateInput,
): Promise<AxiosResponse<CreateUserResponse>> =>
  axiosInstance.post<CreateUserResponse>("/api/users", data);

export const updateUser = (
  id: UserModel["id"],
  data: UserUpdateInput,
): Promise<AxiosResponse<UpdateUserResponse>> =>
  axiosInstance.put<UpdateUserResponse>(`/api/users/${id}`, data);

export const deleteUser = (
  id: UserModel["id"],
): Promise<AxiosResponse<DeleteUserResponse>> =>
  axiosInstance.delete<DeleteUserResponse>(`/api/users/${id}`);

export const updateUserPassword = (
  id: UserModel["id"],
  data: UserAdminUpdatePasswordInput,
): Promise<AxiosResponse<UpdateUserPasswordResponse>> =>
  axiosInstance.patch<UpdateUserPasswordResponse>(
    `/api/users/${id}/password`,
    data,
  );

export const getRoles = () => axiosInstance.get("/api/users/roles");

export const getUsersStats = (): Promise<AxiosResponse<UserStatsResponse>> =>
  axiosInstance.get<UserStatsResponse>("/api/users/stats");

//TODO c'est pas sa place ici
export const getAssignedStores = (
  employee_id: EmployeeModel["id"],
): Promise<AxiosResponse<EmployeeStoreByEmployeeResponse>> =>
  axiosInstance.get<EmployeeStoreByEmployeeResponse>(
    `/api/employee-stores/employee/${employee_id}`,
  );
//TODO c'est pas sa place ici
export const removeAssignedStores = (
  employee_id: EmployeeModel["id"],
): Promise<AxiosResponse<RemoveEmployeeStoreResponse>> =>
  axiosInstance.delete<RemoveEmployeeStoreResponse>(
    `/api/employee-stores/employee/${employee_id}`,
  );

//TODO c'est pas sa place ici
export const addAssignedStore = (
  data: AssignEmployeeStoreInput,
): Promise<AxiosResponse<AssignEmployeeStoreResponse>> =>
  axiosInstance.post<AssignEmployeeStoreResponse>("/api/employee-stores", data);

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
export type WorkdaysModelTransformed = Omit<
  WorkdaysModel,
  "start_time" | "end_time" | "day_of_week"
> & {
  start_time: Date;
  end_time: Date;
  time_slot: "morning" | "afternoon";
  day_of_week: string;
};

interface GetUserWorkdaysResponse {
  workdays?: WorkdaysModelTransformed[];
}

function transformWorkdaysResponse(
  data: ListEmployeeWorkdaysResponse | string,
): GetUserWorkdaysResponse {
  const parsed: ListEmployeeWorkdaysResponse =
    typeof data === "string" ? JSON.parse(data) : data;
  const raw = parsed?.data ?? [];
  const workdays: WorkdaysModelTransformed[] = raw.map((w) => ({
    ...w,
    day_of_week: DAY_OF_WEEK_FR.get(w.day_of_week) ?? w.day_of_week,
    time_slot: w.time_slot === "afternoon" ? "afternoon" : "morning",
    start_time: parseTimeToDate(w.start_time),
    end_time: parseTimeToDate(w.end_time),
  }));
  return { workdays };
}

//TODO rename
export const getUserWorkdays = (id: EmployeeModel["id"]) =>
  axiosInstance.get<GetUserWorkdaysResponse>(`/api/employee-workdays/employee/${id}`, {
    transformResponse: [(data: ListEmployeeWorkdaysResponse | string) => transformWorkdaysResponse(data)],
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

export const addWorkdaysToUser = (
  id: EmployeeModel["id"],
  data: WorkdaysFormPayload,
): Promise<AxiosResponse<CreateEmployeeWorkdaysResponse>> =>
  axiosInstance.post<CreateEmployeeWorkdaysResponse>(
    `/api/employee-workdays/employee/${id}`,
    data,
    {
      transformRequest: [(body: WorkdaysFormPayload) => transformWorkdaysRequest(body)],
    },
  );
