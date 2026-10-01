import './header.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import NotificationPanel from './notificationpanel';
import type { Notification } from '../types/notification';

function Header() {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'user',
            title: 'New user registered',
            message: 'A new user has joined Yakku.',
            createdAt: '2026-10-01T06:25:41.846859Z',
            isRead: false
        },
        {
            id: '2',
            type: 'poll',
            title: 'New poll created',
            message: 'A new poll was created by yakku@90317.',
            createdAt: '2026-10-01T05:20:41.846859Z',
            isRead: false
        },
        {
            id: '3',
            type: 'category',
            title: 'Category created',
            message: 'The "Sports" category was successfully created.',
            createdAt: '2026-09-30T07:20:41.846859Z',
            isRead: false
        },
        {
            id: '4',
            type: 'user',
            title: 'User account updated',
            message: 'A user profile was recently updated.',
            createdAt: '2026-09-29T08:10:41.846859Z',
            isRead: true
        }
    ]);

    const email = localStorage.getItem("email") ?? "";
    const role = localStorage.getItem("role") ?? "";

    const unreadCount = notifications.filter(
        notification => !notification.isRead
    ).length;

    function handleNotificationClick() {
        setIsNotificationOpen(prev => !prev);
    }

    function handleMarkAllAsRead() {
        setNotifications(current =>
            current.map(notification => ({
                ...notification,
                isRead: true
            }))
        );
    }
    
    const avatarCharacter = email
    ? email.charAt(0).toUpperCase()
    : "A";

    return (
        <header className="header">
    <div className="avatar-buttons">

        {/* Notification */}
        <div className="notification-wrapper">
            <button
                className={`avatar-button ${
                    isNotificationOpen
                        ? 'notification-active'
                        : ''
                }`}
                onClick={handleNotificationClick}
                aria-label="Notifications"
            >
                <FontAwesomeIcon icon={faBell} />

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isNotificationOpen && (
                <NotificationPanel
                    notifications={notifications}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
            )}
        </div>

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