export interface CheckOption {
    id: string,
    text: string,
}

export interface Check {
    id: string,
    weekStart: string,
    title: string,
    question: string,
    backgroundColor: string,
    sticker: string,
    isActive: boolean,
    status: string,
    options: CheckOption[],
}
