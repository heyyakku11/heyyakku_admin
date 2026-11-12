import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { endSession } from "../utils/authEvents";
import { getCsrfToken, setCsrfToken } from "../utils/csrf";

/*
 * Admin authentication is an HttpOnly session cookie set by the backend. JavaScript cannot read it and nothing
 * here stores a token. The browser attaches the cookie (withCredentials); this file only adds the CSRF header.
 *
 * In production VITE_API_BASE_URL is empty: the app calls /api on its own origin and Vercel forwards it to the
 * backend (see vercel.json), which keeps the cookie first-party.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const CSRF_HEADER = "X-CSRF-Token";
const SESSION_PATH = "/api/v1/admin/auth/session";
const LOGIN_PATH = "/api/v1/admin/auth/login";

const SAFE_METHODS = new Set(["get", "head", "options"]);

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

/** Used for login and the session probe, which must not trigger the "session ended" handling. */
function isAuthProbe(config?: InternalAxiosRequestConfig) {
    const url = config?.url ?? "";
    return url.endsWith(SESSION_PATH) || url.endsWith(LOGIN_PATH);
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? "get").toLowerCase();
    const csrfToken = getCsrfToken();
    if (!SAFE_METHODS.has(method) && csrfToken) {
        config.headers.set(CSRF_HEADER, csrfToken);
    }
    return config;
});

type Retriable = InternalAxiosRequestConfig & { _csrfRetried?: boolean };

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config as Retriable | undefined;
        const status = error.response?.status;

        // 401: the server no longer accepts the cookie (expired, revoked, signed out elsewhere). There is nothing
        // to refresh client-side; go back to sign-in. Login and the session probe handle their own 401s.
        if (status === 401 && !isAuthProbe(config)) {
            endSession();
            return Promise.reject(error);
        }

        // 403 on a state-changing request can mean a stale CSRF token (for example after the session rotated in
        // another tab). Fetch a fresh one once and retry; if it is still refused, the request is not allowed.
        if (
            status === 403 &&
            config &&
            !config._csrfRetried &&
            !SAFE_METHODS.has((config.method ?? "get").toLowerCase())
        ) {
            config._csrfRetried = true;
            try {
                const session = await api.get<{ data?: { csrfToken?: string } }>(SESSION_PATH);
                const fresh = session.data?.data?.csrfToken;
                if (fresh && fresh !== getCsrfToken()) {
                    setCsrfToken(fresh);
                    return api(config);
                }
            } catch {
                // fall through: the original 403 is reported
            }
        }

        return Promise.reject(error);
    }
);

export default api;
