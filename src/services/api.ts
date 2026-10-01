import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
 * Decode JWT payload.
 *
 * This does NOT verify the token.
 * It only reads the `exp` claim so the frontend
 * can decide whether it should attempt a refresh.
 */
function isAccessTokenExpired(token: string): boolean {

    try {

        const payload = JSON.parse(
            atob(token.split(".")[1])
        );

        const expirationTime = payload.exp;

        if (!expirationTime) {
            return true;
        }

        const currentTime = Math.floor(
            Date.now() / 1000
        );

        return currentTime >= expirationTime;

    } catch {

        return true;
    }
}


/*
 * Refresh the access token
 */
async function refreshAccessToken(): Promise<string | null> {

    const refreshToken = localStorage.getItem(
        "refreshToken"
    );

    if (!refreshToken) {
        return null;
    }

    try {

        const response = await refreshClient.post(
            "/api/v1/admin/auth/refresh",
            {
                refreshToken
            }
        );

        const data = response.data;

        if (!data.success || !data.data) {
            return null;
        }

        const newAccessToken =
            data.data.accessToken;

        const newRefreshToken =
            data.data.refreshToken;

        localStorage.setItem(
            "accessToken",
            newAccessToken
        );

        localStorage.setItem(
            "refreshToken",
            newRefreshToken
        );

        return newAccessToken;

    } catch (error) {

        console.error(
            "Token refresh failed:",
            error
        );

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
         * Check whether access token is expired.
         */
        if (isAccessTokenExpired(accessToken)) {

            const newAccessToken =
                await refreshAccessToken();

            /*
             * Refresh failed.
             */
            if (!newAccessToken) {

                localStorage.removeItem(
                    "accessToken"
                );

                localStorage.removeItem(
                    "refreshToken"
                );

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


export default api;