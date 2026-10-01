import './profilepanel.css';

interface AdminProfile {
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

const adminProfile: AdminProfile = {
    name: 'Yakku Admin',
    email: 'admin@yakku.com',
    role: 'Administrator'
};

interface ProfilePanelProps {
    onLogout: () => void;
}

function ProfilePanel({ onLogout }: ProfilePanelProps) {

    const avatarLetter = adminProfile.name
        .charAt(0)
        .toUpperCase();

    return (
        <div className="profile-panel">

            {/* Header */}
            <div className="profile-panel-header">
                <h3>Profile</h3>
            </div>


            {/* Profile Information */}
            <div className="profile-info">

                <div className="profile-avatar">

                    {adminProfile.avatar ? (
                        <img
                            src={adminProfile.avatar}
                            alt={adminProfile.name}
                        />
                    ) : (
                        <span>
                            {avatarLetter}
                        </span>
                    )}

                </div>

                <h4>{adminProfile.name}</h4>

                <p className="profile-email">
                    {adminProfile.email}
                </p>

                <span className="profile-role">
                    {adminProfile.role}
                </span>

            </div>


            {/* Account Actions */}
            <div className="profile-actions">

                <button className="profile-action">
                    <span className="action-icon">
                        ⚙
                    </span>

                    <span className="action-content">
                        <strong>Account Settings</strong>
                        <small>Manage your account</small>
                    </span>

                    <span className="action-arrow">
                        →
                    </span>
                </button>


                <button className="profile-action">
                    <span className="action-icon">
                        🔒
                    </span>

                    <span className="action-content">
                        <strong>Change Password</strong>
                        <small>Update your password</small>
                    </span>

                    <span className="action-arrow">
                        →
                    </span>
                </button>

            </div>


            {/* Logout */}
            <div className="profile-footer">

                <button
                    className="profile-logout"
                    onClick={onLogout}
                >
                    <span>🚪</span>
                    Logout
                </button>

            </div>

        </div>
    );
}

export default ProfilePanel;