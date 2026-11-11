import type { AdminFunCard, Check } from '../types/check';

/** The card component renders checks; a just-for-fun card has no live week, so it is shown as a live check. */
export function funCardToCheck(card: AdminFunCard): Check {
    return {
        id: card.id,
        weekStart: '',
        title: card.title,
        question: card.question,
        backgroundColor: card.backgroundColor,
        isActive: card.isActive,
        status: 'live',
        options: card.options,
        checkType: card.theme?.checkType,
        checkTypeId: card.theme?.checkTypeId,
        theme: card.theme,
    };
}
