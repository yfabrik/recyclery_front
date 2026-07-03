import type { AxiosResponse } from "axios";
import type {
  ListTaskSchedulesResponse,
  DetailTaskScheduleResponse,
  CreateCollectionPointPresenceResponse,
  UpdateTaskScheduleResponse,
  DeleteTaskScheduleResponse,
} from "@recyclerie/api/responses/taskSchedule";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/PresencePointForm";

/** 0 = Dimanche, 1 = Lundi, … (JS getDay order). API expects "Lundi", "Mardi", … */
const DAY_OF_WEEK_FR: Record<number, string> = {
  0: "Dimanche",
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
};

function presencePayloadToApi(body: Schema & { day_of_week?: number | string }): string {
  const day =
    typeof body.day_of_week === "number"
      ? DAY_OF_WEEK_FR[body.day_of_week] ?? String(body.day_of_week)
      : body.day_of_week;
  const payload = { ...body, day_of_week: day };
  return JSON.stringify(payload);
}

export const fetchCollectionPointPresence = (): Promise<
  AxiosResponse<ListTaskSchedulesResponse>
> => axiosInstance.get<ListTaskSchedulesResponse>("/api/collection-point-presence");

export const fetchPresenceForPoint = (
  id: number,
): Promise<AxiosResponse<DetailTaskScheduleResponse>> =>
  axiosInstance.get<DetailTaskScheduleResponse>(
    `/api/collection-point-presence/collection-point/${id}`,
  );

export const createPointPresence = (
  data: Schema,
): Promise<AxiosResponse<CreateCollectionPointPresenceResponse>> =>
  axiosInstance.post<CreateCollectionPointPresenceResponse>(
    "/api/collection-point-presence",
    data,
    {
      transformRequest: [
        (body: Schema & { day_of_week?: number | string }) =>
          presencePayloadToApi(body),
      ],
    },
  );

export const updatePointPresence = (
  id: number,
  data: Schema,
): Promise<AxiosResponse<UpdateTaskScheduleResponse>> =>
  axiosInstance.put<UpdateTaskScheduleResponse>(
    `/api/collection-point-presence/${id}`,
    data,
    {
      transformRequest: [
        (body: Schema & { day_of_week?: number | string }) =>
          presencePayloadToApi(body),
      ],
    },
  );

export const deletePointPresence = (
  id: number,
): Promise<AxiosResponse<DeleteTaskScheduleResponse>> =>
  axiosInstance.delete<DeleteTaskScheduleResponse>(
    `/api/collection-point-presence/${id}`,
  );
