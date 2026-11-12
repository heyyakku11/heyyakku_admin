import './createcheck.css';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import BackButton from '../../components/BackButton';
import CheckCard from '../../components/CheckCard';
import type { Check, CheckThemeDefinition } from '../../types/check';
import type { ApiResponse } from '../../types/apiResponse';
import { getErrorMessage } from '../../utils/apiError';
import { mondayOptions } from '../../utils/weeks';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 3;
const WEEKS_AHEAD = 12;

interface CreateCheckProps {
    onBack: () => void;
    onSaved: () => void;
}

function CreateCheck({ onBack, onSaved }: CreateCheckProps) {
    const [typeId, setTypeId] = useState<string>('');
    const [themes, setThemes] = useState<CheckThemeDefinition[]>([]);
    const [themesError, setThemesError] = useState<string | null>(null);
    const [themesLoading, setThemesLoading] = useState(true);
    const [themesReload, setThemesReload] = useState(0);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [isActive, setIsActive] = useState(true);

    const mondays = useMemo(() => mondayOptions(0, WEEKS_AHEAD), []);
    const [weekStart, setWeekStart] = useState(mondays[0].value);
    const [submitting, setSubmitting] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const weekLabel = mondays.find((m) => m.value === weekStart)?.label ?? weekStart;
    const trimmedOptions = options.map((o) => o.trim());

    // Themes come from the backend. The first one is selected by default.
    useEffect(() => {
        let cancelled = false;
        api.get<ApiResponse<CheckThemeDefinition[]>>('/api/v1/yakku/check-themes')
            .then((res) => {
                if (cancelled) return;
                const list = res.data.data ?? [];
                setThemes(list);
                setThemesError(null);
                setTypeId((current) => (current && list.some((t) => t.id === current) ? current : (list[0]?.id ?? '')));
            })
            .catch((e) => {
                if (!cancelled) setThemesError(getErrorMessage(e));
            })
            .finally(() => {
                if (!cancelled) setThemesLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [themesReload]);

    const selected = themes.find((t) => t.id === typeId);
    const noThemes = !themesLoading && !themesError && themes.length === 0;

    // Fills the card with placeholders until the admin has typed something.
    const preview: Check = {
        id: 'preview',
        weekStart,
        title: selected?.name ?? '',
        question: question.trim() || 'Your question will appear here',
        backgroundColor: selected?.backgroundColor ?? '',
        labelColor: selected?.labelColor,
        isActive,
        status: 'upcoming',
        options: options.map((text, i) => ({
            id: String(i),
            text: text.trim() || `Option ${i + 1}`,
        })),
    };

    function problem(): string | null {
        if (noThemes) return 'No check themes are available yet.';
        if (!typeId) return 'Pick a check theme.';
        if (!question.trim()) return 'Question is required.';
        if (question.trim().length > 500) return 'Question must be at most 500 characters.';
        if (!weekStart) return 'Pick the week this check goes live.';
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
            // No visual fields are sent: the backend applies the chosen theme.
            const body = {
                weekStart,
                checkTypeId: typeId,
                question: question.trim(),
                options: trimmedOptions,
                isActive,
            };
            await api.post('/api/v1/yakku/checks', body);
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
                    <h2>Create check</h2>
                    <p>Pick a theme, write the question and choose when it goes live.</p>
                </div>
            </header>

            <div className="cc-body">
                <form className="cc-form" onSubmit={review}>
                    <div className="cc-card">
                        <div className="cc-row">
                        <div className="cc-field">
                            <label className="cc-label" htmlFor="cc-theme">Check theme</label>
                            <div className="cc-theme-row">
                                <select
                                    id="cc-theme"
                                    value={typeId}
                                    onChange={(e) => setTypeId(e.target.value)}
                                    disabled={themesLoading || themes.length === 0}
                                >
                                    {themesLoading && <option value="">Loading themes…</option>}
                                    {!themesLoading && themes.length === 0 && <option value="">No themes available</option>}
                                                                        {themes.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            {noThemes && (
                                <p className="cc-error" role="alert">
                                    No check themes are available yet, so a check cannot be created.
                                </p>
                            )}
                            {themesError && (
                                <div className="cc-alert" role="alert">
                                    <span>{themesError}</span>
                                    <button
                                        type="button"
                                        className="cc-btn cc-btn-small"
                                        onClick={() => {
                                            setThemesLoading(true);
                                            setThemesReload((k) => k + 1);
                                        }}
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="cc-field">
                            <label className="cc-label" htmlFor="cc-live">Live date (Monday)</label>
                            <select id="cc-live" value={weekStart} onChange={(e) => setWeekStart(e.target.value)}>
                                {mondays.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="cc-field cc-field-active">
                            <span className="cc-label" id="cc-active-label">Active</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isActive}
                                aria-labelledby="cc-active-label"
                                title="Users can see it once its week starts."
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
                                placeholder="e.g. Do people like me, or just like having me around?"
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
                        Create check
                    </button>
                </form>

                <aside className="cc-preview" aria-label="Preview">
                    <div className="cc-preview-inner">
                        <p>Preview</p>
                        <CheckCard check={preview} />
                    </div>
                </aside>
            </div>

            {confirming && (
                <div className="confirm-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                        <h3 id="confirm-title">Confirm this check</h3>
                        <p className="confirm-week">
                            Goes live the week of <strong>{weekLabel}</strong>. {isActive ? 'Active' : 'Inactive'}.
                            Can&apos;t be reworded once anyone uses it.
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

export default CreateCheck;
