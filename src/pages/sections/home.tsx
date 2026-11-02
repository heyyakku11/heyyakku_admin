import './home.css';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import CheckCard from '../../components/CheckCard';
import CreateCheck from './CreateCheck';
import type { ApiResponse } from '../../types/apiResponse';
import type { Check } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';
import { mondayOptions } from '../../utils/weeks';

const WEEKS_BACK = 12;
const WEEKS_AHEAD = 12;

function Home() {
    const [checks, setChecks] = useState<Check[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [creating, setCreating] = useState(false);
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

    // A one-deep navigation stack: the checks list, with the create form pushed on top.
    if (creating) {
        return (
            <CreateCheck
                onBack={() => setCreating(false)}
                onCreated={() => {
                    setCreating(false);
                    retry();
                }}
            />
        );
    }

    return (
        <div className="home-section">
            <div className="home-heading">
                <h2>{isCurrentWeek ? 'This week\'s checks' : 'Checks'}</h2>
                {!loading && !error && <span className="home-count">{checks.length}</span>}
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
                <button type="button" className="home-add" onClick={() => setCreating(true)}>
                    + Add check
                </button>
            </div>

            {loading && <p className="home-note">Loading checks…</p>}

            {error && (
                <p className="home-note home-error">
                    {error} <button type="button" onClick={retry}>Retry</button>
                </p>
            )}

            {!loading && !error && checks.length === 0 && (
                <p className="home-note">No checks are scheduled for {isCurrentWeek ? 'this week' : 'the selected week'}.</p>
            )}

            {!loading && !error && checks.length > 0 && (
                <div className="home-checks-row">
                    {checks.map((check) => (
                        <CheckCard key={check.id} check={check} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;
