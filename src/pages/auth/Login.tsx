import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { adminLogin, adminSession } from '../../services/authService';
import { EMAIL_RE, getErrorMessage } from '../../utils/apiError';
import { setSession } from '../../utils/session';
import AuthLayout from './AuthLayout';
import PasswordInput from './PasswordInput';

interface LoginProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

function Login({ setLogin }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (loading) return;

        const trimmed = email.trim();
        if (!EMAIL_RE.test(trimmed)) return setError('Enter a valid email address.');
        if (!password) return setError('Enter your password.');

        setError(null);
        setLoading(true);
        try {
            const response = await adminLogin({ email: trimmed, password });
            if (!response.success || !response.data) {
                setError(response.message || 'Login failed.');
                return;
            }
            // The session cookie is already set by the server. Ask the server who we are (the single source of
            // truth) instead of keeping anything from the login response.
            const session = await adminSession();
            if (!session.success || !session.data) {
                setError(session.message || 'Login failed.');
                return;
            }
            setSession({ email: session.data.email, role: session.data.role }, session.data.csrfToken);
            setLogin(true);
        } catch (ex) {
            setError(getErrorMessage(ex));
            setPassword('');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <form className="auth-form" onSubmit={onSubmit} noValidate>
                <h1>Welcome back</h1>
                <p className="auth-sub">
                    New to Yakku admin? <Link className="auth-link" to="/register">Create an account.</Link>
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
                            autoComplete="username"
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
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                    />
                </div>

                <div className="auth-row">
                    <Link className="auth-link" to="/forgot-password">Forgot password</Link>
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </AuthLayout>
    );
}

export default Login;
