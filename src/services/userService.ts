

import api from "./api";
import type { ApiResponse } from "../types/apiResponse";
import type { User } from "../types/user";

export async function getUsers(): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>(
        "/api/v1/yakku/users"
    );

    return response.data;
}