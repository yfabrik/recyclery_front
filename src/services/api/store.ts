import type {
  CreateCashRegisterResponse,
  DeleteCashRegisterResponse,
  DetailCashRegisterResponse,
} from "@recyclerie/api/responses/cashRegister";
import type {
  ActiveCashSessionResponse,
  CloseCashSessionResponse,
  DetailCashSessionResponse,
  OpenCashSessionResponse,
} from "@recyclerie/api/responses/cashSession";
import type {
  CreateRecycleryResponse,
  DeleteRecycleryResponse,
  ListRecycleriesResponse,
  ListRecycleryCashRegistersResponse,
  UpdateRecycleryResponse
} from "@recyclerie/api/responses/recycleries";
import type { CashRegisterCreateInput } from "@recyclerie/api/schemas/cashRegister";
import type {
  CloseCashSessionBody,
  OpenCashSessionBody,
} from "@recyclerie/api/schemas/cashSession";
import type { RecycleryDataInput, RecycleryFilter } from "@recyclerie/api/schemas/recycleries";
import type { AxiosResponse } from "axios";
import type { CaisseModel, CashSession, StoreModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type StorePayload = Omit<
//   Schema,
//   "manager_id" | "postal_code" | "phone" | "email"
// > & {
//   manager_id: number | null;
//   postal_code: string | null;
//   phone: string | null;
//   email: string | null;
// };

// export type { RecycleryFilter };

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
  id: StoreModel["id"],
  data: RecycleryDataInput,
): Promise<AxiosResponse<UpdateRecycleryResponse>> =>
  axiosInstance.put<UpdateRecycleryResponse>(`/api/stores/${id}`, data);

export const createStore = (
  data: RecycleryDataInput,
): Promise<AxiosResponse<CreateRecycleryResponse>> =>
  axiosInstance.post<CreateRecycleryResponse>("/api/stores", data);

export const deleteStore = (
  id: StoreModel["id"],
): Promise<AxiosResponse<DeleteRecycleryResponse>> =>
  axiosInstance.delete<DeleteRecycleryResponse>(`/api/stores/${id}`);

export const fetchCaisses = (
  storeId: StoreModel["id"],
): Promise<AxiosResponse<ListRecycleryCashRegistersResponse>> =>
  axiosInstance.get<ListRecycleryCashRegistersResponse>(
    `/api/stores/${storeId}/cash-registers`,
  );

export const createCaisse = (
  storeId: StoreModel["id"],
  data: CashRegisterCreateInput,
): Promise<AxiosResponse<CreateCashRegisterResponse>> =>
  axiosInstance.post<CreateCashRegisterResponse>(
    `/api/stores/${storeId}/cash-registers`,
    { ...data, store_id: storeId },
  );

export const getActiveCaisses = (): Promise<
  AxiosResponse<ActiveCashSessionResponse>
> => axiosInstance.get<ActiveCashSessionResponse>("/api/cash-sessions/active");

export const deleteCaisse = (
  id: CaisseModel["id"],
): Promise<AxiosResponse<DeleteCashRegisterResponse>> =>
  axiosInstance.delete<DeleteCashRegisterResponse>(`/api/cash-registers/${id}`);

export const OpenCaisse = (
  data: OpenCashSessionBody,
): Promise<AxiosResponse<OpenCashSessionResponse>> =>
  axiosInstance.post<OpenCashSessionResponse>("/api/cash-sessions/open", data);

export const closeCaisse = (
  id: CaisseModel["id"],
  data: CloseCashSessionBody,
): Promise<AxiosResponse<CloseCashSessionResponse>> =>
  axiosInstance.put<CloseCashSessionResponse>(
    `/api/cash-sessions/${id}/close`,
    data,
  );

export const getCaisseDetails = (
  registerId: CaisseModel["id"],
): Promise<AxiosResponse<DetailCashRegisterResponse>> =>
  axiosInstance.get<DetailCashRegisterResponse>(
    `/api/cash-registers/${registerId}`,
  );

export const getSessionDetails = (
  sessionId: CashSession["id"],
): Promise<AxiosResponse<DetailCashSessionResponse>> =>
  axiosInstance.get<DetailCashSessionResponse>(
    `/api/cash-sessions/${sessionId}`,
  );
