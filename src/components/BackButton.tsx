/** Borderless iOS-style back chevron. */
function BackButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
    return (
        <button type="button" className="cc-back" onClick={onClick} disabled={disabled} aria-label="Back">
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden="true">
                <path
                    d="M10 2 2 10l8 8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}

export default BackButton;
