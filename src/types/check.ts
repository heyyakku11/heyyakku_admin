export interface CheckOption {
    id: string,
    text: string,
}

/** What a check renders with. The type name is the heading; everything else is optional on other clients. */
export interface CheckThemeConfig {
    heading: string,
    backgroundColor: string,
    labelColor?: string | null,
}

export interface CheckTheme {
    checkTypeId?: string | null,
    checkType?: string | null,
    isLegacy: boolean,
    config: CheckThemeConfig,
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
    /** Legacy snapshot fields; the card renders from `theme` when it is present. */
    title: string,
    question: string,
    backgroundColor: string,
    isActive: boolean,
    status: string,
    options: CheckOption[],
    checkType?: string | null,
    checkTypeId?: string | null,
    theme?: CheckTheme,
}

/** A just-for-fun card (GET /api/v1/yakku/fun-cards): no live week, always styled with the Just for fun theme. */
export interface AdminFunCard {
    id: string,
    title: string,
    question: string,
    backgroundColor: string,
    isActive: boolean,
    options: CheckOption[],
    theme?: CheckTheme,
    createdAt: string,
}
