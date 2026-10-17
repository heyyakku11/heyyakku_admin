import { useState } from 'react';
import './users.css';
import DataTable, { StatusPill, type Column } from '../../components/DataTable';
import { DUMMY_GUESTS, DUMMY_USERS } from '../../data/dummyData';
import type { Guest } from '../../types/guest';
import type { User } from '../../types/user';

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/** Drops the dial code (the flag stands in for it): "+91 98765 43210" -> "98765 43210". */
function nationalNumber(phone: string) {
    return phone.split(' ').slice(1).join(' ');
}

/** Keeps only the last two digits, e.g. "********10". */
function maskPhone(phone: string) {
    const digits = nationalNumber(phone).replace(/\s/g, '');
    return `${'*'.repeat(Math.max(digits.length - 2, 0))}${digits.slice(-2)}`;
}

/** `revealed` holds the ids of rows whose phone number the row's View (eye) button has unmasked. */
const getUserColumns = (revealed: Set<string>): Column<User>[] => [
    {
        key: 'name',
        label: 'Display name',
        sortValue: (u) => u.displayName.toLowerCase(),
        render: (u) => (
            <div className="dt-identity">
                <div className="dt-avatar">{u.displayName.charAt(0).toUpperCase()}</div>
                {u.displayName}
            </div>
        ),
    },
    {
        key: 'phone',
        label: 'Phone number',
        sortValue: (u) => u.phone,
        render: (u) => (
            <div className="dt-identity">
                <img
                    className="dt-flag"
                    src={`https://flagcdn.com/w40/${u.countryCode.toLowerCase()}.png`}
                    alt={u.countryCode}
                    title={u.countryCode}
                    width={20}
                    height={15}
                />
                {revealed.has(u.id) ? nationalNumber(u.phone) : maskPhone(u.phone)}
            </div>
        ),
    },
    {
        key: 'plan',
        label: 'Active plan',
        sortValue: (u) => u.planName ?? '',
        render: (u) => (u.planName ? <span className="dt-tag">{u.planName}</span> : <span className="dt-muted">No plan</span>),
    },
    {
        key: 'status',
        label: 'Status',
        sortValue: (u) => u.status,
        render: (u) => <StatusPill status={u.status} />,
    },
];

const guestColumns: Column<Guest>[] = [
    {
        key: 'lastSeen',
        label: 'Last seen',
        sortValue: (g) => g.lastSeenAt,
        render: (g) => <span className="dt-muted">{formatDateTime(g.lastSeenAt)}</span>,
    },
    {
        key: 'expires',
        label: 'Expires',
        sortValue: (g) => g.expiresAt,
        render: (g) => <span className="dt-muted">{formatDateTime(g.expiresAt)}</span>,
    },
    {
        key: 'created',
        label: 'Created',
        sortValue: (g) => g.createdAt,
        render: (g) => <span className="dt-muted">{formatDate(g.createdAt)}</span>,
    },
    {
        key: 'status',
        label: 'Status',
        sortValue: (g) => g.status,
        render: (g) => <StatusPill status={g.status} />,
    },
];

function Users() {
    const users = DUMMY_USERS;
    const guests = DUMMY_GUESTS;
    const [revealed, setRevealed] = useState<Set<string>>(new Set());

    function toggleReveal(user: User) {
        setRevealed((prev) => {
            const next = new Set(prev);
            if (next.has(user.id)) next.delete(user.id);
            else next.add(user.id);
            return next;
        });
    }

    return (
        <div className="users-section">

            <DataTable
                title="All Users"
                rows={users}
                columns={getUserColumns(revealed)}
                onView={toggleReveal}
                getId={(u) => u.id}
                searchText={(u) => `${u.displayName} ${u.phone} ${u.id}`}
                searchPlaceholder="Search user"
                statusOf={(u) => u.status}
                statusOptions={['active', 'inactive', 'suspended']}
                exportName="users"
                exportRow={(u) => ({
                    id: u.id,
                    displayName: u.displayName,
                    phone: u.phone,
                    status: u.status,
                    planName: u.planName ?? '',
                    planExpiresAt: u.planExpiresAt ?? '',
                })}
            />

            <DataTable
                title="All Guests"
                rows={guests}
                columns={guestColumns}
                getId={(g) => g.id}
                searchText={(g) => g.id}
                searchPlaceholder="Search guest"
                statusOf={(g) => g.status}
                statusOptions={['active', 'inactive', 'expired']}
                exportName="guests"
                exportRow={(g) => ({
                    id: g.id,
                    status: g.status,
                    createdAt: g.createdAt,
                    lastSeenAt: g.lastSeenAt,
                    expiresAt: g.expiresAt,
                })}
            />

        </div>
    );
}

export default Users;
