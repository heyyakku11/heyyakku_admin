/** A user as returned by GET /api/v1/yakku/users. */
export interface User {
    id: string;
    anonymousName: string;
    /** Full phone number with its country code, e.g. "+919876543210". */
    phoneNumber: string;
    plan: { code: string; name: string };
    /** active | disabled */
    status: string;
    avatarUrl: string | null;
    lastLoginAt: string | null;
    createdAt: string;
}
