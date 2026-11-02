/** The app installation last seen for a guest. */
export interface GuestDevice {
    platform: string;
    deviceModel: string | null;
    osVersion: string | null;
    appVersion: string | null;
}

/** A guest as returned by GET /api/v1/yakku/guests. */
export interface Guest {
    id: string;
    createdAt: string;
    /** active | expired */
    status: string;
    device: GuestDevice | null;
    expiresAt: string;
    lastSeenAt: string | null;
    /** Votes the guest cast on polls and checks. */
    cardVotes: number;
}
