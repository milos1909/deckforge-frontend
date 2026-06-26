import type { CardModel } from '@/models/card.model'
import type { DeckCardModel } from '@/models/deck.model'

function cardSortGroup(card: CardModel) {
    if (card.type === 'Spell Card') return 1
    if (card.type === 'Trap Card') return 2

    return 0
}

function sortableAtk(card: CardModel) {
    return typeof card.atk === 'number' && card.atk >= 0 ? card.atk : Number.NEGATIVE_INFINITY
}

export function compareDeckCards(a: CardModel, b: CardModel) {
    const groupDiff = cardSortGroup(a) - cardSortGroup(b)
    if (groupDiff !== 0) return groupDiff

    if (cardSortGroup(a) === 0) {
        const atkDiff = sortableAtk(b) - sortableAtk(a)
        if (atkDiff !== 0) return atkDiff
    }

    const nameDiff = a.name.localeCompare(b.name)
    if (nameDiff !== 0) return nameDiff

    return a.id - b.id
}

export function sortCardsForDeck(cards: CardModel[]) {
    return [...cards].sort(compareDeckCards)
}

export function sortDeckCardModels(deckCards: DeckCardModel[]) {
    return [...deckCards].sort((a, b) => compareDeckCards(a.card, b.card))
}

export function getDeckTotalPrice(cards: CardModel[]) {
    return cards.reduce((total, card) => {
        return total + Number(card.cardmarketPrice ?? 0)
    }, 0)
}

export function getMainDeckTypeCounts(cards: CardModel[]) {
    return cards.reduce((counts, card) => {
        if (card.type === 'Spell Card') {
            counts.spells++
        } else if (card.type === 'Trap Card') {
            counts.traps++
        } else {
            counts.monsters++
        }

        return counts
    }, {
        monsters: 0,
        spells: 0,
        traps: 0
    })
}
