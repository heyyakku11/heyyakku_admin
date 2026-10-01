import './sidepanel.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGauge,
    faPerson,
    faPoll,
    faGear,
    faRightFromBracket,
    faDisplay
} from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import { adminLogout } from '../services/authService';
import type { RefreshRequest } from '../types/auth';

interface SidePanelProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const menuItems = [
    {
        id: "home",
        label: "Dashboard",
        icon: faGauge
    },
    {
        id: "users",
        label: "Users",
        icon: faPerson
    },
    {
        id: "polls",
        label: "Polls",
        icon: faPoll
    },
    {
        id: "categories",
        label: "Categories",
        icon: faDisplay
    },
    {
        id: "settings",
        label: "Settings",
        icon: faGear
    }
];

function SidePanel({setLogin, activeSection, setActiveSection}:SidePanelProps) {
   const[isLoading,setLoading] = useState(false);
    
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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setLogin(false);
        setLoading(false);
    }
}

    return (
        <aside className="sidepanel">

            <h2 className="logo">Yakku</h2>

            {menuItems.map((item) => (
        <button
            key={item.id}
            className={`nav-item ${
                activeSection === item.id ? "active" : ""
            }`}
            onClick={() => setActiveSection(item.id)}
        >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.label}</span>
        </button>
    ))}


            <button className="logout-button" onClick={_logout}>
                <FontAwesomeIcon icon={faRightFromBracket} />
                {isLoading?"Logging  out ...":
                "Log out"}
            </button>

        </aside>
    );
}

export default SidePanel;