import './home.css';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import CardCarousel from '../../components/CardCarousel';
import EmptyState from '../../components/EmptyState';
import CreateCheck from './CreateCheck';
import CreateFunCard from './CreateFunCard';
import CreateCardType from './CreateCardType';
import FunCardsByType from './FunCardsByType';
import FunCardsSection from './FunCardsSection';
import type { ApiResponse } from '../../types/apiResponse';
import type { Check, FunCardGroupTheme } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';
import { mondayOptions } from '../../utils/weeks';

const WEEKS_BACK = 5;
const WEEKS_AHEAD = 5;

function Home() {
    const [checks, setChecks] = useState<Check[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    // false = the list, true = the create check form.
    const [creating, setCreating] = useState(false);
    const weeks = useMemo(() => mondayOptions(WEEKS_BACK, WEEKS_AHEAD), []);
    const [week, setWeek] = useState(() => weeks.find((w) => w.isCurrent)!.value);
    // The just-for-fun create form. funReload refreshes its container after a save.
    const [funCreating, setFunCreating] = useState(false);
    const [funTypeCreating, setFunTypeCreating] = useState(false);
    const [checkTypeCreating, setCheckTypeCreating] = useState(false);
    // The fun card type whose whole list ("See all") is open.
    const [seeAllType, setSeeAllType] = useState<FunCardGroupTheme | null>(null);
    const [funReload, setFunReload] = useState(0);
    const weekIndex = weeks.findIndex((w) => w.value === week);
    const isCurrentWeek = weeks[weekIndex]?.isCurrent ?? false;

    // Moves the week slider by one week (-1 = previous, 1 = next) within the available range.
    function stepWeek(delta: number) {
        const next = weeks[weekIndex + delta];
        if (!next) return;
        setLoading(true);
        setError(null);
        setWeek(next.value);
    }

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

    // A one-deep navigation stack: the checks list, with the form pushed on top.
    if (creating) {
        return (
            <CreateCheck
                onBack={() => setCreating(false)}
                onSaved={() => {
                    setCreating(false);
                    retry();
                }}
            />
        );
    }

    if (funCreating) {
        return (
            <CreateFunCard
                onBack={() => setFunCreating(false)}
                onSaved={() => {
                    setFunCreating(false);
                    setFunReload((k) => k + 1);
                }}
            />
        );
    }

    if (seeAllType) {
        return <FunCardsByType type={seeAllType} onBack={() => setSeeAllType(null)} />;
    }

    if (checkTypeCreating) {
        return (
            <CreateCardType
                kind="check"
                onBack={() => setCheckTypeCreating(false)}
                onSaved={() => setCheckTypeCreating(false)}
            />
        );
    }

    if (funTypeCreating) {
        return (
            <CreateCardType
                kind="fun"
                onBack={() => setFunTypeCreating(false)}
                onSaved={() => {
                    setFunTypeCreating(false);
                    setFunReload((k) => k + 1);
                }}
            />
        );
    }

    return (
        <div className="home-section">
          <section className="home-box" aria-label="Weekly active checks">
            <div className="home-heading">
                <h2>{isCurrentWeek ? 'Weekly active checks' : 'Checks'}</h2>
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
                <div className="home-weeknav" role="group" aria-label="Live week">
                    <button
                        type="button"
                        className="home-weeknav-arrow"
                        aria-label="Previous week"
                        onClick={() => stepWeek(-1)}
                        disabled={weekIndex <= 0}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15 5l-7 7 7 7" />
                        </svg>
                    </button>
                    <span className="home-weeknav-label" aria-live="polite">
                        <small>Live week</small>
                        {weeks[weekIndex]?.label ?? week}
                    </span>
                    <button
                        type="button"
                        className="home-weeknav-arrow"
                        aria-label="Next week"
                        onClick={() => stepWeek(1)}
                        disabled={weekIndex < 0 || weekIndex >= weeks.length - 1}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <button type="button" className="home-add" onClick={() => setCheckTypeCreating(true)}>
                    + Add type
                </button>
                <button type="button" className="home-add" onClick={() => setCreating(true)}>
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
                <CardCarousel
                    key={week}
                    cards={checks}
                />
            )}
          </section>

            <FunCardsSection
                reloadKey={funReload}
                onAdd={() => setFunCreating(true)}
                onAddType={() => setFunTypeCreating(true)}
                onSeeAll={setSeeAllType}
            />

        </div>
    );
}

export default Home;
