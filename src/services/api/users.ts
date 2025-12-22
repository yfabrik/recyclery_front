import axiosInstance from "./axios";

export const fetchUsers = ()=> axiosInstance.get("/api/users")
export const createUser = (data)=> axiosInstance.post("/api/users",data)
export const updateUser = (id,data)=>axiosInstance.put(`/api/users/${id}`,data)
export const deleteUser = (id)=>axiosInstance.delete(`/api/users/${id}`)