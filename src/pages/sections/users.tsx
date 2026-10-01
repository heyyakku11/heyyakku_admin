import './users.css';

const users = [
    {
        id: "2db16e76-7771-4d16-83d1-fbcbc713a04a",
        email: "risouddesaunni-1952@yopmail.com",
        displayName: "yakku@90317",
        status: "active",
        lastLoginAt: "2026-09-28T07:03:16.360464Z",
        createdAt: "2026-09-28T07:03:16.36006Z"
    },
    {
        id: "8bb5af2c-2749-4470-ac3a-e81be3eab3c7",
        email: "deiqueizahoiprou-3704@yopmail.com",
        displayName: "yakku@64389",
        status: "active",
        lastLoginAt: "2026-09-28T06:53:57.877645Z",
        createdAt: "2026-09-28T06:53:57.877137Z"
    }
];

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