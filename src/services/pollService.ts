import api from './api';
import { type ApiResponse} from "../types/apiResponse";
import { type Poll} from "../types/poll";

export async function getPolls(

):Promise<ApiResponse<Poll[]>>{
   const response  = await api.get<ApiResponse<Poll[]>>(`/api/v1/yakku/polls`);
   return response.data;
} 