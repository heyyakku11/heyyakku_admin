import './header.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell} from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import NotificationPanel from './notificationpanel';
import ProfilePanel from './profilepanel';
import type { Notification } from '../types/notification';


function Header(){
    
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
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

 const unreadCount = notifications.filter(
        notification => !notification.isRead
    ).length;


    function handleNotificationClick() {
        setIsNotificationOpen(prev => !prev);
    }

     function handleLogout() {
        console.log("Logout clicked");
    }

    return(
        <header className="header">

            <div className="avatar-buttons">

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
                                {unreadCount > 99
                                    ? '99+'
                                    : unreadCount}
                            </span>
                        )}

                    </button>


                    {isNotificationOpen && (
                        <NotificationPanel
                            notifications={notifications}
                        />
                    )}

                </div>


                <div className="profile-wrapper">

    <button
        className={`avatar-button profile-button ${
            isProfileOpen ? 'profile-active' : ''
        }`}
        onClick={() => setIsProfileOpen(prev => !prev)}
    >
        <img
            src="https://cdn.pixabay.com/photo/2018/04/13/21/24/lion-3317670_640.jpg"
            alt="Profile"
        />
    </button>

    {isProfileOpen && (
        <ProfilePanel
            onLogout={handleLogout}
        />
    )}

</div>

            </div>

        </header>
    );
}

export default Header;