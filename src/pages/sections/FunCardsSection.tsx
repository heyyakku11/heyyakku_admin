import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import CardCarousel from '../../components/CardCarousel';
import EmptyState from '../../components/EmptyState';
import type { ApiResponse } from '../../types/apiResponse';
import type { FunCardGroup } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';
import { funCardToCheck } from '../../utils/funCard';

interface FunCardsSectionProps {
    onAdd: () => void;
    /** Change it to make the section reload (for example after saving a card). */
    reloadKey: number;
}

/** The "Just for fun" container: every fun card type with its cards, in the same carousel as the weekly checks. */
function FunCardsSection({ onAdd, reloadKey }: FunCardsSectionProps) {
    const [groups, setGroups] = useState<FunCardGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [localReload, setLocalReload] = useState(0);

    useEffect(() => {
        let cancelled = false;
        api.get<ApiResponse<FunCardGroup[]>>('/api/v1/yakku/fun-cards')
            .then((res) => {
                if (cancelled) return;
                setGroups(res.data.data ?? []);
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
    }, [reloadKey, localReload]);

    const retry = useCallback(() => {
        setLoading(true);
        setError(null);
        setLocalReload((k) => k + 1);
    }, []);

    const total = groups.reduce((sum, group) => sum + group.cards.length, 0);

    return (
        <section className="home-box" aria-label="Just for fun cards">
            <div className="home-heading">
                <h2>Just for fun</h2>
                {!loading && !error && <span className="home-count">{total}</span>}
                <button
                    type="button"
                    className={`home-refresh${loading ? ' spinning' : ''}`}
                    aria-label="Refresh cards"
                    title="Refresh"
                    onClick={retry}
                    disabled={loading}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                        <path d="M21 3v6h-6" />
                    </svg>
                </button>
                <button type="button" className="home-add" onClick={onAdd}>
                    + Add card
                </button>
            </div>

            {loading && <EmptyState kind="loading" message="Loading cards…" />}

            {error && (
                <p className="home-note home-error">
                    {error} <button type="button" onClick={retry}>Retry</button>
                </p>
            )}

            {!loading && !error && total === 0 && (
                <EmptyState message="No just-for-fun cards yet. Add the first one." />
            )}

            {!loading && !error && groups.filter((group) => group.cards.length > 0).map((group) => (
                <div key={group.theme.funCardTypeId}>
                    <h3 className="home-subheading">{group.theme.heading}</h3>
                    <CardCarousel
                        cards={group.cards.map((card) => funCardToCheck(card, group.theme))}
                        noun="card"
                        eyebrow="JUST FOR FUN"
                    />
                </div>
            ))}
        </section>
    );
}

export default FunCardsSection;
