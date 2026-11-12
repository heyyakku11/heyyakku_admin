import './header.css';
import { useAdminProfile } from '../utils/session';

function Header() {
    // From the server-reported session held in memory; nothing here is read from browser storage.
    const profile = useAdminProfile();
    const email = profile?.email ?? "";

    const avatarCharacter = email
    ? email.charAt(0).toUpperCase()
    : "A";

    return (
        <header className="header">
    <div className="avatar-buttons">

        {/* Profile information */}
        <div className="profile-info">
            <div className="profile-avatar">
    {avatarCharacter}
</div>

        </div>

    </div>
</header>
    );
}

export default Header;
