export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errors: ApiError[] | null;
    meta: PaginationMeta | null;
}

export interface ApiError {
    code: string;
    message: string;
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}


export function apiOk<T>(
    data: T,
    message: string,
    meta: PaginationMeta | null = null
): ApiResponse<T> {

    return {
        success: true,
        message,
        data,
        errors: null,
        meta
    };
}


export function apiFail<T>(
    message: string,
    errors: ApiError[]
): ApiResponse<T> {

    return {
        success: false,
        message,
        data: null,
        errors,
        meta: null
    };
}


export function apiNotFound<T>(
    message: string
): ApiResponse<T> {

    return apiFail<T>(
        message,
        [
            {
                code: "NOT_FOUND",
                message
            }
        ]
    );
}