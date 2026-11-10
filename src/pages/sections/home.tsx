import './home.css';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import CheckCard from '../../components/CheckCard';
import EmptyState from '../../components/EmptyState';
import CreateCheck from './CreateCheck';
import CreateTheme from './CreateTheme';
import type { ApiResponse } from '../../types/apiResponse';
import type { Check } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';
import { mondayOptions } from '../../utils/weeks';

const WEEKS_BACK = 5;
const WEEKS_AHEAD = 5;

function Home() {
    const [checks, setChecks] = useState<Check[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    // null = the list, 'new' = the create form, a check = the edit form for it.
    const [form, setForm] = useState<Check | 'new' | null>(null);
    // The separate create-theme page opens on top of the check form, which stays mounted so nothing typed is lost.
    const [themePage, setThemePage] = useState(false);
    const [themesVersion, setThemesVersion] = useState(0);
    const [newThemeId, setNewThemeId] = useState<string | undefined>();
    const [deleting, setDeleting] = useState<Check | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const weeks = useMemo(() => mondayOptions(WEEKS_BACK, WEEKS_AHEAD), []);
    const [week, setWeek] = useState(() => weeks.find((w) => w.isCurrent)!.value);
    const isCurrentWeek = weeks.find((w) => w.value === week)?.isCurrent ?? false;

    useEffect(() => {
        let cancelled = false;

        api.get<ApiResponse<Check[]>>('/api/v1/yakku/checks', { params: { weekStart: week } })
            .then((res) => {
                if (cancelled) return;
                setChecks(res.data.data ?? []);
                setError(null);
            })
            .catch((e) => {
                if (!cancelled) setError(getErrorMessage(e));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey, week]);

    function retry() {
        setLoading(true);
        setError(null);
        setReloadKey((k) => k + 1);
    }

    async function confirmDelete() {
        if (!deleting || deleteBusy) return;
        setDeleteBusy(true);
        setDeleteError(null);
        try {
            await api.delete(`/api/v1/yakku/checks/${deleting.id}`);
            setDeleting(null);
            retry();
        } catch (e) {
            setDeleteError(getErrorMessage(e));
        } finally {
            setDeleteBusy(false);
        }
    }

    // A one-deep navigation stack: the checks list, with the form pushed on top.
    if (form !== null) {
        return (
            <>
                <div hidden={themePage}>
                    <CreateCheck
                        check={form === 'new' ? undefined : form}
                        onBack={() => setForm(null)}
                        onSaved={() => {
                            setForm(null);
                            retry();
                        }}
                        onCreateTheme={() => setThemePage(true)}
                        themesVersion={themesVersion}
                        preferredThemeId={newThemeId}
                    />
                </div>
                {themePage && (
                    <CreateTheme
                        onBack={() => setThemePage(false)}
                        onCreated={(created) => {
                            setNewThemeId(created.id);
                            setThemesVersion((v) => v + 1);
                            setThemePage(false);
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <div className="home-section">
            <div className="home-heading">
                <h2>{isCurrentWeek ? 'This week\'s checks' : 'Checks'}</h2>
                {!loading && !error && <span className="home-count">{checks.length}</span>}
                <button
                    type="button"
                    className={`home-refresh${loading ? ' spinning' : ''}`}
                    aria-label="Refresh checks"
                    title="Refresh"
                    onClick={retry}
                    disabled={loading}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                        <path d="M21 3v6h-6" />
                    </svg>
                </button>
                <select
                    className="home-week"
                    aria-label="Live week"
                    value={week}
                    onChange={(e) => {
                        setLoading(true);
                        setError(null);
                        setWeek(e.target.value);
                    }}
                >
                    {weeks.map((w) => (
                        <option key={w.value} value={w.value}>Live week: {w.label}</option>
                    ))}
                </select>
                <button type="button" className="home-add" onClick={() => setForm('new')}>
                    + Add check
                </button>
            </div>

            {loading && <EmptyState kind="loading" message="Loading checks…" />}

            {error && (
                <p className="home-note home-error">
                    {error} <button type="button" onClick={retry}>Retry</button>
                </p>
            )}

            {!loading && !error && checks.length === 0 && (
                <EmptyState message={`No checks are scheduled for ${isCurrentWeek ? 'this week' : 'the selected week'}.`} />
            )}

            {!loading && !error && checks.length > 0 && (
                <div className="home-checks-row">
                    {checks.map((check) => (
                        <div className="home-check" key={check.id}>
                            <CheckCard
                                check={check}
                                showStatus
                                footer={
                                    <>
                                        <button type="button" onClick={() => setForm(check)}>Edit</button>
                                        <button
                                            type="button"
                                            className="danger"
                                            onClick={() => {
                                                setDeleteError(null);
                                                setDeleting(check);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </>
                                }
                            />
                        </div>
                    ))}
                </div>
            )}

            {deleting && (
                <div className="confirm-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
                        <h3 id="delete-title">Delete this check?</h3>
                        <p className="confirm-week">
                            "{deleting.title}" will be removed permanently. A check that users have already
                            answered cannot be deleted; make it inactive instead.
                        </p>
                        {deleteError && <p className="cc-error" role="alert">{deleteError}</p>}
                        <div className="cc-actions">
                            <button type="button" className="cc-btn" onClick={() => setDeleting(null)} disabled={deleteBusy}>
                                Cancel
                            </button>
                            <button type="button" className="cc-btn cc-btn-primary" onClick={confirmDelete} disabled={deleteBusy}>
                                {deleteBusy ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
