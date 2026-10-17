export const REMEMBER_DAYS = 30;

const EXPIRES_KEY = 'sessionExpiresAt';
const ACTIVE_KEY = 'sessionActive';

export function startSession(remember: boolean) {
    if (remember) {
        localStorage.setItem(EXPIRES_KEY, String(Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000));
        sessionStorage.removeItem(ACTIVE_KEY);
    } else {
        localStorage.removeItem(EXPIRES_KEY);
        sessionStorage.setItem(ACTIVE_KEY, '1');
    }
}

export function isSessionValid(): boolean {
    if (!localStorage.getItem('accessToken')) return false;
    const expiresAt = Number(localStorage.getItem(EXPIRES_KEY));
    if (expiresAt) return Date.now() < expiresAt;
    return sessionStorage.getItem(ACTIVE_KEY) === '1';
}

export function clearSession() {
    ['accessToken', 'refreshToken', 'email', 'role', EXPIRES_KEY].forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem(ACTIVE_KEY);
}
