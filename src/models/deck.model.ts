import type { CardModel } from './card.model'

export type DeckZone = 'main' | 'extra' | 'side'
export type DeckType = 'meta' | 'rogue' | 'casual' | 'anime'

export const DECK_TYPE_LABELS: Record<DeckType, string> = {
    meta: 'Meta Deck',
    rogue: 'Rogue Deck',
    casual: 'Casual Deck',
    anime: 'Anime Deck'
}

export interface DeckCardModel {
    id: number
    cardId: number
    type: DeckZone
    card: CardModel
}

export interface DeckSummaryModel {
    id: number
    name: string
    description: string | null
    coverCardId: number | null
    isPublic: boolean | number
    createdAt: string
    updatedAt: string | null
    type?: DeckType
    viewCount: number
}

export interface DeckModel extends DeckSummaryModel {
    type: DeckType
    user: {
        id: number
        username: string
    }
    deckCards: DeckCardModel[]
}

export interface DeckDetailsResponse {
    deck: DeckModel
    canEdit: boolean
}

export interface DeckMetadataInput {
    name?: string
    description?: string | null
    coverCardId?: number | null
    isPublic?: boolean
    type?: DeckType
}
