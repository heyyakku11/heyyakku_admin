import api from "./api";
import type { ApiResponse } from "../types/apiResponse";
import type { Guest } from "../types/guest";
import type { User } from "../types/user";

export const PAGE_SIZE = 10;

export interface Page<T> {
    items: T[];
    page: number;
    totalPages: number;
    totalCount: number;
}

/** One page of a list endpoint (1-based); status is optional and omitted means every status. */
async function fetchPage<T>(path: string, status: string | null, page: number): Promise<Page<T>> {
    const response = await api.get<ApiResponse<T[]>>(path, {
        params: { page, pageSize: PAGE_SIZE, ...(status ? { status } : {}) },
    });
    const meta = response.data.meta;
    return {
        items: response.data.data ?? [],
        page: meta?.page ?? page,
        totalPages: meta?.totalPages ?? 1,
        totalCount: meta?.totalCount ?? response.data.data?.length ?? 0,
    };
}

export function fetchUsers(status: string | null, page: number): Promise<Page<User>> {
    return fetchPage<User>("/api/v1/yakku/users", status, page);
}

export function fetchGuests(status: string | null, page: number): Promise<Page<Guest>> {
    return fetchPage<Guest>("/api/v1/yakku/guests", status, page);
}
