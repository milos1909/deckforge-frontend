import type { InvoiceModel } from "./invoice.model"
import type { DeckSummaryModel } from "./deck.model"

export interface UserModel {
    id: number
    username: string
    email: string
    decks: DeckSummaryModel[]
    invoices: InvoiceModel[]
}
