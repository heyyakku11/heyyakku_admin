import type { Check } from '../types/check';

const DEFAULT_BACKGROUND = '#FFF9F6';
const DEFAULT_INK = '#21191D';
const DEFAULT_ACCENT = '#D02E62';
const HEX = /^#[0-9a-f]{6}$/i;

function hex(value: string | null | undefined, fallback: string): string {
    return value && HEX.test(value.trim()) ? value.trim() : fallback;
}

/** The sticker on every check card. It is fixed; the API no longer sends one. */
export const CHECK_STICKER = 'No filter, Just truth';

/**
 * The single place that turns a card's colors into what the card needs. A check or fun card carries its type name
 * (title), backgroundColor and labelColor; a missing or malformed color falls back to a safe default.
 */
export function resolveTheme(check: Pick<Check, 'title' | 'backgroundColor' | 'labelColor'>) {
    return {
        heading: (check.title ?? '').trim(),
        sticker: CHECK_STICKER,
        background: hex(check.backgroundColor, DEFAULT_BACKGROUND),
        // The label color colors the heading; the question and options follow the shared defaults.
        headingColor: hex(check.labelColor, DEFAULT_INK),
        questionColor: DEFAULT_INK,
        accent: DEFAULT_ACCENT,
        stickerColor: DEFAULT_ACCENT,
        optionBackground: '#FFFFFF',
        optionText: DEFAULT_INK,
    };
}
