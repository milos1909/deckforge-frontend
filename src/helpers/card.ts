export function formatCardStatValue(label: string, value: string | number | undefined | null) {
    if ((label === 'ATK' || label === 'DEF') && value === -1) return '?'

    return value
}

export function getRaceIcon(race: string | undefined | null) {
    if (!race) return null

    const icons: Record<string, string> = {
        Continuous: '/Continuous.png',
        Counter: '/Counter.png',
        Equip: '/Equip.png',
        Field: '/Field.png',
        'Quick-Play': '/Quick-play.png',
        Ritual: '/Ritual.png'
    }

    return icons[race] ?? null
}

export function getAttributeIcon(attribute: string | undefined | null) {
    if (!attribute) return null

    return `/${attribute}.jpg`
}

export function getCardStatIcon(label: string, value: string | number | undefined | null) {
    if (label === 'Typing') return getRaceIcon(String(value))
    if (label === 'Attribute') return getAttributeIcon(String(value))
    if (label === 'Level/Rank') return '/level.png'

    return null
}
