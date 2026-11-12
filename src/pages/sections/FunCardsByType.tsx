import './createcheck.css';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import BackButton from '../../components/BackButton';
import EmptyState from '../../components/EmptyState';
import { FunCardTile, FunTypeTag } from '../../components/FunCardTile';
import type { ApiResponse } from '../../types/apiResponse';
import type { FunCardGroup, FunCardGroupTheme } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';

interface FunCardsByTypeProps {
    /** The card type whose whole list is shown. */
    type: FunCardGroupTheme;
    onBack: () => void;
}

/** "See all" for one fun card type: every card of the type (active or not), from GET fun-cards/themes/{id}/cards. */
function FunCardsByType({ type, onBack }: FunCardsByTypeProps) {
    const [group, setGroup] = useState<FunCardGroup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let cancelled = false;
        api.get<ApiResponse<FunCardGroup>>(`/api/v1/yakku/fun-cards/themes/${type.funCardTypeId}/cards`)
            .then((res) => {
                if (cancelled) return;
                setGroup(res.data.data ?? null);
                setError(null);
            })
            .catch((e) => {
                if (!cancelled) setError(getErrorMessage(e));
            });
        return () => {
            cancelled = true;
        };
    }, [type.funCardTypeId, reload]);

    // The theme can come back newer than the one the dashboard row was built from.
    const theme = group?.theme ?? type;

    return (
        <div className="cc">
            <header className="cc-header">
                <BackButton onClick={onBack} />
            </header>

            <div className="fun-type">
                <FunTypeTag>{theme.heading}</FunTypeTag>

                {error && (
                    <p className="home-note home-error">
                        {error}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setError(null);
                                setReload((k) => k + 1);
                            }}
                        >
                            Retry
                        </button>
                    </p>
                )}

                {!error && group === null && <EmptyState kind="loading" message="Loading cards…" />}

                {group !== null && group.cards.length === 0 && <EmptyState message="No cards in this type yet." />}

                {group !== null && group.cards.length > 0 && (
                    <div className="fun-grid">
                        {group.cards.map((card) => (
                            <FunCardTile key={card.id} card={card} theme={theme} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FunCardsByType;
