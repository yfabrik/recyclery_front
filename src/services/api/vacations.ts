import type { CreateVacationResponse, DeleteVacationResponse, EmployeeVacationDto, ListVacationsResponse, UpdateVacationResponse } from "@recyclerie/api/responses/vacations";
import type { VacationBodyInput, VacationUpdateInput } from "@recyclerie/api/schemas/vacations";
import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";

export const getVacations = async (): Promise<AxiosResponse<ListVacationsResponse>> =>
    await axiosInstance.get('/api/vacations');

export const getEmployeeVacations = async (employeeId: EmployeeVacationDto["employee_id"]): Promise<AxiosResponse<ListVacationsResponse>> =>
    await axiosInstance.get(`/api/vacations/employee/${employeeId}`);

export const createVacation = async (employeeId: EmployeeVacationDto["employee_id"], vacationData: VacationBodyInput): Promise<AxiosResponse<CreateVacationResponse>> => {
    return await axiosInstance.post(`/api/vacations/employee/${employeeId}`, vacationData);
};
export const updateVacation = async (vactionId: EmployeeVacationDto["id"], vacationData: VacationUpdateInput): Promise<AxiosResponse<UpdateVacationResponse>> => {
    return await axiosInstance.put(`/api/vacations/${vactionId}`, vacationData);
};

export const deleteVacation = async (id: EmployeeVacationDto["id"]): Promise<AxiosResponse<DeleteVacationResponse>> => {
    return await axiosInstance.delete(`/api/vacations/${id}`);
};
