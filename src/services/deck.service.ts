import { DataService } from "./data.service";


export class DeckService {
    static async createDeck(obj: any) {
        return await DataService.useAxios( `/deck/create`, 'post', obj)
    }

    static async updateDeck(id: number, obj: any) {
        return await DataService.useAxios( `/deck/update/${id}`, 'put', obj)
    }
}