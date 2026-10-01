import api from './api';
import { type ApiResponse} from "../types/apiResponse";
import { type Category,type CreateCategoryRequest} from "../types/category";


export async function getCategories(

):Promise<ApiResponse<Category[]>>{
   const response  = await api.get<ApiResponse<Category[]>>("/api/v1/yakku/categories");
   return response.data;
} 

export async function createCategory(
     data: CreateCategoryRequest
):Promise<ApiResponse<Category>>{
   const response  = await api.post<ApiResponse<Category>>("/api/v1/yakku/categories",data);
   return response.data;
} 