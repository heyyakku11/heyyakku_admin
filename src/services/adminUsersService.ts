import api from "./api";
import type { ApiResponse } from "../types/apiResponse";
import type { Guest } from "../types/guest";
import type { User } from "../types/user";

const PAGE_SIZE = 500;

/** Reads every page of a list endpoint; status is optional and omitted means every status. */
async function fetchAll<T>(path: string, status: string | null): Promise<T[]> {
    const items: T[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        const response = await api.get<ApiResponse<T[]>>(path, {
            params: { page, pageSize: PAGE_SIZE, ...(status ? { status } : {}) },
        });
        items.push(...(response.data.data ?? []));
        totalPages = response.data.meta?.totalPages ?? 1;
        page += 1;
    }

    return items;
}

export function fetchUsers(status: string | null = null): Promise<User[]> {
    return fetchAll<User>("/api/v1/yakku/users", status);
}

export function fetchGuests(status: string | null = null): Promise<Guest[]> {
    return fetchAll<Guest>("/api/v1/yakku/guests", status);
}
