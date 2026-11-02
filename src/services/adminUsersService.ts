import api from "./api";
import type { ApiResponse } from "../types/apiResponse";
import type { Guest } from "../types/guest";
import type { User } from "../types/user";

export const PAGE_SIZE = 10;

export interface Page<T> {
    items: T[];
    /** Pass to the next call to get the following page; null when there is none. */
    nextCursor: string | null;
    hasMore: boolean;
}

/** One cursor page of a list endpoint; status is optional and omitted means every status. */
async function fetchPage<T>(path: string, status: string | null, cursor: string | null): Promise<Page<T>> {
    const response = await api.get<ApiResponse<T[]>>(path, {
        params: {
            pageSize: PAGE_SIZE,
            ...(status ? { status } : {}),
            ...(cursor ? { cursor } : {}),
        },
    });
    const meta = response.data.meta;
    return {
        items: response.data.data ?? [],
        nextCursor: meta?.nextCursor ?? null,
        hasMore: meta?.hasMore ?? false,
    };
}

export function fetchUsers(status: string | null, cursor: string | null = null): Promise<Page<User>> {
    return fetchPage<User>("/api/v1/yakku/users", status, cursor);
}

export function fetchGuests(status: string | null, cursor: string | null = null): Promise<Page<Guest>> {
    return fetchPage<Guest>("/api/v1/yakku/guests", status, cursor);
}
