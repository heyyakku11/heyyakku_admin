import type { Check, FunCardGroupTheme, FunCardItem } from '../types/check';

/** The card component renders checks; a just-for-fun card has no live week, so it is shown as a live check. */
export function funCardToCheck(card: FunCardItem, theme: FunCardGroupTheme): Check {
    return {
        id: card.id,
        weekStart: '',
        title: theme.heading,
        question: card.question,
        backgroundColor: theme.backgroundColor,
        labelColor: theme.labelColor,
        isActive: card.isActive,
        status: 'live',
        options: card.options,
    };
}
