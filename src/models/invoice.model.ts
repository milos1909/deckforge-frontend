import type { InvoiceItemModel } from "./invoiceItem.model"

export interface InvoiceModel {
    id: number
    pursId: string
    pursTime: string
    pursCounter: string
    createdAt: string
    invoiceItems: InvoiceItemModel[]
}