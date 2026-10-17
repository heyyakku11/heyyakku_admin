import { Link } from 'react-router-dom';
import './auth.css';

interface NotFoundProps {
    /** Primary button target: the dashboard when signed in, sign-in otherwise. */
    homePath: string;
    homeLabel: string;
}

function NotFound({ homePath, homeLabel }: NotFoundProps) {
    return (
        <div className="auth-notfound">
            <div className="auth-brand">
                Yakku
            </div>
            <div className="auth-notfound-code" aria-hidden="true">404</div>
            <h1>Page not found</h1>
            <p>The page you're looking for doesn't exist or has been moved.</p>
            <Link className="auth-btn" to={homePath}>{homeLabel}</Link>
        </div>
    );
}

export default NotFound;
