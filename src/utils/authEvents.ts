import { clearSession } from "./session";

/** Fired on `window` when the server no longer accepts the admin session (expired, revoked, signed out elsewhere). */
export const SESSION_ENDED_EVENT = "admin:session-ended";

/** Drops the in-memory session state and tells the app to go back to the login screen. */
export function endSession() {
    clearSession();
    window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
}
