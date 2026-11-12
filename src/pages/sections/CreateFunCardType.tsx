import './createcheck.css';
import { useState } from 'react';
import api from '../../services/api';
import BackButton from '../../components/BackButton';
import CheckCard from '../../components/CheckCard';
import type { Check } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';

const HEX = /^#[0-9a-f]{6}$/i;
const NAME_MAX = 100;
const TAG_MAX = 100;

interface CreateFunCardTypeProps {
    onBack: () => void;
    onSaved: () => void;
}

/**
 * Define a new fun card type (a theme): its name, the card background color, the heading color and an optional tag.
 * Cards are then created under it with "Add card". Uses POST /api/v1/yakku/fun-cards/themes.
 */
function CreateFunCardType({ onBack, onSaved }: CreateFunCardTypeProps) {
    const [name, setName] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('#FFEFC2');
    const [labelColor, setLabelColor] = useState('#6B4B00');
    const [tag, setTag] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // A sample card so the colors can be judged before saving.
    const preview: Check = {
        id: 'preview',
        weekStart: '',
        title: name.trim() || 'Card type name',
        question: 'Your question will appear here',
        backgroundColor: HEX.test(backgroundColor) ? backgroundColor : '',
        labelColor: HEX.test(labelColor) ? labelColor : '',
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
        if (!HEX.test(backgroundColor)) return 'Background color must be a hex color like #FFEFC2.';
        if (!HEX.test(labelColor)) return 'Label color must be a hex color like #6B4B00.';
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
            await api.post('/api/v1/yakku/fun-cards/themes', {
                name: name.trim(),
                backgroundColor,
                labelColor,
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
                    <h2>Create card type</h2>
                    <p>A card type sets the name, colors and tag that every card under it shares.</p>
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
                                placeholder="e.g. Emotional"
                                onChange={(e) => setName(e.target.value)}
                                disabled={submitting}
                            />
                            <span className="cc-count">{name.length}/{NAME_MAX}</span>
                        </label>

                        <div className="cc-grid">
                            <div className="cc-field">
                                <label className="cc-label" htmlFor="cc-type-bg">Background color</label>
                                <div className="cc-color">
                                    <input
                                        id="cc-type-bg"
                                        type="color"
                                        value={HEX.test(backgroundColor) ? backgroundColor : '#ffffff'}
                                        onChange={(e) => setBackgroundColor(e.target.value.toUpperCase())}
                                        disabled={submitting}
                                    />
                                    <input
                                        aria-label="Background color hex"
                                        value={backgroundColor}
                                        maxLength={7}
                                        onChange={(e) => setBackgroundColor(e.target.value.trim())}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="cc-field">
                                <label className="cc-label" htmlFor="cc-type-label">Label color</label>
                                <div className="cc-color">
                                    <input
                                        id="cc-type-label"
                                        type="color"
                                        value={HEX.test(labelColor) ? labelColor : '#000000'}
                                        onChange={(e) => setLabelColor(e.target.value.toUpperCase())}
                                        disabled={submitting}
                                    />
                                    <input
                                        aria-label="Label color hex"
                                        value={labelColor}
                                        maxLength={7}
                                        onChange={(e) => setLabelColor(e.target.value.trim())}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>
                        </div>

                        <label className="cc-field">
                            <span className="cc-label">Tag (optional)</span>
                            <input
                                value={tag}
                                maxLength={TAG_MAX}
                                placeholder="e.g. movies, jail, silly ones"
                                onChange={(e) => setTag(e.target.value)}
                                disabled={submitting}
                            />
                            <span className="cc-help">A short descriptor of what this type is about.</span>
                        </label>
                    </div>

                    {error && <p className="cc-error" role="alert">{error}</p>}

                    <button type="submit" className="cc-btn cc-btn-primary cc-submit" disabled={submitting}>
                        Create card type
                    </button>
                </form>

                <aside className="cc-preview" aria-label="Preview">
                    <div className="cc-preview-inner">
                        <p>Preview</p>
                        <CheckCard check={preview} eyebrow="JUST FOR FUN" />
                    </div>
                </aside>
            </div>

            {confirming && (
                <div className="confirm-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-type-title">
                        <h3 id="confirm-type-title">Confirm this card type</h3>
                        <p className="confirm-week">
                            &quot;{name.trim()}&quot; will be available when creating fun cards. A card type can&apos;t be
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

export default CreateFunCardType;
