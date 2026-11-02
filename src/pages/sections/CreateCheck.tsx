import './createcheck.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../services/api';
import CheckCard from '../../components/CheckCard';
import type { Check } from '../../types/check';
import { getErrorMessage } from '../../utils/apiError';
import { mondayOptions } from '../../utils/weeks';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 3;

const PALETTE = [
    { name: 'Blue', hex: '#BFDBFE' },
    { name: 'Teal', hex: '#99E0DA' },
    { name: 'Mint', hex: '#C8F2DD' },
    { name: 'Green', hex: '#B7E4B0' },
    { name: 'Sage', hex: '#CFDCC3' },
    { name: 'Yellow', hex: '#FDEB9E' },
    { name: 'Beige', hex: '#EFE2CC' },
    { name: 'Orange', hex: '#FFD0A1' },
    { name: 'Pink', hex: '#FFC9DB' },
    { name: 'Red', hex: '#FFB3AD' },
    { name: 'Maroon', hex: '#E0A9B5' },
    { name: 'Purple', hex: '#D9C6F5' },
    { name: 'Navy', hex: '#A9B8E0' },
];
const DEFAULT_COLOR = PALETTE[0].hex;
const WEEKS_AHEAD = 12;

/** Dropdown showing each palette color as a circle with its name on the right. */
function ColorSelect({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = PALETTE.find((p) => p.hex === value) ?? PALETTE[0];

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    return (
        <div className="create-check-field" ref={rootRef} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
            <span className="create-check-label">Background color</span>
            <button
                type="button"
                className="color-select-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                <i className="color-select-dot" style={{ background: selected.hex }} />
                <span>{selected.name}</span>
                <b aria-hidden="true">▾</b>
            </button>
            {open && (
                <ul className="color-select-menu" role="listbox">
                    {PALETTE.map((p) => (
                        <li
                            key={p.name}
                            role="option"
                            aria-selected={p.hex === value}
                            className={p.hex === value ? 'selected' : undefined}
                            onClick={() => {
                                onChange(p.hex);
                                setOpen(false);
                            }}
                        >
                            <i className="color-select-dot" style={{ background: p.hex }} />
                            <span>{p.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

interface CreateCheckProps {
    onBack: () => void;
    onCreated: () => void;
}

function CreateCheck({ onBack, onCreated }: CreateCheckProps) {
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [sticker, setSticker] = useState('');
    const [color, setColor] = useState(DEFAULT_COLOR);
    const [options, setOptions] = useState<string[]>(['', '']);
    const mondays = useMemo(() => mondayOptions(0, WEEKS_AHEAD), []);
    const [weekStart, setWeekStart] = useState(mondays[0].value);
    const [submitting, setSubmitting] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const weekLabel = mondays.find((m) => m.value === weekStart)?.label ?? weekStart;
    const trimmedOptions = options.map((o) => o.trim());

    // Fills the card with placeholders until the admin has typed something.
    const preview: Check = {
        id: 'preview',
        weekStart,
        title: title.trim() || 'Your check title',
        question: question.trim() || 'Your question will appear here',
        backgroundColor: color,
        sticker: sticker.trim() || 'Sticker',
        isActive: true,
        status: 'upcoming',
        options: options.map((text, i) => ({
            id: String(i),
            text: text.trim() || `Option ${i + 1}`,
        })),
    };

    function problem(): string | null {
        if (!title.trim()) return 'Title is required.';
        if (title.trim().length > 100) return 'Title must be at most 100 characters.';
        if (!question.trim()) return 'Question is required.';
        if (question.trim().length > 500) return 'Question must be at most 500 characters.';
        if (!sticker.trim()) return 'Sticker is required.';
        if (sticker.trim().length > 100) return 'Sticker must be at most 100 characters.';
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
            await api.post('/api/v1/yakku/checks', {
                weekStart,
                title: title.trim(),
                question: question.trim(),
                backgroundColor: color,
                sticker: sticker.trim(),
                options: trimmedOptions,
                isActive: true,
            });
            onCreated();
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
                <h2>Create check</h2>
            </div>

            <div className="create-check-body">
                <form className="create-check-form" onSubmit={review}>
                    <label>
                        Title
                        <input value={title} maxLength={100} placeholder="Your check title" onChange={(e) => setTitle(e.target.value)} />
                    </label>

                    <label>
                        Question
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
                            Sticker
                            <input value={sticker} maxLength={100} placeholder="Sticker" onChange={(e) => setSticker(e.target.value)} />
                        </label>

                        <ColorSelect value={color} onChange={setColor} />

                        <label>
                            Goes live on
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

                    {error && <p className="create-check-error" role="alert">{error}</p>}

                    <div className="create-check-actions">
                        <button type="button" onClick={onBack} disabled={submitting}>Cancel</button>
                        <button type="submit" className="create-check-submit" disabled={submitting}>
                            Create check
                        </button>
                    </div>
                </form>

                <aside className="create-check-preview">
                    <p>Preview</p>
                    <CheckCard check={preview} large />
                </aside>
            </div>

            {confirming && (
                <div className="confirm-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                        <h3 id="confirm-title">Confirm this check</h3>
                        <p className="confirm-week">
                            This check will go live in the week starting <strong>{weekLabel}</strong> and cannot be reworded once anyone uses it.
                        </p>
                        <div className="confirm-card">
                            <CheckCard check={preview} />
                        </div>
                        <div className="create-check-actions">
                            <button type="button" onClick={() => setConfirming(false)} disabled={submitting}>
                                Edit
                            </button>
                            <button type="button" className="create-check-submit" onClick={submit} disabled={submitting}>
                                {submitting ? 'Creating…' : 'Confirm & create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateCheck;
