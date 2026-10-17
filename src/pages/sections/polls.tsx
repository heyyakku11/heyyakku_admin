import './polls.css';
import DataTable, { StatusPill, type Column } from '../../components/DataTable';
import { DUMMY_POLLS } from '../../data/dummyData';
import type { Poll } from '../../types/poll';

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

const columns: Column<Poll>[] = [
    {
        key: 'question',
        label: 'Question',
        sortValue: (p) => p.question.toLowerCase(),
        render: (p) => <div className="dt-clip" title={p.question}>{p.question}</div>,
    },
    {
        key: 'votes',
        label: 'Total votes',
        sortValue: (p) => p.totalVoteCount,
        render: (p) => p.totalVoteCount,
    },
    {
        key: 'optionType',
        label: 'Option type',
        sortValue: (p) => p.optionType,
        render: (p) => <span className="dt-tag">{p.optionType}</span>,
    },
    {
        key: 'expires',
        label: 'Expires',
        sortValue: (p) => p.expiresAt ?? '',
        render: (p) => (
            <span className="dt-muted">{p.expiresAt ? formatDateTime(p.expiresAt) : 'No expiry'}</span>
        ),
    },
    {
        key: 'created',
        label: 'Created',
        sortValue: (p) => p.createdAt,
        render: (p) => <span className="dt-muted">{formatDate(p.createdAt)}</span>,
    },
    {
        key: 'status',
        label: 'Status',
        sortValue: (p) => p.status,
        render: (p) => <StatusPill status={p.status} />,
    },
];

function Polls() {
    const polls = DUMMY_POLLS;

    return (
        <div className="polls-section">

            <div className="polls-header">
                <div>
                    <h2>Polls</h2>
                    <p>Manage and monitor polls created by users.</p>
                </div>

                <span className="poll-count">
                    {polls.length} polls
                </span>
            </div>

            <DataTable
                title="All Polls"
                rows={polls}
                columns={columns}
                getId={(p) => p.id}
                searchText={(p) => `${p.question} ${p.id}`}
                searchPlaceholder="Search poll"
                statusOf={(p) => p.status}
                statusOptions={['active', 'inactive', 'expired']}
                exportName="polls"
                exportRow={(p) => ({
                    id: p.id,
                    question: p.question,
                    creatorId: p.creatorId,
                    status: p.status,
                    optionType: p.optionType,
                    totalVoteCount: p.totalVoteCount,
                    expiresAt: p.expiresAt ?? '',
                    createdAt: p.createdAt,
                })}
            />

        </div>
    );
}

export default Polls;
