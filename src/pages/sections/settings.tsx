import './settings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faKey, faPowerOff, faRightFromBracket, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import ChangePassword from '../auth/ChangePassword';
import { adminLogout, adminLogoutAll } from '../../services/authService';
import { getErrorMessage } from '../../utils/apiError';
import { clearSession } from '../../utils/session';

interface SettingsProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

interface OptionTileProps {
    icon: IconDefinition;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
}

function OptionTile({ icon, title, description, onClick, disabled, danger }: OptionTileProps) {
    return (
        <button type="button" className={`settings-tile${danger ? ' danger' : ''}`} onClick={onClick} disabled={disabled}>
            <span className="settings-tile-icon"><FontAwesomeIcon icon={icon} /></span>
            <span className="settings-tile-text">
                <strong>{title}</strong>
                <small>{description}</small>
            </span>
            <FontAwesomeIcon icon={faChevronRight} className="settings-tile-chevron" />
        </button>
    );
}

function Settings({ setLogin }: SettingsProps){
    // The settings page is a one-deep stack: the option list, with the change password form pushed on top.
    const [changingPassword, setChangingPassword] = useState(false);
    const [busy, setBusy] = useState<'logout' | 'logout-all' | null>(null);
    const [error, setError] = useState<string | null>(null);

    function finishSignOut() {
        // Always clear client authentication state.
        clearSession();
        setLogin(false);
    }

    async function logout() {
        if (busy || !confirm("Are you sure you want to logout?")) return;

        setBusy('logout');
        setError(null);
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    const response = await adminLogout({ refreshToken });
                    if (!response.success) console.warn("Server logout failed:", response.message);
                } catch (ex) {
                    console.warn("Server logout request failed:", ex);
                }
            }
        } finally {
            finishSignOut();
        }
    }

    async function logoutAll() {
        if (busy || !confirm("Sign out of every device where this admin account is logged in?")) return;

        setBusy('logout-all');
        setError(null);
        try {
            const response = await adminLogoutAll();
            if (!response.success) {
                setError(response.message || 'Could not sign out of all devices.');
                return;
            }
            finishSignOut();
        } catch (ex) {
            // Stay signed in: the other devices were not signed out, so the admin can try again.
            setError(getErrorMessage(ex));
        } finally {
            setBusy(null);
        }
    }

    if (changingPassword) {
        return (
            <div className="settings-section">
                <button type="button" className="settings-back" onClick={() => setChangingPassword(false)}>← Back</button>
                <ChangePassword setLogin={setLogin} />
            </div>
        );
    }

    return(
        <div className="settings-section">
            <h2 className="settings-title">Settings</h2>

            {error && <p className="settings-error" role="alert">{error}</p>}

            <div className="settings-list">
                <OptionTile
                    icon={faKey}
                    title="Change password"
                    description="You'll be signed out on every device afterwards."
                    onClick={() => setChangingPassword(true)}
                />
                <OptionTile
                    icon={faRightFromBracket}
                    title={busy === 'logout' ? 'Logging out …' : 'Log out'}
                    description="Sign out of this device."
                    onClick={logout}
                    disabled={busy !== null}
                />
                <OptionTile
                    icon={faPowerOff}
                    title={busy === 'logout-all' ? 'Logging out everywhere …' : 'Log out of all devices'}
                    description="End every session of this admin account."
                    onClick={logoutAll}
                    disabled={busy !== null}
                    danger
                />
            </div>
        </div>
    );
}
export default Settings;
