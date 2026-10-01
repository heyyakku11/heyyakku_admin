import api from './api';
import { type ApiResponse} from "../types/apiResponse";
import { type Guest} from "../types/guest";

export async function getGuests(

):Promise<ApiResponse<Guest[]>>{
   const response  = await api.get<ApiResponse<Guest[]>>("/api/v1/yakku/guests");
   return response.data;
} 