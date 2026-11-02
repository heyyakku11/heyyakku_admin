import './checkcard.css';
import type { Check } from '../types/check';

const DEFAULT_BACKGROUND = '#FFF9F6';

function safeColor(value: string) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim())
        ? value.trim()
        : DEFAULT_BACKGROUND;
}

/** Same layout as the app's current-week check card (mirror_check_card.dart). */
function CheckCard({ check, large = false }: { check: Check; large?: boolean }) {
    const showQuestion = check.question.trim() !== '' && check.question !== check.title;
    const sticker = check.sticker.trim();

    return (
        <article className={`check-card${large ? ' check-card-large' : ''}`} style={{ background: safeColor(check.backgroundColor) }}>
            <div className="check-card-top">
                {sticker && (
                    <div className="check-card-sticker-col">
                        <span className="check-card-sticker">{sticker}</span>
                    </div>
                )}
            </div>

            <h3 className="check-card-title">{check.title}</h3>
            {showQuestion && <p className="check-card-question">{check.question}</p>}

            <div className="check-card-options">
                {check.options.map((option, i) => (
                    <div className="check-card-option" key={option.id}>
                        <span className="check-card-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="check-card-option-text">{option.text}</span>
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
        </article>
    );
}

export default CheckCard;
