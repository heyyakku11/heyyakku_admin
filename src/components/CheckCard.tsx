import './checkcard.css';
import type { Check } from '../types/check';

const DEFAULT_BACKGROUND = '#FFF9F6';

function safeColor(value: string) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim())
        ? value.trim()
        : DEFAULT_BACKGROUND;
}

/** Same layout as the app's current-week check card (mirror_check_card.dart). */
interface CheckCardProps {
    check: Check;
    /** Show the Active / Live status tags in the top-left corner. */
    showStatus?: boolean;
    /** Rendered in the card footer, e.g. the Edit and Delete buttons. */
    footer?: React.ReactNode;
}

function CheckCard({ check, showStatus = false, footer }: CheckCardProps) {
    const showQuestion = check.question.trim() !== '' && check.question !== check.title;
    const sticker = check.sticker.trim();

    return (
        <div className="check-card-frame">
        <article className="check-card" style={{ background: safeColor(check.backgroundColor) }}>
            <div className="check-card-top">
                {showStatus && (
                    <div className="check-card-tags">
                        <span className={`check-card-tag ${check.isActive ? 'on' : 'off'}`}>
                            {check.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="check-card-tag">{check.status === 'live' ? 'Live' : 'Upcoming'}</span>
                    </div>
                )}
                {sticker && (
                    <div className="check-card-sticker-col">
                        <span className="check-card-sticker">{sticker}</span>
                    </div>
                )}
            </div>

            <h3 className="check-card-title" title={check.title}>{check.title}</h3>
            {showQuestion && <p className="check-card-question" title={check.question}>{check.question}</p>}

            <div className="check-card-options">
                {check.options.map((option, i) => (
                    <div className="check-card-option" key={option.id}>
                        <span className="check-card-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="check-card-option-text" title={option.text}>{option.text}</span>
                        <span className="check-card-pct">??%</span>
                    </div>
                ))}
                <div className="check-card-option check-card-option-outlined">
                    <span className="check-card-letter check-card-letter-outlined">
                        {String.fromCharCode(65 + check.options.length)}
                    </span>
                    <span className="check-card-option-text">Friends add one</span>
                </div>
            </div>

            {footer && <div className="check-card-footer">{footer}</div>}
        </article>
        </div>
    );
}

export default CheckCard;
