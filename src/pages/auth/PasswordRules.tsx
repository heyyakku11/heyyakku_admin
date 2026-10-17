import type { PasswordRulesInput } from '../../utils/passwordRules';

function PasswordRules({ password, confirm, current }: PasswordRulesInput) {
    const rules: [string, boolean][] = [
        ['8 to 128 characters', password.length >= 8 && password.length <= 128],
        ['Both passwords match', password.length > 0 && password === confirm],
    ];
    if (current !== undefined) {
        rules.push(['Different from your current password', password.length > 0 && password !== current]);
    }

    return (
        <ul className="auth-rules" aria-live="polite">
            {rules.map(([label, ok]) => (
                <li key={label} className={ok ? 'ok' : ''}>{label}</li>
            ))}
        </ul>
    );
}

export default PasswordRules;
