import type { SetModel } from "./set.model"

export interface CardModel {
    id: number
    name: string
    type: string
    description: string
    atk?: number
    def?: number
    level?: number
    race: string 
    attribute?: string
    archetype?: string
    scale?: number
    linkval?: number
    card_sets: SetModel[]
}