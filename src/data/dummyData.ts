// Placeholder data for the dashboard sections. The sections no longer call the
// backend; swap these constants for real data sources when the APIs return.
import type { Category } from '../types/category';
import type { Guest } from '../types/guest';
import type { Poll } from '../types/poll';
import type { User } from '../types/user';

export const DUMMY_USERS: User[] = [
    {
        id: 'u-1001',
        email: 'aarav.sharma@example.com',
        displayName: 'Aarav Sharma',
        status: 'active',
        lastLoginAt: '2026-10-16T09:42:11Z',
        createdAt: '2026-08-02T10:15:00Z',
    },
    {
        id: 'u-1002',
        email: 'meera.iyer@example.com',
        displayName: 'Meera Iyer',
        status: 'active',
        lastLoginAt: '2026-10-15T18:05:37Z',
        createdAt: '2026-08-19T14:30:00Z',
    },
    {
        id: 'u-1003',
        email: 'rohan.verma@example.com',
        displayName: 'Rohan Verma',
        status: 'inactive',
        lastLoginAt: '2026-09-04T07:12:50Z',
        createdAt: '2026-07-11T08:00:00Z',
    },
    {
        id: 'u-1004',
        email: 'sana.khan@example.com',
        displayName: 'Sana Khan',
        status: 'suspended',
        lastLoginAt: '2026-09-28T21:40:09Z',
        createdAt: '2026-06-23T12:45:00Z',
    },
];

export const DUMMY_GUESTS: Guest[] = [
    {
        id: 'g-2001',
        status: 'active',
        createdAt: '2026-10-14T06:10:00Z',
        lastSeenAt: '2026-10-17T08:55:20Z',
        expiresAt: '2026-11-14T06:10:00Z',
    },
    {
        id: 'g-2002',
        status: 'active',
        createdAt: '2026-10-10T16:25:00Z',
        lastSeenAt: '2026-10-16T19:02:44Z',
        expiresAt: '2026-11-10T16:25:00Z',
    },
    {
        id: 'g-2003',
        status: 'inactive',
        createdAt: '2026-09-21T11:00:00Z',
        lastSeenAt: '2026-09-30T13:18:05Z',
        expiresAt: '2026-10-21T11:00:00Z',
    },
    {
        id: 'g-2004',
        status: 'expired',
        createdAt: '2026-08-01T09:30:00Z',
        lastSeenAt: '2026-08-12T10:41:31Z',
        expiresAt: '2026-09-01T09:30:00Z',
    },
];

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

export const DUMMY_CATEGORIES: Category[] = [
    { id: 'c-4001', name: 'Fashion', slug: 'fashion', isActive: true, createdAt: '2026-07-01T10:00:00Z' },
    { id: 'c-4002', name: 'Food', slug: 'food', isActive: true, createdAt: '2026-07-01T10:05:00Z' },
    { id: 'c-4003', name: 'Sports', slug: 'sports', isActive: true, createdAt: '2026-07-03T09:30:00Z' },
    { id: 'c-4004', name: 'Travel', slug: 'travel', isActive: false, createdAt: '2026-07-10T14:20:00Z' },
];
