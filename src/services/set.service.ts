import { ApiService } from "./api.service";

export class SetService {
    static async getSets(name: string, sortDirection: 'ASC' | 'DESC', maxPrice: number, limit: number, offset: number) { 
        const params = new URLSearchParams({
            name,
            sortDirection,
            maxPrice: String(maxPrice),
            limit: String(limit),
            offset: String(offset)
        })

        return await ApiService.useAxios(`/set?${params.toString()}`, 'get', {}, 'none')
    }

    static async getSetByName(setName: string) {
        return await ApiService.useAxios(`/set/${encodeURIComponent(setName)}`, 'get', {}, 'none')
    }
}
