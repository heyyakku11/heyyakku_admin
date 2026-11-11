import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import CardCarousel from '../../components/CardCarousel';
import EmptyState from '../../components/EmptyState';
import type { ApiResponse } from '../../types/apiResponse';
import type { AdminFunCard, Check } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';
import { funCardToCheck } from '../../utils/funCard';

interface FunCardsSectionProps {
    onAdd: () => void;
    onEdit: (card: AdminFunCard) => void;
    /** Change it to make the section reload (for example after saving a card). */
    reloadKey: number;
}

/** The "Just for fun" container: system-made cards with no live date, in the same carousel as the weekly checks. */
function FunCardsSection({ onAdd, onEdit, reloadKey }: FunCardsSectionProps) {
    const [cards, setCards] = useState<AdminFunCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [localReload, setLocalReload] = useState(0);
    const [deleting, setDeleting] = useState<AdminFunCard | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        api.get<ApiResponse<AdminFunCard[]>>('/api/v1/yakku/fun-cards')
            .then((res) => {
                if (cancelled) return;
                setCards(res.data.data ?? []);
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

    async function confirmDelete() {
        if (!deleting || deleteBusy) return;
        setDeleteBusy(true);
        setDeleteError(null);
        try {
            await api.delete(`/api/v1/yakku/fun-cards/${deleting.id}`);
            setDeleting(null);
            retry();
        } catch (e) {
            setDeleteError(getErrorMessage(e));
        } finally {
            setDeleteBusy(false);
        }
    }

    const byId = new Map(cards.map((card) => [card.id, card]));
    const items: Check[] = cards.map(funCardToCheck);

    return (
        <section className="home-box" aria-label="Just for fun cards">
            <div className="home-heading">
                <h2>Just for fun</h2>
                {!loading && !error && <span className="home-count">{cards.length}</span>}
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

            {!loading && !error && cards.length === 0 && (
                <EmptyState message="No just-for-fun cards yet. Add the first one." />
            )}

            {!loading && !error && cards.length > 0 && (
                <CardCarousel
                    cards={items}
                    noun="card"
                    eyebrow="JUST FOR FUN"
                    onEdit={(card) => {
                        const found = byId.get(card.id);
                        if (found) onEdit(found);
                    }}
                    onDelete={(card) => {
                        const found = byId.get(card.id);
                        if (!found) return;
                        setDeleteError(null);
                        setDeleting(found);
                    }}
                />
            )}

            {deleting && (
                <div className="confirm-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-fun-title">
                        <h3 id="delete-fun-title">Delete this card?</h3>
                        <p className="confirm-week">
                            "{deleting.question}" will be removed permanently. A card that users have already
                            made cannot be deleted; make it inactive instead.
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
        </section>
    );
}

export default FunCardsSection;
