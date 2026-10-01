import './polls.css';

const polls = [
    {
        id: "747785fc-7bcf-4f7d-ae74-c7e9788bf200",
        creatorId: "2db16e76-7771-4d16-83d1-fbcbc713a04a",
        question: "Which destination would you visit tomorrow if money was no issue?",
        status: "active",
        optionType: "text",
        totalVoteCount: 1,
        expiresAt: null,
        createdAt: "2026-09-28T07:05:00.020135Z"
    },
    {
        id: "6c3ddc22-24fe-483f-b49e-ab58c81164d4",
        creatorId: "8bb5af2c-2749-4470-ac3a-e81be3eab3c7",
        question: "What makes a weekend perfect?",
        status: "active",
        optionType: "text",
        totalVoteCount: 1,
        expiresAt: null,
        createdAt: "2026-09-28T06:57:54.926159Z"
    },
    {
        id: "ef0b54df-edb6-4cc7-a0b7-f1444008748d",
        creatorId: "8bb5af2c-2749-4470-ac3a-e81be3eab3c7",
        question: "Which skill would you instantly master?",
        status: "active",
        optionType: "text",
        totalVoteCount: 1,
        expiresAt: null,
        createdAt: "2026-09-28T06:57:13.51629Z"
    },
    {
        id: "984e7f3b-d7fb-4acd-bc89-a3218678d461",
        creatorId: "8bb5af2c-2749-4470-ac3a-e81be3eab3c7",
        question: "Should I Text her?",
        status: "active",
        optionType: "text",
        totalVoteCount: 1,
        expiresAt: null,
        createdAt: "2026-09-28T06:55:58.158127Z"
    }
];

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function Polls() {
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