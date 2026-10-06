import './notificationpanel.css';

import type { Notification } from '../types/notification';
import { formatRelativeTime } from '../utils/data';


interface NotificationPanelProps {
    notifications: Notification[];
    onMarkAllAsRead: () => void;
}


function getNotificationIcon(type: Notification['type']) {

    switch (type) {

        case 'user':
            return '👤';

        case 'poll':
            return '📊';

        case 'category':
            return '🏷️';

        case 'system':
            return '⚙️';

        default:
            return '🔔';
    }
}


function NotificationPanel({
    notifications,
    setNotifications
}: NotificationPanelProps) {

    const unreadCount = notifications.filter(
        notification => !notification.isRead
    ).length;


    return (
        <div className="notification-panel">

            <div className="notification-header">

                <div>
                    <h3>Notifications</h3>

                    <span>
                        {unreadCount} unread
                    </span>
                </div>

                <button className="mark-read-button">
                    Mark all as read
                </button>

            </div>


            <div className="notification-list">

                {notifications.length === 0 ? (

                    <div className="empty-notifications">

                        <div className="empty-icon">
                            🔔
                        </div>

                        <h4>No notifications</h4>

                        <p>
                            You're all caught up.
                        </p>

                    </div>

                ) : (

                    notifications.map(notification => (

                        <div
                            className={`notification-item ${
                                !notification.isRead
                                    ? 'unread'
                                    : ''
                            }`}
                            key={notification.id}
                        >

                            <div
                                className={`notification-icon ${notification.type}`}
                            >
                                {getNotificationIcon(
                                    notification.type
                                )}
                            </div>


                            <div className="notification-content">

                                <div className="notification-title-row">

                                    <h4>
                                        {notification.title}
                                    </h4>

                                    {!notification.isRead && (
                                        <span className="unread-dot" />
                                    )}

                                </div>


                                <p>
                                    {notification.message}
                                </p>


                                <span className="notification-time">
                                    {formatRelativeTime(
                                        notification.createdAt
                                    )}
                                </span>

                            </div>

                        </div>

                    ))

                )}

            </div>


            <div className="notification-footer">

                <button>
                    View all notifications
                </button>

            </div>

        </div>
    );
}

export default NotificationPanel;