import { useState } from 'react';
import { getErrorMessage } from '../utils/apiError';

interface ConfirmDeleteProps {
    title: string;
    /** What will be removed, in a sentence. */
    message: string;
    /** Runs the delete. Throwing keeps the dialog open and shows the error. */
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

/**
 * Asks the admin to confirm a permanent delete. Deleting a check or fun card also removes the copies users made
 * of it (with their answers), so the wording says so.
 */
function ConfirmDelete({ title, message, onConfirm, onClose }: ConfirmDeleteProps) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function confirm() {
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
            await onConfirm();
        } catch (e) {
            setError(getErrorMessage(e));
            setBusy(false);
        }
    }

    return (
        <div className="confirm-backdrop" role="presentation">
            <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
                <h3 id="confirm-delete-title">{title}</h3>
                <p className="confirm-week">{message}</p>
                {error && <p className="cc-error" role="alert">{error}</p>}
                <div className="cc-actions">
                    <button type="button" className="cc-btn" onClick={onClose} disabled={busy}>
                        Cancel
                    </button>
                    <button type="button" className="cc-btn cc-btn-primary" onClick={confirm} disabled={busy}>
                        {busy ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDelete;
