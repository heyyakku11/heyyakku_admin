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

            <aside className="auth-aside" aria-hidden="true">
                <div className="auth-cards">
                    <div className="auth-card">
                        <div className="auth-card-tag">Anonymous question</div>
                        <div className="auth-card-q">Which dress should I wear?</div>
                        <div className="auth-bar">
                            <span style={{ width: 28 }}>46%</span>
                            <div className="auth-bar-track"><div className="auth-bar-fill" style={{ width: '46%' }} /></div>
                        </div>
                        <div className="auth-bar">
                            <span style={{ width: 28 }}>42%</span>
                            <div className="auth-bar-track"><div className="auth-bar-fill alt" style={{ width: '42%' }} /></div>
                        </div>
                    </div>
                    <div className="auth-card">
                        <div className="auth-card-tag">Anonymous question</div>
                        <div className="auth-card-q">Is pineapple okay on pizza?</div>
                        <div className="auth-bar">
                            <span style={{ width: 28 }}>63%</span>
                            <div className="auth-bar-track"><div className="auth-bar-fill" style={{ width: '63%' }} /></div>
                        </div>
                    </div>
                </div>
                <h2>Ask what you're really thinking.</h2>
                <p>Manage polls, users and categories for Yakku, where friends answer honestly and nobody knows who said what.</p>
            </aside>
        </div>
    );
}

export default AuthLayout;
