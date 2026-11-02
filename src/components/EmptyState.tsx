import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react';
import wasmUrl from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url';
import './emptystate.css';

// Serve the player from this app instead of a CDN.
setWasmUrl(wasmUrl);

/** The animations in /public. */
const ANIMATIONS = {
    empty: '/Shake%20A%20Empty%20Box.lottie',
    loading: '/loading%20animation.lottie',
    notFound: '/Error%20404.lottie',
} as const;

export type EmptyKind = 'empty' | 'loading' | 'notFound' | 'error';

interface EmptyStateProps {
    /** empty = nothing to show, loading = fetching, notFound = missing page, error = a failure (text only). */
    kind?: EmptyKind;
    message?: string;
    /** Animation box size in px. */
    size?: number;
}

/** A looping Lottie animation with an optional message under it. */
function EmptyState({ kind = 'empty', message, size }: EmptyStateProps) {
    const box = size ?? (kind === 'notFound' ? 280 : kind === 'loading' ? 90 : 160);

    return (
        <div className={`empty-state empty-state--${kind}`}>
            {kind !== 'error' && (
                <div style={{ width: box, height: box }}>
                    <DotLottieReact src={ANIMATIONS[kind]} loop autoplay />
                </div>
            )}
            {message && <p>{message}</p>}
        </div>
    );
}

export default EmptyState;
