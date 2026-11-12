export interface CheckOption {
    id: string,
    text: string,
}

/** A theme defined by an admin (GET /api/v1/yakku/check-themes). Its name is the check type and the heading. */
export interface CheckThemeDefinition {
    id: string,
    name: string,
    backgroundColor: string,
    labelColor: string,
    tag?: string | null,
}

export interface Check {
    id: string,
    weekStart: string,
    /** The check type name; shown as the card heading. */
    title: string,
    question: string,
    backgroundColor: string,
    /** Color of the heading text; sent by the checks list. */
    labelColor?: string | null,
    isActive: boolean,
    status: string,
    options: CheckOption[],
}

/** The fun card type (theme) of a group in GET /api/v1/yakku/fun-cards. */
export interface FunCardGroupTheme {
    funCardTypeId: string,
    heading: string,
    backgroundColor: string,
    labelColor: string,
    tag?: string | null,
}

/** One card inside a group; its look comes from the group's theme. */
export interface FunCardItem {
    id: string,
    question: string,
    options: CheckOption[],
    isActive: boolean,
    createdAt: string,
}

/** GET /api/v1/yakku/fun-cards: every fun card type with its cards. */
export interface FunCardGroup {
    theme: FunCardGroupTheme,
    /** All cards of this type; `cards` may hold only a preview (the first 4). */
    totalCount: number,
    cards: FunCardItem[],
}
