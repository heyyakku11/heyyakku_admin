import { clearSession } from "./session";

/** Fired on `window` when the admin session can no longer be kept alive (the refresh token was rejected). */
export const SESSION_ENDED_EVENT = "admin:session-ended";

/** Clears the stored session and tells the app to go back to the login screen. */
export function endSession() {
    clearSession();
    window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
}
