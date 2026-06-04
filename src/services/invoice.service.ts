import { DataService } from "./data.service";

export class InvoiceService {
    static async addSetToCart(set_name: string) {
        return await DataService.useAxios( `/invoice/cart/add/${set_name}`, 'put')
    }

    static async getInvoiceDetails(id: number) {
        return await DataService.useAxios(`/invoice/${id}`)
    }
}