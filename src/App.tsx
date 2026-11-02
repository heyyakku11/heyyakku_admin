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
import { startAutoRefresh, stopAutoRefresh } from './services/api';
import { SESSION_ENDED_EVENT } from './utils/authEvents';
import { clearSession, isSessionValid } from './utils/session';

function App() {

    const [isAdminLogin, setLogin] = useState(() => {
        if (isSessionValid()) return true;
        clearSession();
        return false;
    });

    // The token refresh gave up (the server rejected the refresh token). The admin is told why before
    // going back to the login screen.
    const [sessionEnded, setSessionEnded] = useState(false);
    useEffect(() => {
        const onSessionEnded = () => setSessionEnded(true);
        window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);
        return () => window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
    }, []);

    // While signed in, keep renewing the access token in the background.
    useEffect(() => {
        if (!isAdminLogin) return;
        startAutoRefresh();
        return stopAutoRefresh;
    }, [isAdminLogin]);

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
