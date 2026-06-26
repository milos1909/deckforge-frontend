export function formatCardStatValue(label: string, value: string | number | undefined | null) {
    if ((label === 'ATK' || label === 'DEF') && value === -1) return '?'

    return value
}

export function getRaceIcon(race: string | undefined | null) {
    if (!race) return null

    const icons: Record<string, string> = {
        Aqua: '/Aqua.png',
        Beast: '/Beast.png',
        'Beast-Warrior': '/Beast-Warrior.png',
        'Creator God': '/Divine-Beast.png',
        Cyberse: '/Cyberse.png',
        Dinosaur: '/Dinosaur.png',
        'Divine-Beast': '/Divine-Beast.png',
        Dragon: '/Dragon.png',
        Fairy: '/Fairy.png', 
        Fiend: '/Fiend.png',
        Fish: '/Fish.png',
        Illusion: '/Illusion.png',
        Insect: '/Insect.png',
        Machine: '/Machine.png',
        Plant: '/Plant.png',
        Psychic: '/Psychic.png',
        Pyro: '/Pyro.png',
        Reptile: '/Reptile.png',
        Rock: '/Rock.png',
        'Sea Serpent': '/Sea Serpent.png',
        Spellcaster:'/Spellcaster.png', 
        Thunder:'/Thunder.png', 
        Warrior:'/Warrior.png',
        'Winged Beast': '/Winged Beast.png',
        Wyrm: '/Wyrm.png',
        Zombie: '/Zombie.png',
        Continuous: '/Continuous.png',
        Counter: '/Counter.png',
        Equip: '/Equip.png',
        Field: '/Field.png',
        'Quick-Play': '/Quick-play.png',
        Ritual: '/Ritual.png',
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
