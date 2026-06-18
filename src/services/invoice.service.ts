import { DataService } from "./data.service";

export class InvoiceService {
    static async addSetToCart(setName: string) {
        return await DataService.useAxios( `/invoice/cart/add/${setName}`, 'put')
    }

    static async getInvoiceDetails(id: number) {
        return await DataService.useAxios(`/invoice/${id}`)
    }
}