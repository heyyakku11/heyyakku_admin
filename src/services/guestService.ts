import api from './api';
import { type ApiResponse} from "../types/apiResponse";
import { type Guest} from "../types/guest";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getUsers(

):Promise<ApiResponse<Guest[]>>{
   const response  = await api.get<ApiResponse<Guest[]>>("/api/v1/yakku/guest");
   return response.data;
} 