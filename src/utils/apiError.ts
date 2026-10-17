import axios from "axios";
import type { ApiResponse } from "../types/apiResponse";

/** Turns an axios/API failure into a message safe to show in a form. */
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        if (error.response?.status === 429) {
            return "Too many attempts. Please wait a moment and try again.";
        }
        const body = error.response?.data;
        const detail = body?.errors?.find((e) => e?.message)?.message;
        if (detail) return detail;
        if (body?.message) return body.message;
        if (!error.response) return "Can't reach the server. Check your connection.";
    }
    if (error instanceof Error && error.message) return error.message;
    return "Something went wrong. Please try again.";
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function passwordProblem(password: string): string | null {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password.length > 128) return "Password must be at most 128 characters.";
    return null;
}
