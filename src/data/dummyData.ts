// Placeholder data for the dashboard sections. The sections no longer call the
// backend; swap these constants for real data sources when the APIs return.
import type { Poll } from '../types/poll';

export const DUMMY_POLLS: Poll[] = [
    {
        id: 'p-3001',
        question: 'Which dress should I wear?',
        creatorId: 'u-1001',
        status: 'active',
        optionType: 'text',
        totalVoteCount: 128,
        expiresAt: '2026-10-25T18:00:00Z',
        createdAt: '2026-10-15T09:00:00Z',
    },
    {
        id: 'p-3002',
        question: 'Is pineapple okay on pizza?',
        creatorId: 'u-1002',
        status: 'active',
        optionType: 'text',
        totalVoteCount: 342,
        expiresAt: null,
        createdAt: '2026-10-12T17:20:00Z',
    },
    {
        id: 'p-3003',
        question: 'Which logo looks better?',
        creatorId: 'u-1003',
        status: 'inactive',
        optionType: 'image',
        totalVoteCount: 57,
        expiresAt: '2026-10-30T12:00:00Z',
        createdAt: '2026-10-05T08:45:00Z',
    },
    {
        id: 'p-3004',
        question: 'Weekend plan: movie or trek?',
        creatorId: 'u-1004',
        status: 'expired',
        optionType: 'text',
        totalVoteCount: 91,
        expiresAt: '2026-10-01T00:00:00Z',
        createdAt: '2026-09-24T15:10:00Z',
    },
];
