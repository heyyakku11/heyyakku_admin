import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { adminResetPassword } from '../../services/authService';
import { getErrorMessage } from '../../utils/apiError';
import StandaloneLayout from './StandaloneLayout';
import PasswordInput from './PasswordInput';
import PasswordRules from './PasswordRules';
import { passwordRulesPass } from '../../utils/passwordRules';

function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (loading) return;

        if (!passwordRulesPass({ password: newPassword, confirm: confirmPassword })) {
            return setError('Check the password requirements below.');
        }

        setError(null);
        setLoading(true);
        try {
            const response = await adminResetPassword({ token, newPassword, confirmPassword });
            if (!response.success) {
                setError(response.message || 'Could not reset the password.');
                return;
            }
            setDone(true);
        } catch (ex) {
            setError(getErrorMessage(ex));
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <StandaloneLayout>
                <div className="auth-form auth-state">
                    <h1>Invalid reset link</h1>
                    <p className="auth-sub">This link is missing its token. Request a new password reset email.</p>
                    <Link className="auth-btn" style={{ textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }} to="/forgot-password">
                        Request a new link
                    </Link>
                </div>
            </StandaloneLayout>
        );
    }

    if (done) {
        return (
            <StandaloneLayout>
                <div className="auth-form auth-state">
                    <h1>Password updated</h1>
                    <p className="auth-sub">Your password was reset. Sign in with your new password.</p>
                    <Link className="auth-btn" style={{ textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }} to="/login">
                        Go to sign in
                    </Link>
                </div>
            </StandaloneLayout>
        );
    }

    return (
        <StandaloneLayout>
            <form className="auth-form" onSubmit={onSubmit} noValidate>
                <h1>Set a new password</h1>
                <p className="auth-sub">Choose a new password for your admin account.</p>

                {error && (
                    <div className="auth-alert error" role="alert">
                        {error} <Link className="auth-link" to="/forgot-password">Request a new link</Link>
                    </div>
                )}

                <div className="auth-field">
                    <label htmlFor="newPassword">New password</label>
                    <PasswordInput
                        id="newPassword"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="Enter a new password"
                        autoComplete="new-password"
                        disabled={loading}
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <PasswordInput
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Re-enter the new password"
                        autoComplete="new-password"
                        disabled={loading}
                    />
                </div>

                <PasswordRules password={newPassword} confirm={confirmPassword} />

                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Saving…' : 'Reset password'}
                </button>
            </form>
        </StandaloneLayout>
    );
}

export default ResetPassword;
