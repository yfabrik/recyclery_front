import axiosInstance from "./axios";

export const getEcoOrganisms =()=> axiosInstance.get("/api/eco-organisms")
export const getActiveEcoOrganisms =()=> axiosInstance.get("/api/eco-organisms/active")

export const fetchEcoOrganismsStats = ()=>axiosInstance.get("/api/eco-organisms/stats/summary")

export const createEcoOrganism = (data)=>axiosInstance.post("/api/eco-organisms",data)
export const updateEcoOrganism = (id,data)=>axiosInstance.put(`/api/eco-organisms/${id}`,data)
export const deleteEcoOrganism = (id)=>axiosInstance.delete(`/api/eco-organisms/${id}`)