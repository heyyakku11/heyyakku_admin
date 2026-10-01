import './guests.css';
import { useEffect, useState } from 'react';
import { getGuests } from '../../services/guestService';
import type { Guest } from '../../types/guest';

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

function Guests() {

    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchGuests();
    }, []);

    async function fetchGuests() {

        try {

            setLoading(true);
            setError(null);

            const response = await getGuests();

            if (response.success) {
                setGuests(response.data ?? []);
            } else {
                setError(response.message);
            }

        } catch (ex) {

            console.error(ex);

            if (ex instanceof Error) {
                setError(ex.message);
            } else {
                setError("Failed to load guests.");
            }

        } finally {

            setLoading(false);

        }
    }

    if (loading) {
        return (
            <div className="guests-section">
                <p>Loading guests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="guests-section">
                <p>Failed to load guests: {error}</p>
            </div>
        );
    }

    return (
        <div className="guests-section">

            {/* Header */}
            <div className="guests-header">

                <div>
                    <h2>Guests</h2>

                    <p>
                        Manage and monitor guest sessions.
                    </p>
                </div>

                <span className="guest-count">
                    {guests.length} guests
                </span>

            </div>

            {/* Guests */}
            <div className="guests-container">

                {guests.map((guest) => (

                    <div
                        className="guest-card"
                        key={guest.id}
                    >

                        {/* Guest Header */}
                        <div className="guest-card-header">

                            <div className="guest-identity">

                                <div className="guest-avatar">
                                    G
                                </div>

                                <div className="guest-info">

                                    <h3>
                                        Guest
                                    </h3>

                                    <p>
                                        {guest.id}
                                    </p>

                                </div>

                            </div>

                            <span
                                className={`guest-status ${guest.status}`}
                            >
                                {guest.status}
                            </span>

                        </div>

                        {/* Divider */}
                        <div className="guest-divider"></div>

                        {/* Guest Details */}
                        <div className="guest-details">

                            <div className="guest-detail">

                                <span className="detail-label">
                                    Last Seen
                                </span>

                                <span className="detail-value">
                                    {formatDateTime(
                                        guest.lastSeenAt
                                    )}
                                </span>

                            </div>

                            <div className="guest-detail">

                                <span className="detail-label">
                                    Expires
                                </span>

                                <span className="detail-value">
                                    {formatDateTime(
                                        guest.expiresAt
                                    )}
                                </span>

                            </div>

                            <div className="guest-detail">

                                <span className="detail-label">
                                    Created
                                </span>

                                <span className="detail-value">
                                    {formatDate(
                                        guest.createdAt
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Guests;