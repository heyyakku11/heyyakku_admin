import './createcheck.css';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import CheckCard from '../../components/CheckCard';
import type { Check, CheckTheme, CheckThemeDefinition } from '../../types/check';
import type { ApiResponse } from '../../types/apiResponse';
import { getErrorMessage } from '../../utils/apiError';
import { mondayOptions } from '../../utils/weeks';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 3;

const WEEKS_AHEAD = 12;

interface CreateCheckProps {
    /** The check being edited; omit to create a new one. */
    check?: Check;
    onBack: () => void;
    onSaved: () => void;
}

function CreateCheck({ check, onBack, onSaved }: CreateCheckProps) {
    const editing = check !== undefined;
    const [question, setQuestion] = useState(check?.question ?? '');
    // Legacy checks have no type; they stay legacy unless the admin picks one.
    const [typeId, setTypeId] = useState<string>(check?.checkTypeId ?? '');
    const [themes, setThemes] = useState<CheckThemeDefinition[]>([]);
    const [typesError, setTypesError] = useState<string | null>(null);
    const [options, setOptions] = useState<string[]>(check ? check.options.map((o) => o.text) : ['', '']);
    const [isActive, setIsActive] = useState(check?.isActive ?? true);
    const mondays = useMemo(() => {
        const upcoming = mondayOptions(0, WEEKS_AHEAD);
        // An existing check may sit in a past week; keep that week selectable.
        if (check && !upcoming.some((m) => m.value === check.weekStart)) {
            const label = new Date(`${check.weekStart}T00:00:00`).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
            return [{ value: check.weekStart, label, isCurrent: false }, ...upcoming];
        }
        return upcoming;
    }, [check]);
    const [weekStart, setWeekStart] = useState(check?.weekStart ?? mondays[0].value);
    const [submitting, setSubmitting] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const weekLabel = mondays.find((m) => m.value === weekStart)?.label ?? weekStart;
    const trimmedOptions = options.map((o) => o.trim());

    // Themes are defined by admins on the backend; the form only picks one and previews it.
    useEffect(() => {
        let cancelled = false;
        api.get<ApiResponse<CheckThemeDefinition[]>>('/api/v1/yakku/check-themes')
            .then((res) => {
                if (cancelled) return;
                const list = res.data.data ?? [];
                setThemes(list);
                const firstActive = list[0];
                if (!check && firstActive) setTypeId((current) => current || firstActive.id);
            })
            .catch((e) => {
                if (!cancelled) setTypesError(getErrorMessage(e));
            });
        return () => {
            cancelled = true;
        };
    }, [check]);

    // A legacy check with no type keeps previewing its own derived theme until the admin picks one.
    const selected = themes.find((t) => t.id === typeId);
    const theme: CheckTheme | undefined = selected
        ? {
            checkTypeId: selected.id,
            checkType: selected.name,
            isLegacy: false,
            config: {
                heading: selected.name,
                backgroundColor: selected.backgroundColor,
                headingColor: selected.headingColor,
                stickerLabel: selected.sticker,
            },
        }
        : check?.theme;

    // Fills the card with placeholders until the admin has typed something.
    const preview: Check = {
        id: 'preview',
        weekStart,
        title: theme?.config.heading ?? '',
        question: question.trim() || 'Your question will appear here',
        backgroundColor: theme?.config.backgroundColor ?? '',
        sticker: theme?.config.stickerLabel ?? '',
        theme,
        checkTypeId: typeId || null,
        isActive,
        status: 'upcoming',
        options: options.map((text, i) => ({
            id: String(i),
            text: text.trim() || `Option ${i + 1}`,
        })),
    };

    function problem(): string | null {
        if (!editing && !typeId) return 'Pick a check type.';
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
            // No visual or theme fields are sent: the backend resolves them from the type.
            const body = {
                weekStart,
                checkTypeId: typeId || undefined,
                question: question.trim(),
                options: trimmedOptions,
                isActive,
            };
            if (check) {
                await api.put(`/api/v1/yakku/checks/${check.id}`, body);
            } else {
                await api.post('/api/v1/yakku/checks', body);
            }
            onSaved();
        } catch (err) {
            setConfirming(false);
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <div className="create-check">
            <div className="create-check-heading">
                <button type="button" className="create-check-back" onClick={onBack} disabled={submitting}>
                    ← Back
                </button>
                <h2>{editing ? 'Edit check' : 'Create check'}</h2>
            </div>

            <div className="create-check-body">
                <form className="create-check-form" onSubmit={review}>
                    <fieldset className="create-check-types">
                        <legend>1. Check type</legend>
                        {themes.map((type) => (
                            <label
                                key={type.id}
                                className={`create-check-type${typeId === type.id ? ' selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="checkType"
                                    value={type.id}
                                    checked={typeId === type.id}
                                    onChange={() => setTypeId(type.id)}
                                />
                                {type.name}
                            </label>
                        ))}
                        {editing && !check?.checkTypeId && (
                            <p className="create-check-hint">This is a legacy check. Pick a type to move it to the new theme system.</p>
                        )}
                        {typesError && <p className="create-check-error" role="alert">{typesError}</p>}
                        <p className="create-check-hint">The type decides the heading, colors and sticker automatically.</p>
                    </fieldset>

                    <label>
                        2. Question
                        <textarea
                            rows={3}
                            placeholder="Your question will appear here"
                            value={question}
                            maxLength={500}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </label>

                    <div className="create-check-row">
                        <label>
                            3. Goes live on (Monday)
                            <select value={weekStart} onChange={(e) => setWeekStart(e.target.value)}>
                                {mondays.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <fieldset>
                        <legend>Options ({MIN_OPTIONS}–{MAX_OPTIONS})</legend>
                        {options.map((option, i) => (
                            <div className="create-check-option" key={i}>
                                <span>{String.fromCharCode(65 + i)}</span>
                                <input
                                    value={option}
                                    maxLength={200}
                                    placeholder={`Option ${i + 1}`}
                                    onChange={(e) => setOption(i, e.target.value)}
                                />
                                {options.length > MIN_OPTIONS && (
                                    <button
                                        type="button"
                                        aria-label={`Remove option ${i + 1}`}
                                        onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {options.length < MAX_OPTIONS && (
                            <button type="button" className="create-check-add" onClick={() => setOptions((prev) => [...prev, ''])}>
                                + Add option
                            </button>
                        )}
                    </fieldset>

                    <label className="create-check-toggle">
                        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                        Active (users can see it once its week starts)
                    </label>

                    {error && <p className="create-check-error" role="alert">{error}</p>}

                    <div className="create-check-actions">
                        <button type="button" onClick={onBack} disabled={submitting}>Cancel</button>
                        <button type="submit" className="create-check-submit" disabled={submitting}>
                            {editing ? 'Save changes' : 'Create check'}
                        </button>
                    </div>
                </form>

                <aside className="create-check-preview">
                    <p>Preview</p>
                    <CheckCard check={preview} />
                </aside>
            </div>

            {confirming && (
                <div className="confirm-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                        <h3 id="confirm-title">{editing ? 'Confirm changes' : 'Confirm this check'}</h3>
                        <p className="confirm-week">
                            This check will go live in the week starting <strong>{weekLabel}</strong> and will be {isActive ? 'active' : 'inactive'}. It cannot be reworded once anyone uses it.
                        </p>
                        <div className="confirm-card">
                            <CheckCard check={preview} />
                        </div>
                        <div className="create-check-actions">
                            <button type="button" onClick={() => setConfirming(false)} disabled={submitting}>
                                Edit
                            </button>
                            <button type="button" className="create-check-submit" onClick={submit} disabled={submitting}>
                                {submitting ? 'Saving…' : editing ? 'Confirm & save' : 'Confirm & create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateCheck;
