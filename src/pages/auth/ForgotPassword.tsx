import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { adminForgotPassword } from '../../services/authService';
import { EMAIL_RE, getErrorMessage } from '../../utils/apiError';
import StandaloneLayout from './StandaloneLayout';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (loading) return;

        const trimmed = email.trim();
        if (!EMAIL_RE.test(trimmed)) return setError('Enter a valid email address.');

        setError(null);
        setLoading(true);
        try {
            const response = await adminForgotPassword({ email: trimmed });
            if (!response.success) {
                setError(response.message || 'Could not send the reset link.');
                return;
            }
            setDone(true);
        } catch (ex) {
            setError(getErrorMessage(ex));
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <StandaloneLayout>
                <div className="auth-form auth-state">
                    <h1>Check your email</h1>
                    <p className="auth-sub">
                        If an admin account exists for <strong>{email.trim()}</strong>, a password reset link has been sent.
                        The link is valid for 10 minutes.
                    </p>
                    <Link className="auth-btn" style={{ textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }} to="/login">
                        Back to sign in
                    </Link>
                </div>
            </StandaloneLayout>
        );
    }

    return (
        <StandaloneLayout>
            <form className="auth-form" onSubmit={onSubmit} noValidate>
                <h1>Forgot password?</h1>
                <p className="auth-sub">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                {error && <div className="auth-alert error" role="alert">{error}</div>}

                <div className="auth-field">
                    <label htmlFor="email">Email</label>
                    <div className="auth-input">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                </button>

                <p className="auth-foot">
                    <Link className="auth-link" to="/login">Back to sign in</Link>
                </p>
            </form>
        </StandaloneLayout>
    );
}

export default ForgotPassword;
