import type { EcoOrgModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

interface EcoOrgFilters{
    active?:0|1
}

export const getEcoOrganisms =(filters:EcoOrgFilters|null=null)=> axiosInstance.get("/api/eco-organisms",{params:filters})
// export const getActiveEcoOrganisms =()=> axiosInstance.get("/api/eco-organisms/active")

export const fetchEcoOrganismsStats = ()=>axiosInstance.get("/api/eco-organisms/stats/summary")

export const createEcoOrganism = (data:EcoOrgModel)=>axiosInstance.post("/api/eco-organisms",data)
export const updateEcoOrganism = (id:number,data:EcoOrgModel)=>axiosInstance.put(`/api/eco-organisms/${id}`,data)
export const deleteEcoOrganism = (id:number)=>axiosInstance.delete(`/api/eco-organisms/${id}`)