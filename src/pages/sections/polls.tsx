import './polls.css';
import { useEffect, useState } from 'react';
import { getPolls } from '../../services/pollService';
import type { Poll } from '../../types/poll';

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

function Polls() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
        useEffect(() => {
            fetchPolls();
        }, []);

    async function fetchPolls() {
        
            try {
    
                setLoading(true);
                setError(null);
    
                const response = await getPolls();
    
                if (response.success) {
                    setPolls(response.data ?? []);
                } else {
                    setError(response.message);
                }
    
            } catch (ex) {
    
                console.error(ex);
    
                if (ex instanceof Error) {
                    setError(ex.message);
                } else {
                    setError("Failed to load polls.");
                }
    
            } finally {
    
                setLoading(false);
    
            }
        }

        if (loading) {
        return (
            <div className="polls-section">
                <p>Loading polls...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="polls-section">
                <p>Failed to load polls: {error}</p>
            </div>
        );
    }
    

    return (
        <div className="polls-section">

            <div className="polls-header">
                <div>
                    <h2>Polls</h2>
                    <p>Manage and monitor polls created by users.</p>
                </div>

                <span className="poll-count">
                    {polls.length} polls
                </span>
            </div>

            <div className="polls-container">

                {polls.map((poll) => (

                    <div className="poll-card" key={poll.id}>

                        {/* Top section */}
                        <div className="poll-card-top">

                            <span className={`poll-status ${poll.status}`}>
                                {poll.status}
                            </span>

                            <button className="poll-menu">
                                ⋮
                            </button>

                        </div>

                        {/* Question */}
                        <h3 className="poll-question">
                            {poll.question}
                        </h3>

                        {/* Divider */}
                        <div className="poll-divider"></div>

                        {/* Statistics */}
                        <div className="poll-stats">

                            <div className="poll-stat">
                                <span className="stat-value">
                                    {poll.totalVoteCount}
                                </span>

                                <span className="stat-label">
                                    Total Votes
                                </span>
                            </div>

                            <div className="poll-stat">
                                <span className="stat-value">
                                    {poll.optionType}
                                </span>

                                <span className="stat-label">
                                    Option Type
                                </span>
                            </div>

                            <div className="poll-stat">
                                <span className="stat-value">
                                    {poll.expiresAt
                                        ? formatDate(poll.expiresAt)
                                        : "No expiry"
                                    }
                                </span>

                                <span className="stat-label">
                                    Expires
                                </span>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="poll-card-footer">

                            <span>
                                Created {formatDate(poll.createdAt)}
                            </span>

                            <button className="view-poll-button">
                                View Poll →
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Polls;