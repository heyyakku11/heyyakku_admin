import { useState } from 'react';
import CheckCard from './CheckCard';
import type { Check } from '../types/check';

interface CardCarouselProps {
    cards: Check[];
    /** Accessible name of one card ("check", "card"). */
    noun?: string;
    /** Eyebrow pill text on each card; defaults to the weekly check one. */
    eyebrow?: string;
    /** Buttons are shown only when the matching handler is given. */
    onEdit?: (card: Check) => void;
    onDelete?: (card: Check) => void;
}

/**
 * Stacked carousel: the selected card sits on top, its neighbours peek out behind it. Used for the
 * weekly checks and the just-for-fun cards. Remount it (change its key) to start again from the first card.
 */
function CardCarousel({ cards, noun = 'check', eyebrow, onEdit, onDelete }: CardCarouselProps) {
    const [selected, setSelected] = useState(0);
    // A card may have been removed since the last render.
    const slide = Math.min(selected, Math.max(0, cards.length - 1));

    return (
        <>
            <div className="home-carousel">
                <button
                    type="button"
                    className="home-carousel-arrow"
                    aria-label={`Previous ${noun}`}
                    onClick={() => setSelected(Math.max(0, slide - 1))}
                    disabled={slide <= 0}
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 5l-7 7 7 7" />
                    </svg>
                </button>
                <div className="home-carousel-viewport">
                    <div className="home-carousel-track">
                        {cards.map((card, i) => (
                            <div
                                className={`home-check${i === slide ? ' active' : ''}`}
                                key={card.id}
                                aria-hidden={i !== slide}
                                style={{ '--d': i - slide } as React.CSSProperties}
                                onClick={() => i !== slide && setSelected(i)}
                            >
                                <CheckCard
                                    check={card}
                                    showStatus
                                    eyebrow={eyebrow}
                                    footer={
                                        onEdit || onDelete ? (
                                            <>
                                                {onEdit && (
                                                    <button type="button" tabIndex={i === slide ? 0 : -1} onClick={() => onEdit(card)}>Edit</button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        type="button"
                                                        className="danger"
                                                        tabIndex={i === slide ? 0 : -1}
                                                        onClick={() => onDelete(card)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </>
                                        ) : undefined
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    className="home-carousel-arrow"
                    aria-label={`Next ${noun}`}
                    onClick={() => setSelected(Math.min(cards.length - 1, slide + 1))}
                    disabled={slide >= cards.length - 1}
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {cards.length > 1 && (
                <div className="home-dots" role="tablist" aria-label={`${noun}s`}>
                    {cards.map((card, i) => (
                        <button
                            type="button"
                            role="tab"
                            key={card.id}
                            aria-selected={i === slide}
                            aria-label={`${noun} ${i + 1} of ${cards.length}`}
                            className={i === slide ? 'on' : ''}
                            onClick={() => setSelected(i)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

export default CardCarousel;
