import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { adminVerifyEmail } from '../../services/authService';
import { getErrorMessage } from '../../utils/apiError';
import StandaloneLayout from './StandaloneLayout';

type Status = { kind: 'loading' } | { kind: 'ok' } | { kind: 'error'; message: string };

function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';
    const [status, setStatus] = useState<Status>(
        token ? { kind: 'loading' } : { kind: 'error', message: 'This verification link is missing its token.' },
    );

    useEffect(() => {
        if (!token) return;
        // The token is single-use, so ignore the result of a superseded
        // (StrictMode double-mounted) effect instead of sending it twice.
        let cancelled = false;
        const timer = window.setTimeout(() => {
            adminVerifyEmail({ token })
                .then((res) => {
                    if (cancelled) return;
                    setStatus(res.success ? { kind: 'ok' } : { kind: 'error', message: res.message || 'Verification failed.' });
                })
                .catch((ex) => {
                    if (!cancelled) setStatus({ kind: 'error', message: getErrorMessage(ex) });
                });
        }, 0);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [token]);

    return (
        <StandaloneLayout>
            <div className="auth-form auth-state">
                {status.kind === 'loading' && (
                    <>
                        <h1>Verifying…</h1>
                        <p className="auth-sub" role="status">Confirming your email address.</p>
                    </>
                )}
                {status.kind === 'ok' && (
                    <>
                        <h1>Email verified</h1>
                        <p className="auth-sub">Your admin account is ready. Sign in with your email and password.</p>
                        <Link className="auth-btn" style={{ textDecoration: 'none', boxSizing: 'border-box' }} to="/login">
                            Go to sign in
                        </Link>
                    </>
                )}
                {status.kind === 'error' && (
                    <>
                        <h1>Couldn't verify</h1>
                        <div className="auth-alert error" role="alert">{status.message}</div>
                        <Link className="auth-btn" style={{ textDecoration: 'none', boxSizing: 'border-box' }} to="/register">
                            Register again
                        </Link>
                    </>
                )}
            </div>
        </StandaloneLayout>
    );
}

export default VerifyEmail;
