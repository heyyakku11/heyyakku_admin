import './createcheck.css';
import { useState } from 'react';
import api from '../../services/api';
import BackButton from '../../components/BackButton';
import CheckCard from '../../components/CheckCard';
import ColorField, { HEX_COLOR } from '../../components/ColorField';
import type { Check, CheckThemeDefinition } from '../../types/check';
import type { ApiResponse } from '../../types/apiResponse';
import { getErrorMessage } from '../../utils/apiError';

const DEFAULT_BACKGROUND = '#F3F4F6';

interface CreateThemeProps {
    onBack: () => void;
    /** Called with the theme the backend created. */
    onCreated: (theme: CheckThemeDefinition) => void;
}

/** Define a check theme: its name (the heading), background color and an optional sticker. */
function CreateTheme({ onBack, onCreated }: CreateThemeProps) {
    const [name, setName] = useState('');
    const [background, setBackground] = useState(DEFAULT_BACKGROUND);
    const [sticker, setSticker] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const preview: Check = {
        id: 'preview',
        weekStart: '',
        title: name.trim() || 'Theme name',
        question: 'Your question will appear here',
        backgroundColor: background,
        sticker: sticker.trim(),
        theme: {
            isLegacy: false,
            config: {
                heading: name.trim() || 'Theme name',
                backgroundColor: background,
                stickerLabel: sticker.trim() || null,
            },
        },
        isActive: true,
        status: 'upcoming',
        options: [
            { id: '0', text: 'Option 1' },
            { id: '1', text: 'Option 2' },
        ],
    };

    function problem(): string | null {
        if (!name.trim()) return 'Give the theme a name.';
        if (name.trim().length > 100) return 'The name must be at most 100 characters.';
        if (!HEX_COLOR.test(background)) return 'Background color must be a hex color like #F3F4F6.';
        if (sticker.trim().length > 100) return 'The sticker must be at most 100 characters.';
        return null;
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (saving) return;
        const message = problem();
        if (message) {
            setError(message);
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const res = await api.post<ApiResponse<CheckThemeDefinition>>('/api/v1/yakku/check-themes', {
                name: name.trim(),
                backgroundColor: background,
                sticker: sticker.trim() || undefined,
            });
            if (res.data.data) onCreated(res.data.data);
            else onBack();
        } catch (err) {
            setError(getErrorMessage(err));
            setSaving(false);
        }
    }

    return (
        <div className="cc">
            <header className="cc-header">
                <BackButton onClick={onBack} disabled={saving} />
                <div>
                    <h2>Create theme</h2>
                    <p>A theme sets the heading, background color and sticker of every check that uses it.</p>
                </div>
            </header>

            <div className="cc-body">
                <form className="cc-form" onSubmit={submit}>
                    <div className="cc-card">
                        <label className="cc-field">
                            <span className="cc-label">Theme name</span>
                            <input
                                value={name}
                                maxLength={100}
                                placeholder="e.g. Vibe Check"
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                            <span className="cc-help">Shown as the heading on every check that uses this theme.</span>
                        </label>

                        <ColorField label="Background color" value={background} onChange={setBackground} />

                        <label className="cc-field">
                            <span className="cc-label">Sticker <em>(optional)</em></span>
                            <input
                                value={sticker}
                                maxLength={100}
                                placeholder="e.g. Read the room"
                                onChange={(e) => setSticker(e.target.value)}
                            />
                        </label>
                    </div>

                    {error && <p className="cc-error" role="alert">{error}</p>}

                    <div className="cc-actions">
                        <button type="button" className="cc-btn" onClick={onBack} disabled={saving}>Cancel</button>
                        <button type="submit" className="cc-btn cc-btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : 'Create theme'}
                        </button>
                    </div>
                </form>

                <aside className="cc-preview" aria-label="Preview">
                    <div className="cc-preview-inner">
                        <p>Preview</p>
                        <CheckCard check={preview} />
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default CreateTheme;
