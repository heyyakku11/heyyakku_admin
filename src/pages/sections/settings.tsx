import './settings.css';
import ChangePassword from '../auth/ChangePassword';
import LogoutButton from '../../components/LogoutButton';

interface SettingsProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

function Settings({ setLogin }: SettingsProps){
    return(
        <div className="settings-section">
            <ChangePassword setLogin={setLogin} />

            <div className="settings-logout">
                <LogoutButton setLogin={setLogin} />
            </div>
        </div>
    );
}
export default Settings;
