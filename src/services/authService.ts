import axios from "axios";
import api from "./api";
import { type ApiResponse } from "../types/apiResponse";
import { type LoginResponse, type LoginRequest, type RefreshRequest } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function adminLogin(
    data: LoginRequest
):Promise<ApiResponse<LoginResponse>>{
   const response = await axios.post<ApiResponse<LoginResponse>>(`${API_BASE_URL}/api/v1/admin/auth/login`,data);
   return response.data;
}

export async function adminRefresh(
    data: RefreshRequest
):Promise<ApiResponse<LoginResponse>>{
   const response = await axios.post<ApiResponse<LoginResponse>>(`${API_BASE_URL}/api/v1/admin/auth/refresh`,data);

   return response.data;
}

export async function adminLogout(
    data: RefreshRequest
):Promise<ApiResponse<null>>{
   const response = await axios.post<ApiResponse<null>>(`${API_BASE_URL}/api/v1/admin/auth/logout`,data);

   return response.data;
}

export async function adminLogoutAll(
):Promise<ApiResponse<null>>{
   const response = await api.post<ApiResponse<null>>("/api/v1/admin/auth/logout-all");

   return response.data;
}
