import type { CardModel } from "./card.model"
import type { SetModel } from "./set.model"

export interface InvoiceItemModel {
    id: number
    itemType: 'set' | 'card'
    pricePerItem: number
    count: number
    set: SetModel | null
    card: CardModel | null
}
