import { useSyncExternalStore } from 'react';
import { setCsrfToken } from './csrf';

/*
 * The signed-in admin as the SERVER reports it (GET /api/v1/admin/auth/session). It lives in memory only:
 * nothing about the session, no token and no profile, is written to localStorage or sessionStorage. After a page
 * reload the app asks the server again, so the backend stays the source of truth.
 */
export interface AdminProfile {
    email: string;
    role: string;
}

let profile: AdminProfile | null = null;
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((listener) => listener());
}

export function setSession(next: AdminProfile, csrfToken: string) {
    profile = next;
    setCsrfToken(csrfToken);
    emit();
}

export function clearSession() {
    profile = null;
    setCsrfToken(null);
    emit();
}

export function useAdminProfile(): AdminProfile | null {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => profile,
    );
}
