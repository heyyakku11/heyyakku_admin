export interface WeekOption {
    value: string,
    label: string,
    isCurrent: boolean,
}

/** Local calendar date as yyyy-mm-dd. */
function isoDate(d: Date) {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

/** Mondays from `weeksBack` weeks ago to `weeksAhead` weeks ahead; each one identifies a live week. */
export function mondayOptions(weeksBack: number, weeksAhead: number): WeekOption[] {
    const now = new Date();
    const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    thisMonday.setDate(thisMonday.getDate() - ((thisMonday.getDay() + 6) % 7));

    return Array.from({ length: weeksBack + weeksAhead + 1 }, (_, i) => {
        const offset = i - weeksBack;
        const d = new Date(thisMonday.getFullYear(), thisMonday.getMonth(), thisMonday.getDate() + offset * 7);
        const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        return {
            value: isoDate(d),
            label: offset === 0 ? `${label} (this week)` : label,
            isCurrent: offset === 0,
        };
    });
}
