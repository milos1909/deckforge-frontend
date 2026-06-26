import { ApiService } from "./api.service";

export class InvoiceService {
     static async getCart() {
        return await ApiService.useAxios('/invoice/cart')
    }

    static async getInvoiceDetails(id: number) {
        return await ApiService.useAxios(`/invoice/${id}`)
    }

    static async addSetToCart(setName: string) {
        return await ApiService.useAxios( `/invoice/cart/set/${encodeURIComponent(setName)}`, 'put')
    }

    static async addCardToCart(cardId: number) {
        return await ApiService.useAxios( `/invoice/cart/card/${encodeURIComponent(cardId)}`, 'put')
    }

    static async pay() {
        return await ApiService.useAxios('/invoice/pay', 'put')
    }

    static async updateCartItemCount(id: number, count: number) {
        return await ApiService.useAxios(`/invoice/cart/${id}/count/${count}`, 'put')
    }

    static async removeCartItem(id: number) {
        return await ApiService.useAxios(`/invoice/cart/${id}`, 'delete')
    }
}
