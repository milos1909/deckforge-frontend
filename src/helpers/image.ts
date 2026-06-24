export function getSetImage(setCode: string) {
    return `http://localhost:3300/images/sets/${setCode}.jpg`
}

export function getCardImage(id: number) {
    return `http://localhost:3300/images/cards/${id}.jpg`
}

export function getCroppedCardImage(id: number) {
    return `http://localhost:3300/images/cards_cropped/${id}.jpg`
}

export function setFallbackImage(event: Event) {
    const img = event.target as HTMLImageElement

    img.onerror = null
    img.src = '/back_high.jpg'
}
