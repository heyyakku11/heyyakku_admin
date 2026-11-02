import './sessiondialog.css';

/** Tells the admin why they are being signed out; they continue to the sign-in screen from here. */
function SessionEndedDialog({ onContinue }: { onContinue: () => void }) {
    return (
        <div className="session-backdrop" role="presentation">
            <div className="session-dialog" role="alertdialog" aria-modal="true" aria-labelledby="session-title" aria-describedby="session-text">
                <h3 id="session-title">You've been signed out</h3>
                <p id="session-text">
                    Your session has ended, so we signed you out to keep your account safe. This happens when the
                    session expires or is closed from another device. Please sign in again to continue.
                </p>
                <button type="button" autoFocus onClick={onContinue}>Sign in again</button>
            </div>
        </div>
    );
}

export default SessionEndedDialog;
