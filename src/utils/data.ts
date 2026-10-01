export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.floor(
        (now.getTime() - date.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
        return `${diffInSeconds} sec ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 1) {
        return 'Yesterday';
    }

    if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    }

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}