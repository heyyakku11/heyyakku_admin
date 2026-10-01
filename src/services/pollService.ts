import api from './api';
import { type ApiResponse} from "../types/apiResponse";
import { type Poll} from "../types/poll";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getPolls(

):Promise<ApiResponse<Poll[]>>{
   const response  = await api.get<ApiResponse<Poll[]>>(`/api/v1/yakku/polls`);
   return response.data;
} 