import './header.css';

function Header() {
    const email = localStorage.getItem("email") ?? "";
    const role = localStorage.getItem("role") ?? "";

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

            <div className="profile-details">
                <p className="profile-email">{email}</p>
                <span className="profile-role">{role}</span>
            </div>
        </div>

    </div>
</header>
    );
}

export default Header;
