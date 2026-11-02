import { useCallback, useEffect, useState } from 'react';
import type { Page } from '../services/adminUsersService';
import { getErrorMessage } from '../utils/apiError';

export interface Loaded<T> {
    rows: T[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    totalCount: number;
}

interface Result<T> {
    /** Identifies the status, page and reload the rows belong to, so stale responses are ignored. */
    key: string;
    rows: T[];
    totalPages: number;
    totalCount: number;
    error: string | null;
}

/** Loads a list 10 rows per page; going to another page or status refetches, reload refetches the same page. */
export function useList<T>(
    load: (status: string | null, page: number) => Promise<Page<T>>,
    status: string | null,
): Loaded<T> & { reload: () => void; goToPage: (page: number) => void } {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<Result<T> | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const key = `${status ?? 'all'}:${page}:${reloadKey}`;

    useEffect(() => {
        let cancelled = false;

        load(status, page)
            .then((data) => {
                if (!cancelled) {
                    setResult({ key, rows: data.items, totalPages: data.totalPages, totalCount: data.totalCount, error: null });
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setResult({ key, rows: [], totalPages: 1, totalCount: 0, error: getErrorMessage(e) });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [load, status, page, key]);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    // A different status starts again from page 1.
    const [lastStatus, setLastStatus] = useState(status);
    if (lastStatus !== status) {
        setLastStatus(status);
        setPage(1);
    }

    // The previous rows stay on screen while the next page loads.
    return {
        rows: result?.rows ?? [],
        loading: result === null || result.key !== key,
        error: result?.key === key ? result.error : null,
        page,
        totalPages: result?.totalPages ?? 1,
        totalCount: result?.totalCount ?? 0,
        reload,
        goToPage: setPage,
    };
}
