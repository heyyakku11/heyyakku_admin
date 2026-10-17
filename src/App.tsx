import './App.css';
import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import NotFound from './pages/auth/NotFound';

function App() {

    const [isAdminLogin, setLogin] = useState(() => {
        const accessToken = localStorage.getItem("accessToken");

        return !!accessToken;
    });

    return (
        <BrowserRouter>
            {isAdminLogin
                ? (
                    <Routes>
                        <Route path="/" element={<Dashboard setLogin={setLogin} />} />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="*" element={<NotFound homePath="/" homeLabel="Back to dashboard" />} />
                    </Routes>
                )
                : (
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<Login setLogin={setLogin} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="*" element={<NotFound homePath="/login" homeLabel="Go to sign in" />} />
                    </Routes>
                )
            }
        </BrowserRouter>
    );
}

export default App;
