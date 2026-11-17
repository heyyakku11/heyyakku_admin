import type { ReactNode } from 'react';
import './auth.css';

interface AuthLayoutProps {
    children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="auth-page">
            <main className="auth-main">
                <div className="auth-brand">
                    Yakku
                </div>
                <div className="auth-form-wrap">{children}</div>
            </main>
        </div>
    );
}

export default AuthLayout;
