import type { InvoiceModel } from "./invoice.model"
import type { DeckModel } from "./deck.model"

export interface UserModel {
    id: number
    username: string
    email: string
    decks: DeckModel[]
    invoices: InvoiceModel[]
}
