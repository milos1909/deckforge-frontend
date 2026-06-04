import type { SetModel } from "./set.model"

export interface InvoiceItemModel {
    id: number
    pricePerItem: number
    count: number
    set: SetModel
}