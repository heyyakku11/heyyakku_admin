import './sidepanel.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGauge,
    faPerson,
    faPoll,
    faGear
} from "@fortawesome/free-solid-svg-icons";

interface SidePanelProps {
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
    }
];

function SidePanel({activeSection, setActiveSection}:SidePanelProps) {
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


            <div className="sidepanel-footer">
                <button
                    className={`nav-item ${activeSection === "settings" ? "active" : ""}`}
                    onClick={() => setActiveSection("settings")}
                >
                    <FontAwesomeIcon icon={faGear} />
                    <span>Settings</span>
                </button>
            </div>

        </aside>
    );
}

export default SidePanel;