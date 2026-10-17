export interface PasswordRulesInput {
    password: string;
    confirm: string;
    /** Current password; when given, the new one must differ from it. */
    current?: string;
}

/** Mirrors the backend rules: 8-128 chars, confirmation matches, differs from current. */
export function passwordRulesPass({ password, confirm, current }: PasswordRulesInput): boolean {
    return (
        password.length >= 8 &&
        password.length <= 128 &&
        password === confirm &&
        (current === undefined || password !== current)
    );
}
