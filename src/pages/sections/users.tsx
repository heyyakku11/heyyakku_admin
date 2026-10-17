import './users.css';
import DataTable, { StatusPill, type Column } from '../../components/DataTable';
import { DUMMY_USERS } from '../../data/dummyData';
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

const columns: Column<User>[] = [
    {
        key: 'id',
        label: 'User ID',
        sortValue: (u) => u.id,
        render: (u) => <span className="dt-mono">{u.id}</span>,
    },
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
        key: 'email',
        label: 'Email',
        sortValue: (u) => u.email.toLowerCase(),
        render: (u) => u.email,
    },
    {
        key: 'lastLogin',
        label: 'Last login',
        sortValue: (u) => u.lastLoginAt,
        render: (u) => <span className="dt-muted">{formatDateTime(u.lastLoginAt)}</span>,
    },
    {
        key: 'created',
        label: 'Created',
        sortValue: (u) => u.createdAt,
        render: (u) => <span className="dt-muted">{formatDate(u.createdAt)}</span>,
    },
    {
        key: 'status',
        label: 'Status',
        sortValue: (u) => u.status,
        render: (u) => <StatusPill status={u.status} />,
    },
];

function Users() {
    const users = DUMMY_USERS;

    return (
        <div className="users-section">

            {/* Header */}
            <div className="users-header">
                <div>
                    <h2>Users</h2>
                    <p>
                        Manage and monitor registered users.
                    </p>
                </div>

                <span className="user-count">
                    {users.length} users
                </span>
            </div>

            <DataTable
                title="All Users"
                rows={users}
                columns={columns}
                getId={(u) => u.id}
                searchText={(u) => `${u.displayName} ${u.email} ${u.id}`}
                searchPlaceholder="Search user"
                statusOf={(u) => u.status}
                statusOptions={['active', 'inactive', 'suspended']}
                exportName="users"
                exportRow={(u) => ({
                    id: u.id,
                    displayName: u.displayName,
                    email: u.email,
                    status: u.status,
                    lastLoginAt: u.lastLoginAt,
                    createdAt: u.createdAt,
                })}
            />

        </div>
    );
}

export default Users;
