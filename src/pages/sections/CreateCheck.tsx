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

const HEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_BACKGROUND = '#F3F4F6';

/** A color picker paired with a hex field, so admins can pick or paste a value. */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
    const valid = HEX.test(value);
    return (
        <div className="cc-field">
            <span className="cc-label">{label}</span>
            <div className="cc-color">
                <input
                    type="color"
                    aria-label={`${label} picker`}
                    value={valid ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                />
                <input
                    aria-label={label}
                    aria-invalid={!valid}
                    value={value}
                    maxLength={7}
                    spellCheck={false}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                />
            </div>
        </div>
    );
}

interface CreateCheckProps {
    /** The check being edited; omit to create a new one. */
    check?: Check;
    onBack: () => void;
    onSaved: () => void;
}

function CreateCheck({ check, onBack, onSaved }: CreateCheckProps) {
    const editing = check !== undefined;
    const [question, setQuestion] = useState(check?.question ?? '');
    // Legacy checks have no theme; they stay legacy unless the admin picks one.
    const [typeId, setTypeId] = useState<string>(check?.checkTypeId ?? '');
    const [themes, setThemes] = useState<CheckThemeDefinition[]>([]);
    const [themesError, setThemesError] = useState<string | null>(null);
    const [themesLoading, setThemesLoading] = useState(true);
    const [themesReload, setThemesReload] = useState(0);
    const [options, setOptions] = useState<string[]>(check ? check.options.map((o) => o.text) : ['', '']);
    const [isActive, setIsActive] = useState(check?.isActive ?? true);

    // The "new theme" panel and its draft values.
    const [creatingTheme, setCreatingTheme] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [draftBackground, setDraftBackground] = useState(DEFAULT_BACKGROUND);
    const [draftSticker, setDraftSticker] = useState('');
    const [themeSaving, setThemeSaving] = useState(false);
    const [themeError, setThemeError] = useState<string | null>(null);

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

    // Themes are defined by admins on the backend; the form picks one (or creates one) and previews it.
    useEffect(() => {
        let cancelled = false;
        api.get<ApiResponse<CheckThemeDefinition[]>>('/api/v1/yakku/check-themes')
            .then((res) => {
                if (cancelled) return;
                const list = res.data.data ?? [];
                setThemes(list);
                setThemesError(null);
                if (!check && list.length > 0) setTypeId((current) => current || list[0].id);
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
    }, [check, themesReload]);

    const selected = themes.find((t) => t.id === typeId);

    // While the new-theme panel is open the preview shows the draft; otherwise the picked theme.
    // A legacy check with no theme keeps previewing its own derived theme until one is picked.
    const theme: CheckTheme | undefined = creatingTheme
        ? {
              isLegacy: false,
              config: {
                  heading: draftName.trim() || 'Theme name',
                  backgroundColor: draftBackground,
                  stickerLabel: draftSticker.trim() || null,
              },
          }
        : selected
          ? {
                checkTypeId: selected.id,
                checkType: selected.name,
                isLegacy: false,
                config: {
                    heading: selected.name,
                    backgroundColor: selected.backgroundColor,
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

    function themeProblem(): string | null {
        if (!draftName.trim()) return 'Give the theme a name.';
        if (draftName.trim().length > 100) return 'The name must be at most 100 characters.';
        if (!HEX.test(draftBackground)) return 'Background color must be a hex color like #F3F4F6.';
        if (draftSticker.trim().length > 100) return 'The sticker must be at most 100 characters.';
        return null;
    }

    function openThemePanel() {
        setThemeError(null);
        setCreatingTheme(true);
    }

    function closeThemePanel() {
        setCreatingTheme(false);
        setThemeError(null);
    }

    async function saveTheme() {
        if (themeSaving) return;
        const message = themeProblem();
        if (message) {
            setThemeError(message);
            return;
        }
        setThemeSaving(true);
        setThemeError(null);
        try {
            const res = await api.post<ApiResponse<CheckThemeDefinition>>('/api/v1/yakku/check-themes', {
                name: draftName.trim(),
                backgroundColor: draftBackground,
                sticker: draftSticker.trim() || undefined,
            });
            const created = res.data.data;
            if (created) {
                setThemes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
                setTypeId(created.id);
            }
            setDraftName('');
            setDraftBackground(DEFAULT_BACKGROUND);
            setDraftSticker('');
            setCreatingTheme(false);
        } catch (err) {
            setThemeError(getErrorMessage(err));
        } finally {
            setThemeSaving(false);
        }
    }

    function problem(): string | null {
        if (creatingTheme) return 'Save or cancel the new theme first.';
        if (!editing && !typeId) return 'Pick a theme or create one.';
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
        <div className="cc">
            <header className="cc-header">
                <button type="button" className="cc-btn" onClick={onBack} disabled={submitting}>
                    ← Back
                </button>
                <div>
                    <h2>{editing ? 'Edit check' : 'Create check'}</h2>
                    <p>Pick a theme, write the question and choose when it goes live.</p>
                </div>
            </header>

            <div className="cc-body">
                <form className="cc-form" onSubmit={review}>
                    <section className="cc-card" aria-labelledby="cc-theme-title">
                        <div className="cc-card-head">
                            <span className="cc-step">1</span>
                            <div>
                                <h3 id="cc-theme-title">Theme</h3>
                                <p>The theme sets the heading, colors and sticker. You never edit them per check.</p>
                            </div>
                        </div>

                        {themesLoading && <p className="cc-muted">Loading themes…</p>}

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

                        {!themesLoading && !themesError && themes.length === 0 && !creatingTheme && (
                            <p className="cc-muted">No themes yet. Create the first one to get started.</p>
                        )}

                        <div className="cc-themes" role="radiogroup" aria-label="Theme">
                            {themes.map((t) => (
                                <label key={t.id} className={`cc-theme${typeId === t.id && !creatingTheme ? ' selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={t.id}
                                        checked={typeId === t.id}
                                        onChange={() => {
                                            setTypeId(t.id);
                                            closeThemePanel();
                                        }}
                                    />
                                    <span className="cc-theme-swatch" style={{ background: t.backgroundColor }}>
                                        Aa
                                    </span>
                                    <span className="cc-theme-text">
                                        <strong>{t.name}</strong>
                                        <small>{t.sticker || 'No sticker'}</small>
                                    </span>
                                </label>
                            ))}
                            <button
                                type="button"
                                className={`cc-theme cc-theme-new${creatingTheme ? ' selected' : ''}`}
                                onClick={openThemePanel}
                                aria-expanded={creatingTheme}
                            >
                                <span className="cc-theme-plus" aria-hidden="true">+</span>
                                <span className="cc-theme-text">
                                    <strong>New theme</strong>
                                    <small>Define colors and sticker</small>
                                </span>
                            </button>
                        </div>

                        {editing && !check?.checkTypeId && !creatingTheme && (
                            <p className="cc-hint">This is a legacy check. Pick a theme to move it to the theme system.</p>
                        )}

                        {creatingTheme && (
                            <div className="cc-newtheme">
                                <h4>New theme</h4>
                                <div className="cc-grid">
                                    <label className="cc-field cc-span">
                                        <span className="cc-label">Name (shown as the heading)</span>
                                        <input
                                            value={draftName}
                                            maxLength={100}
                                            placeholder="e.g. Vibe Check"
                                            onChange={(e) => setDraftName(e.target.value)}
                                        />
                                    </label>
                                    <div className="cc-span">
                                        <ColorField label="Background color" value={draftBackground} onChange={setDraftBackground} />
                                    </div>
                                    <label className="cc-field cc-span">
                                        <span className="cc-label">Sticker <em>(optional)</em></span>
                                        <input
                                            value={draftSticker}
                                            maxLength={100}
                                            placeholder="e.g. Read the room"
                                            onChange={(e) => setDraftSticker(e.target.value)}
                                        />
                                    </label>
                                </div>
                                {themeError && <p className="cc-error" role="alert">{themeError}</p>}
                                <div className="cc-actions">
                                    <button type="button" className="cc-btn" onClick={closeThemePanel} disabled={themeSaving}>
                                        Cancel
                                    </button>
                                    <button type="button" className="cc-btn cc-btn-primary" onClick={saveTheme} disabled={themeSaving}>
                                        {themeSaving ? 'Saving…' : 'Save theme'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="cc-card" aria-labelledby="cc-content-title">
                        <div className="cc-card-head">
                            <span className="cc-step">2</span>
                            <div>
                                <h3 id="cc-content-title">Question and options</h3>
                                <p>Users answer with one of {MIN_OPTIONS} to {MAX_OPTIONS} options, or write their own.</p>
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
                            <span className="cc-label">Options</span>
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
                    </section>

                    <section className="cc-card" aria-labelledby="cc-publish-title">
                        <div className="cc-card-head">
                            <span className="cc-step">3</span>
                            <div>
                                <h3 id="cc-publish-title">Publishing</h3>
                                <p>Checks go live on the Monday of the week you pick.</p>
                            </div>
                        </div>

                        <label className="cc-field">
                            <span className="cc-label">Goes live on</span>
                            <select value={weekStart} onChange={(e) => setWeekStart(e.target.value)}>
                                {mondays.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </label>

                        <label className="cc-toggle">
                            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                            <span>
                                <strong>Active</strong>
                                <small>Users can see it once its week starts.</small>
                            </span>
                        </label>
                    </section>

                    {error && <p className="cc-error" role="alert">{error}</p>}

                    <div className="cc-actions cc-actions-footer">
                        <button type="button" className="cc-btn" onClick={onBack} disabled={submitting}>Cancel</button>
                        <button type="submit" className="cc-btn cc-btn-primary" disabled={submitting}>
                            {editing ? 'Save changes' : 'Create check'}
                        </button>
                    </div>
                </form>

                <aside className="cc-preview" aria-label="Preview">
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
                        <div className="cc-actions">
                            <button type="button" className="cc-btn" onClick={() => setConfirming(false)} disabled={submitting}>
                                Edit
                            </button>
                            <button type="button" className="cc-btn cc-btn-primary" onClick={submit} disabled={submitting}>
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
