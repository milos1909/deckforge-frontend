export interface DeckModel {
    id: number
    name: string
    description: string | null
    coverCardId: number | null
    isPublic: boolean
    createdAt: string
    updatedAt: string
}
