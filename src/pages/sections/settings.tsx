import ChangePassword from '../auth/ChangePassword';

interface SettingsProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

function Settings({ setLogin }: SettingsProps){
    return(
        <div className="settings-section">
            <ChangePassword setLogin={setLogin} />
        </div>
    );
}
export default Settings;
