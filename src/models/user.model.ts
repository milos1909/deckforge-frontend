import type { InvoiceModel } from "./invoice.model"

export interface UserModel {
    id: number
    username: string
    email: string
    invoices: InvoiceModel[]
}