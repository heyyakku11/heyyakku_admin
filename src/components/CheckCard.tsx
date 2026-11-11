import './checkcard.css';
import type { Check } from '../types/check';
import { resolveTheme } from '../utils/checkTheme';

/**
 * Preview of how a check looks in the Yakku app (the "This week's drop" card): the dark eyebrow pill, the
 * tilted sticker, the theme heading, the question, lettered options, a "friends add their own" row,
 * the Ask now button and the privacy note.
 */
interface CheckCardProps {
    check: Check;
    /** Show the Active / Live status tags above the card content (used in the checks list). */
    showStatus?: boolean;
    /** Rendered at the bottom of the card, e.g. the Edit and Delete buttons. */
    footer?: React.ReactNode;
}

function ShareIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V3" />
            <path d="M8 7l4-4 4 4" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2.5" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
    );
}


function CheckCard({ check, showStatus = false, footer }: CheckCardProps) {
    const theme = resolveTheme(check);
    const showQuestion = check.question.trim() !== '' && check.question !== theme.heading;
    const letter = (i: number) => String.fromCharCode(65 + i);

    return (
        <div className="check-card-frame">
            <article
                className="check-card"
                style={{
                    background: theme.background,
                    '--ck-heading': theme.headingColor,
                    '--ck-question': theme.questionColor,
                    '--ck-accent': theme.accent,
                    '--ck-sticker': theme.stickerColor,
                    '--ck-opt-bg': theme.optionBackground,
                    '--ck-opt-text': theme.optionText,
                } as React.CSSProperties}
            >
                {showStatus && (
                    <div className="check-card-tags">
                        <span className={`check-card-tag ${check.isActive ? 'on' : 'off'}`}>
                            {check.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="check-card-tag">{check.status === 'live' ? 'Live' : 'Upcoming'}</span>
                    </div>
                )}

                <div className="check-card-top">
                    <span className="check-card-eyebrow">
                        <i aria-hidden="true" />
                        THIS WEEK&apos;S DROP
                    </span>
                    <span className="check-card-sticker">{theme.sticker}</span>
                </div>

                <h3 className="check-card-title" title={theme.heading}>{theme.heading}</h3>
                {showQuestion && <p className="check-card-question" title={check.question}>{check.question}</p>}

                <div className="check-card-options">
                    {check.options.map((option, i) => (
                        <div className="check-card-option" key={option.id}>
                            <span className="check-card-letter">{letter(i)}</span>
                            <span className="check-card-option-text" title={option.text}>{option.text}</span>
                        </div>
                    ))}
                    <div className="check-card-option check-card-option-outlined">
                        <span className="check-card-letter check-card-letter-outlined">{letter(check.options.length)}</span>
                        <span className="check-card-option-text">Friends add their own</span>
                        <span className="check-card-plus" aria-hidden="true">+</span>
                    </div>
                </div>

                <div className="check-card-ask">
                    <ShareIcon />
                    Ask now
                </div>
                <p className="check-card-note">
                    <LockIcon />
                    Anonymous answers, real opinions
                </p>

                {footer && <div className="check-card-footer">{footer}</div>}
            </article>
        </div>
    );
}

export default CheckCard;
