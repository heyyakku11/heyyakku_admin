/** A poll as returned by GET /api/v1/yakku/polls. */
export interface Poll {
    id: string;
    question: string;
    /** question | image | video | audio */
    pollType: string;
    createdAt: string;
    expiresAt: string | null;
    /** draft | active | closed | expired */
    status: string;
    creatorAnonymousName: string;
    voteCount: number;
    /** Votes that came with a reason. */
    reasonCount: number;
}
