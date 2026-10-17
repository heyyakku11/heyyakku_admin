export interface User {
    id: string;
    email: string;
    /** Full phone number including the country dial code, e.g. "+91 98765 43210". */
    phone: string;
    displayName: string;
    /** ISO 3166-1 alpha-2 country code, e.g. "IN". */
    countryCode: string;
    status: string;
    lastLoginAt: string;
    createdAt: string;
    /** Active subscription plan, null when the user has none. */
    planName: string | null;
    planExpiresAt: string | null;
}
