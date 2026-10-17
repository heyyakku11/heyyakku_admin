import type { ReactNode } from 'react';
import './auth.css';

interface StandaloneLayoutProps {
    children: ReactNode;
}

/** Full-page, centered layout for email-link pages (no login side panel). */
function StandaloneLayout({ children }: StandaloneLayoutProps) {
    return (
        <div className="auth-standalone">
            <div className="auth-brand">Yakku</div>
            <div className="auth-standalone-card">{children}</div>
        </div>
    );
}

export default StandaloneLayout;
