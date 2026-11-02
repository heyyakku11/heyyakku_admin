import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig
} from "axios";
import { endSession } from "../utils/authEvents";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const REFRESH_PATH = "/api/v1/admin/auth/refresh";

/** A token with less than this left is treated as expired and renewed first. */
const EXPIRY_MARGIN_MS = 30_000;

/** The background refresh runs this long before the access token expires. */
const REFRESH_AHEAD_MS = 60_000;

/** After a failed background refresh (e.g. offline) it tries again this much later. */
const RETRY_DELAY_MS = 30_000;

/*
 * Main API client
 */
const api = axios.create({
    baseURL: API_BASE_URL
});

/*
 * Separate client for refresh.
 *
 * IMPORTANT:
 * Do not use `api` here because `api` has the
 * authentication interceptor.
 */
const refreshClient = axios.create({
    baseURL: API_BASE_URL
});


interface RefreshRequest {
    refreshToken: string;
}


/*
 * Read the `exp` claim (milliseconds since the epoch) of a JWT.
 *
 * This does NOT verify the token. It only lets the frontend
 * decide when to renew it. Returns null when it cannot be read.
 */
function getTokenExpiry(token: string): number | null {

    try {

        const base64 = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const payload = JSON.parse(atob(base64));

        return payload.exp ? payload.exp * 1000 : null;

    } catch {

        return null;
    }
}


function isAccessTokenExpired(token: string): boolean {

    const expiry = getTokenExpiry(token);

    return expiry === null || Date.now() >= expiry - EXPIRY_MARGIN_MS;
}


/*
 * Result of a refresh attempt:
 *  - a token string: the session was renewed
 *  - null: the server rejected the refresh token, the session is over
 *  - throws: the server could not be reached, try again later
 */
async function requestNewTokens(): Promise<string | null> {

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        return null;
    }

    // Another tab may have renewed the session while this one waited for the lock.
    const current = localStorage.getItem("accessToken");
    if (current && !isAccessTokenExpired(current)) {
        return current;
    }

    try {

        const refreshRequest: RefreshRequest = {
            refreshToken
        };

        const response = await refreshClient.post(
            REFRESH_PATH,
            refreshRequest
        );

        const data = response.data;

        if (!data.success || !data.data) {
            return null;
        }

        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);

        return data.data.accessToken;

    } catch (error) {

        // A rejected token ends the session; anything else (offline, 5xx) is only a failed attempt.
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;

        if (status === 400 || status === 401 || status === 403) {
            return null;
        }

        throw error;
    }
}


/*
 * One refresh at a time: requests that need a new token while a refresh is
 * running wait for it instead of starting their own (which would reuse a
 * refresh token that has already been rotated). The Web Lock does the same
 * across browser tabs.
 */
let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {

    if (!refreshInFlight) {

        const run = navigator.locks
            ? navigator.locks.request("yakku-admin-token-refresh", requestNewTokens)
            : requestNewTokens();

        refreshInFlight = Promise.resolve(run).finally(() => {
            refreshInFlight = null;
        });
    }

    return refreshInFlight;
}


/*
 * Renews the token and ends the session when the server says it is over.
 * Returns the new token, or null if the session ended or the server could not be reached.
 */
async function refreshOrEndSession(): Promise<string | null> {

    try {

        const token = await refreshAccessToken();

        if (!token) {
            endSession();
        }

        return token;

    } catch {

        return null;
    }
}


/*
 * Request interceptor
 */
api.interceptors.request.use(
    async (
        config: InternalAxiosRequestConfig
    ) => {

        let accessToken =
            localStorage.getItem("accessToken");


        /*
         * No access token.
         */
        if (!accessToken) {
            return config;
        }


        /*
         * Renew an expired (or about to expire) access token first.
         */
        if (isAccessTokenExpired(accessToken)) {

            const newAccessToken =
                await refreshOrEndSession();

            /*
             * The session ended: do not send a request that cannot succeed.
             */
            if (!newAccessToken) {

                // Reaching here with no token means the session ended or the server is unreachable.
                if (!localStorage.getItem("accessToken")) {
                    throw new axios.CanceledError("Session expired");
                }

                return config;
            }

            accessToken = newAccessToken;
        }


        /*
         * Add the valid token to the request.
         */
        config.headers.Authorization =
            `Bearer ${accessToken}`;

        return config;

    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);


/*
 * Response interceptor: a 401 means the server no longer accepts the access
 * token (revoked session, clock difference, ...). Renew it once and retry the
 * request; if that fails the session is over and the app returns to login.
 */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {

        const config = error.config as RetriableConfig | undefined;

        if (
            error.response?.status !== 401 ||
            !config ||
            config._retried ||
            !localStorage.getItem("refreshToken")
        ) {
            return Promise.reject(error);
        }

        config._retried = true;

        const newAccessToken = await refreshOrEndSession();

        if (!newAccessToken) {
            return Promise.reject(error);
        }

        config.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(config);
    }
);


/*
 * Background refresh: while signed in, renew the access token shortly before
 * it expires so the dashboard never has to wait on an expired token.
 */
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let autoRefreshRunning = false;

function scheduleNextRefresh(delay?: number) {

    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }

    if (!autoRefreshRunning) {
        return;
    }

    if (delay === undefined) {

        const token = localStorage.getItem("accessToken");
        const expiry = token ? getTokenExpiry(token) : null;

        // An unreadable token is renewed on the next tick rather than never.
        delay = expiry === null
            ? RETRY_DELAY_MS
            : Math.max(expiry - Date.now() - REFRESH_AHEAD_MS, 0);
    }

    refreshTimer = setTimeout(runBackgroundRefresh, delay);
}

async function runBackgroundRefresh() {

    refreshTimer = null;

    if (!autoRefreshRunning || !localStorage.getItem("refreshToken")) {
        return;
    }

    try {

        const token = await refreshAccessToken();

        if (!token) {
            endSession();
            return;
        }

        scheduleNextRefresh();

    } catch {

        // Offline or the server is down: try again soon, the session is not over.
        scheduleNextRefresh(RETRY_DELAY_MS);
    }
}

/*
 * Browsers pause timers in background tabs and during sleep, so check the
 * token again when the tab becomes visible or the connection returns.
 */
function checkNow() {

    if (!autoRefreshRunning || document.visibilityState === "hidden") {
        return;
    }

    scheduleNextRefresh();
}

export function startAutoRefresh() {

    if (autoRefreshRunning) {
        return;
    }

    autoRefreshRunning = true;
    document.addEventListener("visibilitychange", checkNow);
    window.addEventListener("online", checkNow);
    scheduleNextRefresh();
}

export function stopAutoRefresh() {

    autoRefreshRunning = false;
    document.removeEventListener("visibilitychange", checkNow);
    window.removeEventListener("online", checkNow);

    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
}


export default api;
