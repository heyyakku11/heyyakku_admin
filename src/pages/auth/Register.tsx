import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { adminRegister } from '../../services/authService';
import { EMAIL_RE, getErrorMessage, passwordProblem } from '../../utils/apiError';
import AuthLayout from './AuthLayout';
import PasswordInput from './PasswordInput';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => window.clearTimeout(id);
    }, [secondsLeft]);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (loading) return;

        const trimmed = email.trim();
        if (!EMAIL_RE.test(trimmed)) return setError('Enter a valid email address.');
        const pwProblem = passwordProblem(password);
        if (pwProblem) return setError(pwProblem);
        if (!secretCode.trim()) return setError('Enter the admin secret code.');

        setError(null);
        setLoading(true);
        try {
            const response = await adminRegister({ email: trimmed, password, secretCode: secretCode.trim() });
            if (!response.success) {
                setError(response.message || 'Registration failed.');
                return;
            }
            setSecondsLeft(response.data?.expiresInSeconds ?? 0);
            setSentTo(trimmed);
            setPassword('');
            setSecretCode('');
        } catch (ex) {
            setError(getErrorMessage(ex));
        } finally {
            setLoading(false);
        }
    }

    if (sentTo) {
        const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
        const ss = String(secondsLeft % 60).padStart(2, '0');
        return (
            <AuthLayout>
                <div className="auth-form auth-state">
                    <h1>Check your email</h1>
                    <p className="auth-sub">
                        We sent a verification link to <strong>{sentTo}</strong>. Open it to finish creating your account.
                        {secondsLeft > 0
                            ? ` The link expires in ${mm}:${ss}.`
                            : ' If the link has expired, register again.'}
                    </p>
                    <Link className="auth-btn" style={{ textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }} to="/login">
                        Back to sign in
                    </Link>
                    <button className="auth-btn secondary" type="button" onClick={() => setSentTo(null)}>
                        Use a different email
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <form className="auth-form" onSubmit={onSubmit} noValidate>
                <h1>Create an account</h1>
                <p className="auth-sub">
                    Already registered? <Link className="auth-link" to="/login">Sign in.</Link>
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

                <div className="auth-field">
                    <label htmlFor="password">Password</label>
                    <PasswordInput
                        id="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        disabled={loading}
                    />
                    <span className="auth-hint">At least 8 characters.</span>
                </div>

                <div className="auth-field">
                    <label htmlFor="secretCode">Secret code</label>
                    <PasswordInput
                        id="secretCode"
                        value={secretCode}
                        onChange={setSecretCode}
                        placeholder="Enter the admin secret code"
                        autoComplete="off"
                        disabled={loading}
                    />
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create account'}
                </button>
            </form>
        </AuthLayout>
    );
}

export default Register;
