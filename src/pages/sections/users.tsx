import './users.css';
import { DUMMY_USERS } from '../../data/dummyData';

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function Users() {
    const users = DUMMY_USERS;

    return (
        <div className="users-section">

            {/* Header */}
            <div className="users-header">
                <div>
                    <h2>Users</h2>
                    <p>
                        Manage and monitor registered users.
                    </p>
                </div>

                <span className="user-count">
                    {users.length} users
                </span>
            </div>

            {/* Users */}
            <div className="users-container">

                {users.map((user) => (

                    <div className="user-card" key={user.id}>

                        {/* User header */}
                        <div className="user-card-header">

                            <div className="user-identity">

                                <div className="user-avatar">
                                    {user.displayName
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="user-info">
                                    <h3>{user.displayName}</h3>
                                    <p>{user.email}</p>
                                </div>

                            </div>

                            <span
                                className={`user-status ${user.status}`}
                            >
                                {user.status}
                            </span>

                        </div>

                        {/* Divider */}
                        <div className="user-divider"></div>

                        {/* User details */}
                        <div className="user-details">

                            <div className="user-detail">
                                <span className="detail-label">
                                    Last Login
                                </span>

                                <span className="detail-value">
                                    {formatDateTime(user.lastLoginAt)}
                                </span>
                            </div>

                            <div className="user-detail">
                                <span className="detail-label">
                                    Created
                                </span>

                                <span className="detail-value">
                                    {formatDate(user.createdAt)}
                                </span>
                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Users;