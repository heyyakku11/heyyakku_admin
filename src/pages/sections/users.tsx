import { useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import './users.css';
import DataTable, { StatusPill, type Column } from '../../components/DataTable';
import { fetchGuests, fetchUsers } from '../../services/adminUsersService';
import type { Guest } from '../../types/guest';
import type { User } from '../../types/user';
import { type EmptyKind } from '../../components/EmptyState';
import { useList, type Loaded } from '../../hooks/usePagedList';

function formatDateTime(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/** The country flag stands in for the dial code, so the number is shown without it. */
function splitPhone(phone: string) {
    const parsed = parsePhoneNumberFromString(phone);
    if (parsed?.country) {
        return { country: parsed.country, dialCode: parsed.countryCallingCode, national: parsed.nationalNumber };
    }
    return { country: null, dialCode: null, national: phone.replace(/\D/g, '') };
}

function describeDevice(guest: Guest) {
    if (!guest.device) return null;
    const { platform, deviceModel, osVersion, appVersion } = guest.device;
    return [platform, deviceModel, osVersion && `OS ${osVersion}`, appVersion && `App ${appVersion}`]
        .filter(Boolean)
        .join(' · ');
}

const userColumns: Column<User>[] = [
    {
        key: 'name',
        label: 'Anonymous name',
        sortValue: (u) => u.anonymousName.toLowerCase(),
        render: (u) => (
            <div className="dt-identity">
                {u.avatarUrl ? (
                    <img className="dt-avatar" src={u.avatarUrl} alt="" />
                ) : (
                    <div className="dt-avatar">{u.anonymousName.charAt(0).toUpperCase()}</div>
                )}
                {u.anonymousName}
            </div>
        ),
    },
    {
        key: 'phone',
        label: 'Phone number',
        sortValue: (u) => u.phoneNumber,
        render: (u) => {
            const { country, dialCode, national } = splitPhone(u.phoneNumber);
            return (
                <div className="dt-identity">
                    {country && (
                        <img
                            className="dt-flag"
                            src={`https://flagcdn.com/w40/${country.toLowerCase()}.png`}
                            alt={country}
                            title={`${country} (+${dialCode})`}
                            width={20}
                            height={15}
                        />
                    )}
                    {national}
                </div>
            );
        },
    },
    {
        key: 'plan',
        label: 'Active plan',
        sortValue: (u) => u.plan.name,
        render: (u) => <span className="dt-tag">{u.plan.name}</span>,
    },
    {
        key: 'status',
        label: 'Status',
        sortValue: (u) => u.status,
        render: (u) => <StatusPill status={u.status} />,
    },
    {
        key: 'lastLogin',
        label: 'Last login',
        sortValue: (u) => u.lastLoginAt ?? '',
        render: (u) => <span className="dt-muted">{formatDateTime(u.lastLoginAt)}</span>,
    },
];

const guestColumns: Column<Guest>[] = [
    {
        key: 'id',
        label: 'Guest',
        sortValue: (g) => g.id,
        render: (g) => <span className="dt-muted" title={g.id}>{g.id.slice(0, 8)}</span>,
    },
    {
        key: 'created',
        label: 'Created',
        sortValue: (g) => g.createdAt,
        render: (g) => <span className="dt-muted">{formatDateTime(g.createdAt)}</span>,
    },
    {
        key: 'status',
        label: 'Status',
        sortValue: (g) => g.status,
        render: (g) => <StatusPill status={g.status} />,
    },
    {
        key: 'device',
        label: 'Device',
        sortValue: (g) => describeDevice(g) ?? '',
        render: (g) => describeDevice(g) ?? <span className="dt-muted">Not available</span>,
    },
    {
        key: 'expires',
        label: 'Expires',
        sortValue: (g) => g.expiresAt,
        render: (g) => <span className="dt-muted">{formatDateTime(g.expiresAt)}</span>,
    },
    {
        key: 'lastSeen',
        label: 'Last seen',
        sortValue: (g) => g.lastSeenAt ?? '',
        render: (g) => <span className="dt-muted">{formatDateTime(g.lastSeenAt)}</span>,
    },
    {
        key: 'votes',
        label: 'Card votes',
        sortValue: (g) => g.cardVotes,
        render: (g) => g.cardVotes,
    },
];

function Users() {
    const [userStatus, setUserStatus] = useState<string | null>(null);
    const [guestStatus, setGuestStatus] = useState<string | null>(null);
    const users = useList(fetchUsers, userStatus);
    const guests = useList(fetchGuests, guestStatus);
    const emptyKind = (state: Loaded<unknown>): EmptyKind =>
        state.loading ? 'loading' : state.error ? 'error' : 'empty';

    const emptyText = (state: Loaded<unknown>) =>
        state.loading ? 'Loading…' : state.error ?? 'No results found.';

    return (
        <div className="users-section">

            <DataTable
                title="All Users"
                rows={users.rows}
                columns={userColumns}
                showView={false}
                getId={(u) => u.id}
                searchText={(u) => `${u.anonymousName} ${u.phoneNumber} ${u.id}`}
                searchPlaceholder="Search user"
                simple
                onRefresh={users.reload}
                refreshing={users.loading}
                page={users.page}
                totalPages={users.totalPages}
                totalCount={users.totalCount}
                onPageChange={users.goToPage}
                statusOf={(u) => u.status}
                statusOptions={['active', 'disabled']}
                onStatusChange={(s) => setUserStatus(s === 'all' ? null : s)}
                emptyText={emptyText(users)}
                emptyKind={emptyKind(users)}
                exportName="users"
                exportRow={(u) => ({
                    id: u.id,
                    anonymousName: u.anonymousName,
                    phoneNumber: u.phoneNumber,
                    plan: u.plan.name,
                    status: u.status,
                    lastLoginAt: u.lastLoginAt ?? '',
                })}
            />

            <DataTable
                title="All Guests"
                rows={guests.rows}
                columns={guestColumns}
                getId={(g) => g.id}
                searchText={(g) => `${g.id} ${describeDevice(g) ?? ''}`}
                searchPlaceholder="Search guest"
                simple
                showView={false}
                onRefresh={guests.reload}
                refreshing={guests.loading}
                page={guests.page}
                totalPages={guests.totalPages}
                totalCount={guests.totalCount}
                onPageChange={guests.goToPage}
                statusOf={(g) => g.status}
                statusOptions={['active', 'expired']}
                onStatusChange={(s) => setGuestStatus(s === 'all' ? null : s)}
                emptyText={emptyText(guests)}
                emptyKind={emptyKind(guests)}
                exportName="guests"
                exportRow={(g) => ({
                    id: g.id,
                    status: g.status,
                    createdAt: g.createdAt,
                    device: describeDevice(g) ?? '',
                    expiresAt: g.expiresAt,
                    lastSeenAt: g.lastSeenAt ?? '',
                    cardVotes: g.cardVotes,
                })}
            />

        </div>
    );
}

export default Users;
