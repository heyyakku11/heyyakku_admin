import axios from "axios";
import api from "./api";
import { type ApiResponse } from "../types/apiResponse";
import {
    type LoginResponse,
    type LoginRequest,
    type SessionResponse,
    type RegisterRequest,
    type RegistrationStepResponse,
    type VerifyEmailRequest,
    type ForgotPasswordRequest,
    type ResetPasswordRequest,
    type ChangePasswordRequest
} from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function adminLogin(
    data: LoginRequest
):Promise<ApiResponse<LoginResponse>>{
   // Through `api` so the browser accepts the session cookie the response sets.
   const response = await api.post<ApiResponse<LoginResponse>>("/api/v1/admin/auth/login",data);
   return response.data;
}

/** Who the server says is signed in (and this session's CSRF token). 401 when there is no valid session. */
export async function adminSession():Promise<ApiResponse<SessionResponse>>{
   const response = await api.get<ApiResponse<SessionResponse>>("/api/v1/admin/auth/session");
   return response.data;
}

export async function adminLogout():Promise<ApiResponse<null>>{
   const response = await api.post<ApiResponse<null>>("/api/v1/admin/auth/logout");
   return response.data;
}

export async function adminLogoutAll(
):Promise<ApiResponse<null>>{
   const response = await api.post<ApiResponse<null>>("/api/v1/admin/auth/logout-all");

   return response.data;
}

const AUTH_BASE = `${API_BASE_URL}/api/v1/admin/auth`;

export async function adminRegister(
    data: RegisterRequest
):Promise<ApiResponse<RegistrationStepResponse>>{
   const response = await axios.post<ApiResponse<RegistrationStepResponse>>(`${AUTH_BASE}/register`,data);
   return response.data;
}

export async function adminVerifyEmail(
    data: VerifyEmailRequest
):Promise<ApiResponse<null>>{
   const response = await axios.post<ApiResponse<null>>(`${AUTH_BASE}/verify-email`,data);
   return response.data;
}

export async function adminForgotPassword(
    data: ForgotPasswordRequest
):Promise<ApiResponse<null>>{
   const response = await axios.post<ApiResponse<null>>(`${AUTH_BASE}/forgot-password`,data);
   return response.data;
}

export async function adminResetPassword(
    data: ResetPasswordRequest
):Promise<ApiResponse<null>>{
   const response = await axios.post<ApiResponse<null>>(`${AUTH_BASE}/reset-password`,data);
   return response.data;
}

/** Requires a signed-in admin; the backend signs out all sessions on success. */
export async function adminChangePassword(
    data: ChangePasswordRequest
):Promise<ApiResponse<null>>{
   const response = await api.post<ApiResponse<null>>("/api/v1/admin/auth/change-password",data);
   return response.data;
}
