import { useState } from 'react';

interface PasswordInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete, disabled }: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="auth-input has-toggle">
            <input
                id={id}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
            />
            <button
                type="button"
                className="auth-toggle"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
            >
                {visible ? 'Hide' : 'Show'}
            </button>
        </div>
    );
}

export default PasswordInput;
