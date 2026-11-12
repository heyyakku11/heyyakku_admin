import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';
import { FunCardTile, FunTypeTag } from '../../components/FunCardTile';
import type { ApiResponse } from '../../types/apiResponse';
import type { FunCardGroup, FunCardGroupTheme } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';

interface FunCardsSectionProps {
    onAdd: () => void;
    /** Opens the form that defines a new card type. */
    onAddType: () => void;
    /** Opens the full list of one card type. */
    onSeeAll: (theme: FunCardGroupTheme) => void;
    /** Change it to make the section reload (for example after saving a card). */
    reloadKey: number;
}

/**
 * The "Just for fun" container: each card type starts its own line with its name, followed by a row of its cards
 * that slides sideways. A row holds a preview (the API caps it at 4); "See all" opens the whole type.
 */
function FunCardsSection({ onAdd, onAddType, onSeeAll, reloadKey }: FunCardsSectionProps) {
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

    const total = groups.reduce((sum, group) => sum + group.totalCount, 0);

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
                <button type="button" className="home-add" onClick={onAddType}>
                    + Add type
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
                <div className="fun-type" key={group.theme.funCardTypeId}>
                    <FunTypeTag>{group.theme.heading}</FunTypeTag>
                    <div className="fun-row">
                        {group.cards.map((card) => (
                            <FunCardTile key={card.id} card={card} theme={group.theme} />
                        ))}
                        {group.totalCount > group.cards.length && (
                            <button type="button" className="fun-see-all" onClick={() => onSeeAll(group.theme)}>
                                <span className="fun-see-all-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                                See all ({group.totalCount})
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </section>
    );
}

export default FunCardsSection;
