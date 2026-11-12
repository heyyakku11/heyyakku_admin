/*
 * The CSRF token for the current admin session. It is not a credential (useless without the HttpOnly cookie),
 * so it may live in memory. It is never written to localStorage/sessionStorage and is re-fetched from the server
 * after a page reload.
 */
let token: string | null = null;

export function getCsrfToken(): string | null {
    return token;
}

export function setCsrfToken(next: string | null) {
    token = next;
}
