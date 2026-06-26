export function formatDisplayDate(value?: string | null, fallback = 'Unknown') {
    if (!value) return fallback

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(value))
}
