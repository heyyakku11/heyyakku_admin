import { useState, type FormEvent } from 'react';

import { adminChangePassword } from '../../services/authService';
import { getErrorMessage } from '../../utils/apiError';
import PasswordInput from './PasswordInput';
import PasswordRules from './PasswordRules';
import { passwordRulesPass } from '../../utils/passwordRules';
import { clearSession } from '../../utils/session';
import './auth.css';

interface ChangePasswordProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChangePassword({ setLogin }: ChangePasswordProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const valid =
        currentPassword.length > 0 &&
        passwordRulesPass({ password: newPassword, confirm: confirmPassword, current: currentPassword });

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (loading || !valid) return;

        setError(null);
        setLoading(true);
        try {
            const response = await adminChangePassword({ currentPassword, newPassword, confirmPassword });
            if (!response.success) {
                setError(response.message || 'Could not change the password.');
                return;
            }
            // The backend signs out every session, so drop the local one too.
            setDone(true);
            window.setTimeout(() => {
                clearSession();
                setLogin(false);
            }, 2000);
        } catch (ex) {
            setError(getErrorMessage(ex));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page-card">
            <form className="auth-form" onSubmit={onSubmit} noValidate>
                <h2>Change password</h2>
                <p className="auth-sub">You'll be signed out on every device and asked to sign in again.</p>

                {error && <div className="auth-alert error" role="alert">{error}</div>}
                {done && (
                    <div className="auth-alert success" role="status">
                        Password changed. Redirecting to sign in…
                    </div>
                )}

                <div className="auth-field">
                    <label htmlFor="currentPassword">Current password</label>
                    <PasswordInput
                        id="currentPassword"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        autoComplete="current-password"
                        disabled={loading || done}
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="newPassword">New password</label>
                    <PasswordInput
                        id="newPassword"
                        value={newPassword}
                        onChange={setNewPassword}
                        autoComplete="new-password"
                        disabled={loading || done}
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="confirmPassword">Confirm new password</label>
                    <PasswordInput
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        autoComplete="new-password"
                        disabled={loading || done}
                    />
                </div>

                <PasswordRules password={newPassword} confirm={confirmPassword} current={currentPassword} />

                <button className="auth-btn" type="submit" disabled={loading || done || !valid}>
                    {loading ? 'Saving…' : 'Change password'}
                </button>
            </form>
        </div>
    );
}

export default ChangePassword;
