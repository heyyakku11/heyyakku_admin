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
        id: "settings",
        label: "Settings",
        icon: faGear
    }
];

function SidePanel({setLogin, activeSection, setActiveSection}:SidePanelProps) {
    function _logout(){
       if(confirm("Are you sure you want to logout?")){
          setLogin(false);
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
                <span>Log out</span>
            </button>

        </aside>
    );
}

export default SidePanel;