import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import { adminLogout } from '../services/authService';
import type { RefreshRequest } from '../types/auth';
import { clearSession } from '../utils/session';

interface LogoutButtonProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

function LogoutButton({ setLogin }: LogoutButtonProps) {
    const [isLoading, setLoading] = useState(false);

    async function _logout() {
        if (!confirm("Are you sure you want to logout?")) {
            return;
        }

        try {
            setLoading(true);

            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                const request: RefreshRequest = {
                    refreshToken
                };

                try {
                    const response = await adminLogout(request);

                    if (!response.success) {
                        console.warn("Server logout failed:", response.message);
                    }

                } catch (ex) {
                    console.warn("Server logout request failed:", ex);
                }
            }

        } finally {
            // Always clear client authentication state
            clearSession();

            setLogin(false);
            setLoading(false);
        }
    }

    return (
        <button className="logout-button" onClick={_logout} disabled={isLoading}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            {isLoading ? "Logging out ..." : "Log out"}
        </button>
    );
}

export default LogoutButton;
