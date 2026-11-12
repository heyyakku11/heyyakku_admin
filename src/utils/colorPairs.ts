/**
 * The only color combinations an admin can give a card type (check or fun card): a background and the label
 * (heading) color that reads well on it. Admins pick a pair from a list; they never type color codes.
 */
export interface ColorPair {
    id: string;
    label: string;
    backgroundColor: string;
    labelColor: string;
}

const PAIRS: ReadonlyArray<readonly [string, string]> = [
    ['#FFE0E8', '#993556'],
    ['#ECE3FF', '#4A3A8C'],
    ['#DDF3E4', '#245C3A'],
    ['#FFEFC2', '#6B4B00'],
    ['#2A1846', '#FFE7A3'],
    ['#D02E63', '#FFE0E8'],
    ['#E8F6C3', '#4B5E12'],
    ['#86CCFF', '#0B3A66'],
    ['#FFAA70', '#7A2E00'],
    ['#E9A3F0', '#6B1475'],
    ['#4DBFAF', '#063B34'],
    ['#2D4FC4', '#D6E0FF'],
    ['#66761F', '#F2F7CF'],
];

export const COLOR_PAIRS: ReadonlyArray<ColorPair> = PAIRS.map(([backgroundColor, labelColor], i) => ({
    id: `pair-${i + 1}`,
    label: `Pair ${i + 1}`,
    backgroundColor,
    labelColor,
}));
