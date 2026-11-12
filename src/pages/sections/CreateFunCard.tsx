import './createcheck.css';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import BackButton from '../../components/BackButton';
import CheckCard from '../../components/CheckCard';
import type { Check, CheckThemeDefinition } from '../../types/check';
import type { ApiResponse } from '../../types/apiResponse';
import { getErrorMessage } from '../../utils/apiError';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 3;

interface CreateFunCardProps {
    onBack: () => void;
    onSaved: () => void;
}

/**
 * Create a just-for-fun card. Same flow as a check (pick the card type, write the question and options, preview,
 * confirm), but there is no live date: a fun card is always available while it is active.
 */
function CreateFunCard({ onBack, onSaved }: CreateFunCardProps) {
    const [themes, setThemes] = useState<CheckThemeDefinition[]>([]);
    const [typeId, setTypeId] = useState('');
    const [themesLoading, setThemesLoading] = useState(true);
    const [themeError, setThemeError] = useState<string | null>(null);
    const [themeReload, setThemeReload] = useState(0);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedOptions = options.map((o) => o.trim());

    useEffect(() => {
        let cancelled = false;
        api.get<ApiResponse<CheckThemeDefinition[]>>('/api/v1/yakku/fun-cards/themes')
            .then((res) => {
                if (cancelled) return;
                const list = res.data.data ?? [];
                setThemes(list);
                setTypeId((current) => current || list[0]?.id || '');
                setThemeError(null);
            })
            .catch((e) => {
                if (!cancelled) setThemeError(getErrorMessage(e));
            })
            .finally(() => {
                if (!cancelled) setThemesLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [themeReload]);

    const theme = themes.find((t) => t.id === typeId) ?? null;

    // Fills the card with placeholders until the admin has typed something.
    const preview: Check = {
        id: 'preview',
        weekStart: '',
        title: theme?.name ?? '',
        question: question.trim() || 'Your question will appear here',
        backgroundColor: theme?.backgroundColor ?? '',
        labelColor: theme?.labelColor,
        isActive,
        status: 'live',
        options: options.map((text, i) => ({
            id: String(i),
            text: text.trim() || `Option ${i + 1}`,
        })),
    };

    function problem(): string | null {
        if (!typeId) return 'Pick a card type.';
        if (!question.trim()) return 'Question is required.';
        if (question.trim().length > 500) return 'Question must be at most 500 characters.';
        if (trimmedOptions.some((o) => !o)) return 'Fill in every option, or remove the empty one.';
        if (trimmedOptions.some((o) => o.length > 200)) return 'Each option must be at most 200 characters.';
        const lower = trimmedOptions.map((o) => o.toLowerCase());
        if (new Set(lower).size !== lower.length) return 'Options must be different from each other.';
        return null;
    }

    function setOption(index: number, value: string) {
        setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
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
            // No visual fields are sent: the backend applies the chosen card type's look.
            await api.post('/api/v1/yakku/fun-cards', {
                funCardTypeId: typeId,
                question: question.trim(),
                options: trimmedOptions,
                isActive,
            });
            onSaved();
        } catch (err) {
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
                    <h2>Create card</h2>
                    <p>Pick a card type, then write the question and its options. It joins the Just for fun cards, with no live or end date.</p>
                </div>
            </header>

            <div className="cc-body">
                <form className="cc-form" onSubmit={review}>
                    <div className="cc-card">
                        <div className="cc-row">
                            <div className="cc-field">
                                <label className="cc-label" htmlFor="cc-fun-type">Card type</label>
                                <select
                                    id="cc-fun-type"
                                    value={typeId}
                                    onChange={(e) => setTypeId(e.target.value)}
                                    disabled={themesLoading || themes.length === 0 || submitting}
                                >
                                    {themesLoading && <option value="">Loading types…</option>}
                                    {!themesLoading && themes.length === 0 && <option value="">No card types available</option>}
                                    {themes.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                {theme?.tag && <p className="cc-help">{theme.tag}</p>}
                                {themeError && (
                                    <div className="cc-alert" role="alert">
                                        <span>{themeError}</span>
                                        <button type="button" className="cc-btn cc-btn-small" onClick={() => setThemeReload((k) => k + 1)}>
                                            Retry
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="cc-field cc-field-active">
                                <span className="cc-label" id="cc-active-label">Active</span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isActive}
                                    aria-labelledby="cc-active-label"
                                    title="Users can see it in the app while it is active."
                                    className={'cc-switch' + (isActive ? ' on' : '')}
                                    onClick={() => setIsActive((v) => !v)}
                                >
                                    <span className="cc-switch-knob" />
                                </button>
                            </div>
                        </div>

                        <label className="cc-field">
                            <span className="cc-label">Question</span>
                            <textarea
                                rows={3}
                                placeholder="e.g. If I were a Hindi movie, which one?"
                                value={question}
                                maxLength={500}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                            <span className="cc-count">{question.length}/500</span>
                        </label>

                        <div className="cc-field">
                            <span className="cc-label">Options ({MIN_OPTIONS}–{MAX_OPTIONS})</span>
                            <div className="cc-options">
                                {options.map((option, i) => (
                                    <div className="cc-option" key={i}>
                                        <span className="cc-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                                        <input
                                            aria-label={`Option ${i + 1}`}
                                            value={option}
                                            maxLength={200}
                                            placeholder={`Option ${i + 1}`}
                                            onChange={(e) => setOption(i, e.target.value)}
                                        />
                                        {options.length > MIN_OPTIONS && (
                                            <button
                                                type="button"
                                                className="cc-icon-btn"
                                                aria-label={`Remove option ${i + 1}`}
                                                onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {options.length < MAX_OPTIONS && (
                                <button type="button" className="cc-btn cc-btn-dashed" onClick={() => setOptions((prev) => [...prev, ''])}>
                                    + Add option
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <p className="cc-error" role="alert">{error}</p>}

                    <button type="submit" className="cc-btn cc-btn-primary cc-submit" disabled={submitting}>
                        Create card
                    </button>
                </form>

                <aside className="cc-preview" aria-label="Preview">
                    <div className="cc-preview-inner">
                        <p>Preview</p>
                        <CheckCard check={preview} eyebrow="JUST FOR FUN" showAsk={false} />
                    </div>
                </aside>
            </div>

            {confirming && (
                <div className="confirm-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                        <h3 id="confirm-title">Confirm this card</h3>
                        <p className="confirm-week">
                            Added to Just for fun{theme ? ` (${theme.name})` : ''}, no live date. {isActive ? 'Active' : 'Inactive'}.
                            It can&apos;t be changed after you create it.
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

export default CreateFunCard;
