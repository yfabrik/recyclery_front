import type { AxiosResponse } from "axios";
import type { RecycleryFilter } from "@recyclerie/api/schemas/recycleries";
import type {
  OpenCashSessionBody,
  CloseCashSessionBody,
} from "@recyclerie/api/schemas/cashSession";
import type {
  ListRecycleriesResponse,
  DetailRecycleryResponse,
  CreateRecycleryResponse,
  UpdateRecycleryResponse,
  DeleteRecycleryResponse,
  ListRecycleryCashRegistersResponse,
} from "@recyclerie/api/responses/recycleries";
import type {
  DetailCashRegisterResponse,
  CreateCashRegisterResponse,
  DeleteCashRegisterResponse,
} from "@recyclerie/api/responses/cashRegister";
import type {
  ActiveCashSessionResponse,
  OpenCashSessionResponse,
  CloseCashSessionResponse,
  DetailCashSessionResponse,
} from "@recyclerie/api/responses/cashSession";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/StoreForm";

export type StorePayload = Omit<
  Schema,
  "manager_id" | "postal_code" | "phone" | "email"
> & {
  manager_id: number | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
};

export type { RecycleryFilter };

type RecycleryQuery = Partial<RecycleryFilter> & {
  include?: RecycleryFilter["include"] | ("manager" | "caisses" | "employees" | "horaires")[];
};

const withIncludeParam = (filters?: RecycleryQuery) => ({
  ...filters,
  include: filters?.include?.toString(),
});

export const fetchStores = (
  filters?: RecycleryQuery,
): Promise<AxiosResponse<ListRecycleriesResponse>> =>
  axiosInstance.get<ListRecycleriesResponse>("/api/recycleries", {
    params: withIncludeParam(filters),
  });

export const updateStore = (
  id: number,
  data: StorePayload,
): Promise<AxiosResponse<UpdateRecycleryResponse>> =>
  axiosInstance.put<UpdateRecycleryResponse>(`/api/stores/${id}`, data);

export const createStore = (
  data: StorePayload,
): Promise<AxiosResponse<CreateRecycleryResponse>> =>
  axiosInstance.post<CreateRecycleryResponse>("/api/stores", data);

export const deleteStore = (
  id: number,
): Promise<AxiosResponse<DeleteRecycleryResponse>> =>
  axiosInstance.delete<DeleteRecycleryResponse>(`/api/stores/${id}`);

export const fetchCaisses = (
  storeId: number,
): Promise<AxiosResponse<ListRecycleryCashRegistersResponse>> =>
  axiosInstance.get<ListRecycleryCashRegistersResponse>(
    `/api/stores/${storeId}/cash-registers`,
  );

export const createCaisse = (
  storeId: number,
  data: { name: string },
): Promise<AxiosResponse<CreateCashRegisterResponse>> =>
  axiosInstance.post<CreateCashRegisterResponse>(
    `/api/stores/${storeId}/cash-registers`,
    { ...data, store_id: storeId },
  );

export const getActiveCaisses = (): Promise<
  AxiosResponse<ActiveCashSessionResponse>
> => axiosInstance.get<ActiveCashSessionResponse>("/api/cash-sessions/active");

export const deleteCaisse = (
  id: number,
): Promise<AxiosResponse<DeleteCashRegisterResponse>> =>
  axiosInstance.delete<DeleteCashRegisterResponse>(`/api/cash-registers/${id}`);

export const OpenCaisse = (
  data: OpenCashSessionBody,
): Promise<AxiosResponse<OpenCashSessionResponse>> =>
  axiosInstance.post<OpenCashSessionResponse>("/api/cash-sessions/open", data);

export const closeCaisse = (
  id: number,
  data: CloseCashSessionBody,
): Promise<AxiosResponse<CloseCashSessionResponse>> =>
  axiosInstance.put<CloseCashSessionResponse>(
    `/api/cash-sessions/${id}/close`,
    data,
  );

export const getCaisseDetails = (
  registerId: number,
): Promise<AxiosResponse<DetailCashRegisterResponse>> =>
  axiosInstance.get<DetailCashRegisterResponse>(
    `/api/cash-registers/${registerId}`,
  );

export const getSessionDetails = (
  sessionId: number,
): Promise<AxiosResponse<DetailCashSessionResponse>> =>
  axiosInstance.get<DetailCashSessionResponse>(
    `/api/cash-sessions/${sessionId}`,
  );
