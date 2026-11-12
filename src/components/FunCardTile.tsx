import './funcard.css';
import type { FunCardGroupTheme, FunCardItem } from '../types/check';

/** The type's name as the tilted raspberry tag that starts each fun card section. */
export function FunTypeTag({ children }: { children: React.ReactNode }) {
    return (
        <span className="fun-tag">
            <span className="fun-tag-text">{children}</span>
        </span>
    );
}

/**
 * One fun card as the admin sees it: the question on the type's background. There is no Ask now button here;
 * that belongs to the app. An inactive card is marked so it is not mistaken for a live one.
 */
export function FunCardTile({ card, theme }: { card: FunCardItem; theme: FunCardGroupTheme }) {
    return (
        <article
            className={`fun-tile${card.isActive ? '' : ' inactive'}`}
            style={{ background: theme.backgroundColor }}
        >
            <p className="fun-tile-question">{card.question}</p>
            {!card.isActive && <span className="fun-tile-badge">Inactive</span>}
        </article>
    );
}
