import type { Check, CheckThemeConfig } from '../types/check';

const DEFAULT_BACKGROUND = '#FFF9F6';
const DEFAULT_INK = '#21191D';
const DEFAULT_ACCENT = '#D02E62';
const HEX = /^#[0-9a-f]{6}$/i;

function hex(value: string | null | undefined, fallback: string): string {
    return value && HEX.test(value.trim()) ? value.trim() : fallback;
}

/**
 * The single place that turns a check's theme into what the card needs. Missing or malformed
 * optional properties fall back to safe defaults; legacy checks (no theme) use their own fields.
 */
/** The sticker on every check card. It is fixed; the API no longer sends one. */
export const CHECK_STICKER = 'No filter, Just truth';

export function resolveTheme(check: Pick<Check, 'theme' | 'title' | 'backgroundColor'>) {
    const c: Partial<CheckThemeConfig> = check.theme?.config ?? {
        heading: check.title,
        backgroundColor: check.backgroundColor,
    };
    return {
        heading: (c.heading ?? '').trim(),
        sticker: CHECK_STICKER,
        background: hex(c.backgroundColor, DEFAULT_BACKGROUND),
        // The label color colors the heading; the question and options follow the shared defaults.
        headingColor: hex(c.labelColor, DEFAULT_INK),
        questionColor: DEFAULT_INK,
        accent: DEFAULT_ACCENT,
        stickerColor: DEFAULT_ACCENT,
        optionBackground: '#FFFFFF',
        optionText: DEFAULT_INK,
    };
}
