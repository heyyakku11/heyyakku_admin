import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import NotFound from './pages/auth/NotFound';
import SessionEndedDialog from './components/SessionEndedDialog';
import { adminSession } from './services/authService';
import axios from 'axios';
import { SESSION_ENDED_EVENT, endSession } from './utils/authEvents';
import { clearSession, setSession } from './utils/session';

function App() {

    const [isAdminLogin, setLogin] = useState(false);

    // Nothing in the browser proves the admin is signed in: ask the server (it reads the HttpOnly cookie).
    const [checking, setChecking] = useState(true);
    useEffect(() => {
        let cancelled = false;
        adminSession()
            .then((response) => {
                if (cancelled) return;
                if (response.success && response.data) {
                    setSession({ email: response.data.email, role: response.data.role }, response.data.csrfToken);
                    setLogin(true);
                } else {
                    clearSession();
                }
            })
            .catch(() => {
                // 401 (no session) or the server is unreachable: show the sign-in screen either way.
                if (!cancelled) clearSession();
            })
            .finally(() => {
                if (!cancelled) setChecking(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // The server rejected the session (expired, revoked, or closed from another device). The admin is told why
    // before going back to the login screen.
    const [sessionEnded, setSessionEnded] = useState(false);
    useEffect(() => {
        const onSessionEnded = () => setSessionEnded(true);
        window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);
        return () => window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
    }, []);

    // Timers sleep in background tabs, so re-check with the server when the admin comes back to the tab.
    useEffect(() => {
        if (!isAdminLogin) return;
        const onVisible = () => {
            if (document.visibilityState !== 'visible') return;
            adminSession().catch((error) => {
                // The server no longer accepts the session. Other failures (offline) are ignored.
                if (axios.isAxiosError(error) && error.response?.status === 401) endSession();
            });
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [isAdminLogin]);

    if (checking) return null;

    return (
        <>
        <BrowserRouter>
            <Routes>
                {/* Standalone pages: reachable from email links regardless of login state */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {isAdminLogin
                    ? (
                        <>
                            <Route path="/" element={<Dashboard setLogin={setLogin} />} />
                            <Route path="/login" element={<Navigate to="/" replace />} />
                            <Route path="*" element={<NotFound homePath="/" homeLabel="Back to dashboard" />} />
                        </>
                    )
                    : (
                        <>
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="/login" element={<Login setLogin={setLogin} />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="*" element={<NotFound homePath="/login" homeLabel="Go to sign in" />} />
                        </>
                    )
                }
            </Routes>
        </BrowserRouter>

        {sessionEnded && (
            <SessionEndedDialog
                onContinue={() => {
                    setSessionEnded(false);
                    setLogin(false);
                }}
            />
        )}
        </>
    );
}

export default App;
