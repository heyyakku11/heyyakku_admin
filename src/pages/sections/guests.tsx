import './guests.css';
import DataTable, { StatusPill, type Column } from '../../components/DataTable';
import { DUMMY_GUESTS } from '../../data/dummyData';
import type { Guest } from '../../types/guest';

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

const columns: Column<Guest>[] = [
    {
        key: 'id',
        label: 'Guest ID',
        sortValue: (g) => g.id,
        render: (g) => (
            <div className="dt-identity">
                <div className="dt-avatar">G</div>
                <span className="dt-mono">{g.id}</span>
            </div>
        ),
    },
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

function Guests() {

    const guests = DUMMY_GUESTS;

    return (
        <div className="guests-section">

            {/* Header */}
            <div className="guests-header">

                <div>
                    <h2>Guests</h2>

                    <p>
                        Manage and monitor guest sessions.
                    </p>
                </div>

                <span className="guest-count">
                    {guests.length} guests
                </span>

            </div>

            <DataTable
                title="All Guests"
                rows={guests}
                columns={columns}
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

export default Guests;
