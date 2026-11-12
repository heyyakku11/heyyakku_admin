import './createcheck.css';
import { useState } from 'react';
import api from '../../services/api';
import BackButton from '../../components/BackButton';
import CheckCard from '../../components/CheckCard';
import type { Check } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';
import { COLOR_PAIRS } from '../../utils/colorPairs';

const NAME_MAX = 100;
const TAG_MAX = 100;

/** The two kinds of card type an admin can define; each has its own endpoint and wording. */
const KINDS = {
    check: {
        endpoint: '/api/v1/yakku/check-themes',
        noun: 'check type',
        title: 'Create check type',
        eyebrow: "THIS WEEK'S DROP",
        namePlaceholder: 'e.g. Mirror Check',
        usedFor: 'creating checks',
        intro: 'A check type sets the name, colors and tag that every check under it shares.',
    },
    fun: {
        endpoint: '/api/v1/yakku/fun-cards/themes',
        noun: 'card type',
        title: 'Create card type',
        eyebrow: 'JUST FOR FUN',
        namePlaceholder: 'e.g. Emotional',
        usedFor: 'creating fun cards',
        intro: 'A card type sets the name, colors and tag that every card under it shares.',
    },
} as const;

interface CreateCardTypeProps {
    kind: keyof typeof KINDS;
    onBack: () => void;
    onSaved: () => void;
}

/**
 * Define a new check type or fun card type (a theme): its name, a color pair chosen from the fixed list, and an
 * optional tag. The admin never types a color code.
 */
function CreateCardType({ kind, onBack, onSaved }: CreateCardTypeProps) {
    const copy = KINDS[kind];
    const [name, setName] = useState('');
    const [pairId, setPairId] = useState(COLOR_PAIRS[0].id);
    const [tag, setTag] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pair = COLOR_PAIRS.find((p) => p.id === pairId) ?? COLOR_PAIRS[0];

    // A sample card so the pair can be judged before saving.
    const preview: Check = {
        id: 'preview',
        weekStart: '',
        title: name.trim() || 'Type name',
        question: 'Your question will appear here',
        backgroundColor: pair.backgroundColor,
        labelColor: pair.labelColor,
        isActive: true,
        status: 'live',
        options: [
            { id: '0', text: 'Option 1' },
            { id: '1', text: 'Option 2' },
        ],
    };

    function problem(): string | null {
        if (!name.trim()) return 'Type name is required.';
        if (name.trim().length > NAME_MAX) return `Type name must be at most ${NAME_MAX} characters.`;
        if (tag.trim().length > TAG_MAX) return `Tag must be at most ${TAG_MAX} characters.`;
        return null;
    }

    // Validates, then asks the admin to reconfirm before anything is sent.
    function review(e: React.FormEvent) {
        e.preventDefault();
        if (submitting) return;

        const message = problem();
        if (message) {
            setError(message);
            return;
        }
        setError(null);
        setConfirming(true);
    }

    async function submit() {
        if (submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            await api.post(copy.endpoint, {
                name: name.trim(),
                backgroundColor: pair.backgroundColor,
                labelColor: pair.labelColor,
                tag: tag.trim() || null,
            });
            onSaved();
        } catch (err) {
            // For example 409 when a type with this name already exists.
            setConfirming(false);
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <div className="cc">
            <header className="cc-header">
                <BackButton onClick={onBack} disabled={submitting} />
                <div>
                    <h2>{copy.title}</h2>
                    <p>{copy.intro}</p>
                </div>
            </header>

            <div className="cc-body">
                <form className="cc-form" onSubmit={review}>
                    <div className="cc-card">
                        <label className="cc-field">
                            <span className="cc-label">Type name</span>
                            <input
                                value={name}
                                maxLength={NAME_MAX}
                                placeholder={copy.namePlaceholder}
                                onChange={(e) => setName(e.target.value)}
                                disabled={submitting}
                            />
                            <span className="cc-count">{name.length}/{NAME_MAX}</span>
                        </label>

                        <div className="cc-field">
                            <label className="cc-label" htmlFor="cc-type-pair">Color pair</label>
                            <div className="cc-pair">
                                <span
                                    className="cc-pair-swatch"
                                    aria-hidden="true"
                                    style={{ background: pair.backgroundColor, color: pair.labelColor }}
                                >
                                    Aa
                                </span>
                                <select
                                    id="cc-type-pair"
                                    value={pairId}
                                    onChange={(e) => setPairId(e.target.value)}
                                    disabled={submitting}
                                >
                                    {COLOR_PAIRS.map((p) => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                            <span className="cc-help">The background and heading colors of every card of this type.</span>
                        </div>

                        <label className="cc-field">
                            <span className="cc-label">Tag (optional)</span>
                            <input
                                value={tag}
                                maxLength={TAG_MAX}
                                placeholder="e.g. how people see you"
                                onChange={(e) => setTag(e.target.value)}
                                disabled={submitting}
                            />
                            <span className="cc-help">A short descriptor of what this type is about.</span>
                        </label>
                    </div>

                    {error && <p className="cc-error" role="alert">{error}</p>}

                    <button type="submit" className="cc-btn cc-btn-primary cc-submit" disabled={submitting}>
                        {copy.title}
                    </button>
                </form>

                <aside className="cc-preview" aria-label="Preview">
                    <div className="cc-preview-inner">
                        <p>Preview</p>
                        <CheckCard check={preview} eyebrow={copy.eyebrow} />
                    </div>
                </aside>
            </div>

            {confirming && (
                <div className="confirm-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-type-title">
                        <h3 id="confirm-type-title">Confirm this {copy.noun}</h3>
                        <p className="confirm-week">
                            &quot;{name.trim()}&quot; will be available when {copy.usedFor}. A {copy.noun} can&apos;t be
                            changed after you create it.
                        </p>
                        <div className="cc-actions">
                            <button type="button" className="cc-btn" onClick={() => setConfirming(false)} disabled={submitting}>
                                Edit
                            </button>
                            <button type="button" className="cc-btn cc-btn-primary" onClick={submit} disabled={submitting}>
                                {submitting ? 'Saving…' : 'Confirm & create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateCardType;
