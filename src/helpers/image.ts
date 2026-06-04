export function getSetImage(set_code: string) {
    return `http://localhost:3300/images/sets/${set_code}.jpg`
}

export function getCardImage(id: number) {
    return `http://localhost:3300/images/cards/${id}.jpg`
}

export function setFallbackImage(event: Event) {
    const img = event.target as HTMLImageElement

    img.onerror = null
    img.src = 'back_high.jpg'
}