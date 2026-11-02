import './polls.css';
import DataTable, { StatusPill, type Column } from '../../components/DataTable';
import { useList } from '../../hooks/usePagedList';
import { fetchPolls } from '../../services/adminUsersService';
import type { Poll } from '../../types/poll';
import { useEffect, useState } from 'react';

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

/** Time left in hours ("5 hrs left"), switching to minutes ("45 min left") at an hour or less. */
function formatTimeLeft(ms: number) {
    const minutes = Math.max(Math.ceil(ms / 60000), 1);
    if (minutes <= 60) return `${minutes} min left`;
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} left`;
}

/** A live poll shows its expiry and the time left (green); an expired one shows just its expiry time (red). */
function ExpiryCell({ poll, now }: { poll: Poll; now: number }) {
    if (!poll.expiresAt) return <span className="dt-muted">No expiry</span>;

    const remaining = new Date(poll.expiresAt).getTime() - now;
    const expired = poll.status === 'expired' || remaining <= 0;
    // Drafts and closed polls are not live, so there is no countdown to show.
    const live = poll.status === 'active' && !expired;

    if (expired) {
        return <span className="poll-expiry-expired">{formatDateTime(poll.expiresAt)}</span>;
    }

    return (
        <div className="poll-expiry">
            <span className="dt-muted">{formatDateTime(poll.expiresAt)}</span>
            {live && <span className="poll-expiry-tag live">{formatTimeLeft(remaining)}</span>}
        </div>
    );
}

const getColumns = (now: number): Column<Poll>[] => [
    {
        key: 'question',
        label: 'Question',
        sortValue: (p) => p.question.toLowerCase(),
        render: (p) => <div className="dt-clip" title={p.question}>{p.question}</div>,
    },
    {
        key: 'type',
        label: 'Poll type',
        sortValue: (p) => p.pollType,
        render: (p) => <span className="dt-tag">{p.pollType}</span>,
    },
    {
        key: 'created',
        label: 'Created at',
        sortValue: (p) => p.createdAt,
        render: (p) => <span className="dt-muted">{formatDateTime(p.createdAt)}</span>,
    },
    {
        key: 'expires',
        label: 'Expiry time',
        sortValue: (p) => p.expiresAt ?? '',
        render: (p) => <ExpiryCell poll={p} now={now} />,
    },
    {
        key: 'status',
        label: 'Status',
        sortValue: (p) => p.status,
        render: (p) => <StatusPill status={p.status} />,
    },
    {
        key: 'creator',
        label: 'Creator',
        sortValue: (p) => p.creatorAnonymousName.toLowerCase(),
        render: (p) => p.creatorAnonymousName,
    },
    {
        key: 'votes',
        label: 'Votes',
        sortValue: (p) => p.voteCount,
        render: (p) => p.voteCount,
    },
    {
        key: 'reasons',
        label: 'Reasons',
        sortValue: (p) => p.reasonCount,
        render: (p) => p.reasonCount,
    },
];

function Polls() {
    const [status, setStatus] = useState<string | null>(null);
    const polls = useList(fetchPolls, status);

    // Re-render every minute so the time left keeps counting down.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="polls-section">

            <DataTable
                title="All Polls"
                rows={polls.rows}
                columns={getColumns(now)}
                showView={false}
                getId={(p) => p.id}
                searchText={(p) => `${p.question} ${p.creatorAnonymousName} ${p.id}`}
                searchPlaceholder="Search poll"
                simple
                onRefresh={polls.reload}
                refreshing={polls.loading}
                page={polls.page}
                totalPages={polls.totalPages}
                totalCount={polls.totalCount}
                onPageChange={polls.goToPage}
                statusOf={(p) => p.status}
                statusOptions={['draft', 'active', 'closed', 'expired']}
                onStatusChange={(s) => setStatus(s === 'all' ? null : s)}
                emptyText={polls.loading ? 'Loading…' : polls.error ?? 'No results found.'}
                emptyKind={polls.loading ? 'loading' : polls.error ? 'error' : 'empty'}
                exportName="polls"
                exportRow={(p) => ({
                    id: p.id,
                    question: p.question,
                    pollType: p.pollType,
                    createdAt: p.createdAt,
                    expiresAt: p.expiresAt ?? '',
                    status: p.status,
                    creator: p.creatorAnonymousName,
                    votes: p.voteCount,
                    reasons: p.reasonCount,
                })}
            />

        </div>
    );
}

export default Polls;
