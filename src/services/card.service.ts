import { ApiService } from "./api.service";

export class CardService {
    static async getCards(search: string, limit: number, offset: number, filters: any = {}) { 
        const params = new URLSearchParams()

        params.set('name', search)
        params.set('limit', String(limit))
        params.set('offset', String(offset))

        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
        }

        return await ApiService.useAxios(`/card?${params.toString()}`, 'get', {}, 'none')
    }

    static async getCardById(id: number) {
        return await ApiService.useAxios(`/card/${id}`, 'get', {}, 'none')
    }

    static async getCardTypes() {
        return await ApiService.useAxios('/card/types', 'get', {}, 'none')
    }

    static async getCardArchetypes() {
        return await ApiService.useAxios('/card/archetypes', 'get', {}, 'none')
    }

    static async getCardRaces(type: string) {
        return await ApiService.useAxios(`/card/races?type=${encodeURIComponent(type)}`, 'get', {}, 'none')
    }

    static async getCardAttributes() {
        return await ApiService.useAxios('/card/attributes', 'get', {}, 'none')
    }

    static async getDecksByCard(cardId: number, limit: number) { 
        const params = new URLSearchParams({
            limit: String(limit)
        })

        return await ApiService.useAxios(`/card/${encodeURIComponent(cardId)}/decks?${params.toString()}`, 'get', {}, 'none')
    }

    static async getSetsByCard(cardId: number, limit: number, offset: number) { 
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset)
        })

        return await ApiService.useAxios(`/card/${encodeURIComponent(cardId)}/sets?${params.toString()}`, 'get', {}, 'none')
    }
}
