import { ApiService } from "./api.service";
import type { DeckDetailsResponse, DeckMetadataInput } from "@/models/deck.model";


export class DeckService {
    static async getDecks(name: string, sortBy: 'createdAt' | 'viewCount', limit: number, offset: number) {
        const params = new URLSearchParams({
            name,
            sortBy,
            limit: String(limit),
            offset: String(offset)
        })

        return await ApiService.useAxios(`/deck?${params.toString()}`, 'get', {}, 'none')
    }

    static async getDeckById(id: number) {
        return await ApiService.useAxios<DeckDetailsResponse>(`/deck/${id}`, 'get', {}, 'optional')
    }

    static async copyDeck(id: number) {
        return await ApiService.useAxios(`/deck/${id}/copy`, 'post')
    }

    static async createDeck(obj: any) {
        return await ApiService.useAxios( `/deck/create`, 'post', obj)
    }

    static async updateDeck(id: number, obj: any) {
        return await ApiService.useAxios( `/deck/update/${id}`, 'put', obj)
    }

    static async updateMetadata(id: number, obj: DeckMetadataInput) {
        return await ApiService.useAxios(`/deck/update-metadata/${id}`, 'patch', obj)
    }
}
