import { useMemo, useState, type ReactNode } from 'react';
import './datatable.css';

export interface Column<T> {
    key: string;
    label: string;
    render: (row: T) => ReactNode;
    /** When set, the column header sorts by this value. */
    sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
    title: string;
    rows: T[];
    columns: Column<T>[];
    getId: (row: T) => string;
    searchText: (row: T) => string;
    searchPlaceholder: string;
    statusOf: (row: T) => string;
    statusOptions: string[];
    exportName: string;
    exportRow: (row: T) => Record<string, string | number>;
    onView?: (row: T) => void;
    onMenu?: (row: T) => void;
}

export function StatusPill({ status }: { status: string }) {
    return (
        <span className={`dt-pill dt-pill--${status}`}>
            <span className="dt-pill-dot" />
            {status}
        </span>
    );
}

function toCsv(rows: Record<string, string | number>[]): string {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    return [headers.map(escape).join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

function DataTable<T>({
    title,
    rows,
    columns,
    getId,
    searchText,
    searchPlaceholder,
    statusOf,
    statusOptions,
    exportName,
    exportRow,
    onView,
    onMenu,
}: DataTableProps<T>) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        let result = rows.filter(
            (row) =>
                (status === 'all' || statusOf(row) === status) &&
                (q === '' || searchText(row).toLowerCase().includes(q)),
        );
        const col = sort && columns.find((c) => c.key === sort.key);
        if (sort && col?.sortValue) {
            const get = col.sortValue;
            const dir = sort.dir === 'asc' ? 1 : -1;
            result = [...result].sort((a, b) => {
                const x = get(a);
                const y = get(b);
                return (x < y ? -1 : x > y ? 1 : 0) * dir;
            });
        }
        return result;
    }, [rows, query, status, sort, columns, statusOf, searchText]);

    function toggleSort(col: Column<T>) {
        if (!col.sortValue) return;
        setSort((prev) =>
            prev?.key !== col.key ? { key: col.key, dir: 'asc' } : prev.dir === 'asc' ? { key: col.key, dir: 'desc' } : null,
        );
    }

    function exportCsv() {
        const blob = new Blob([toCsv(visible.map(exportRow))], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportName}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="dt-card">
            <div className="dt-toolbar">
                <h3 className="dt-title">{title}</h3>

                <div className="dt-controls">
                    <label className="dt-search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            aria-label={searchPlaceholder}
                        />
                    </label>

                    <select
                        className="dt-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        aria-label="Filter by status"
                    >
                        <option value="all">All Status</option>
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                        ))}
                    </select>

                    <button type="button" className="dt-btn" onClick={exportCsv} disabled={visible.length === 0}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            <div className="dt-scroll">
                <table className="dt-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} aria-sort={sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                                    {col.sortValue ? (
                                        <button type="button" className="dt-sort" onClick={() => toggleSort(col)}>
                                            {col.label}
                                            <span className={`dt-sort-icon ${sort?.key === col.key ? 'on' : ''}`} aria-hidden="true">
                                                {sort?.key === col.key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
                                            </span>
                                        </button>
                                    ) : (
                                        col.label
                                    )}
                                </th>
                            ))}
                            <th className="dt-actions-head">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((row) => {
                            const id = getId(row);
                            return (
                                <tr key={id}>
                                    {columns.map((col) => (
                                        <td key={col.key}>{col.render(row)}</td>
                                    ))}
                                    <td>
                                        <div className="dt-actions">
                                            <button type="button" className="dt-icon-btn" aria-label="View" onClick={() => onView?.(row)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                                                </svg>
                                            </button>
                                            <button type="button" className="dt-icon-btn" aria-label="More actions" onClick={() => onMenu?.(row)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                    <circle cx="12" cy="5" r="1.8" />
                                                    <circle cx="12" cy="12" r="1.8" />
                                                    <circle cx="12" cy="19" r="1.8" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {visible.length === 0 && (
                            <tr>
                                <td className="dt-empty" colSpan={columns.length + 1}>
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;
