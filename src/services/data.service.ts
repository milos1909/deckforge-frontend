import axios from "axios";
import { AuthService } from "./auth.service";

const client = axios.create({
    baseURL:'http://localhost:3300/api',
    headers: {
        'Accept': 'application/json',
    }
})

export class DataService {
    static async useAxios<T>(url: string, method: 'get' | 'post' | 'put' | 'delete' = 'get', payload: any = {}, retry = true): Promise <any>{
        
        try {
            const accessToken = AuthService.getAccessToken()
            const rsp = await client.request({
                url,
                method,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': accessToken? `Bearer ${accessToken}` : ''
                },
                data: payload,
                validateStatus: () => true
            })

            if (rsp.status === 403 && retry){
                const newAccess = await this.refreshAccessToken()
                if (newAccess) {
                    return await this.useAxios<T>(url, method, payload, false)
                }
            }

            if (rsp.status === 500) {
                throw new Error(rsp.data.message)
            }

            if (rsp.status === 200 || rsp.status === 204) {
                return rsp
            }

            throw new Error(`Status code: ${rsp.status}`)
        } catch (e) {

        }
        
        return await client.request<T>({
            url,
            method,
            data: payload
        })
    }

    private static async refreshAccessToken() {
        const refreshToken = AuthService.getRefreshToken()

        if (!refreshToken) return null

        try{
            const rsp = await client.request({
                url: '/user/refresh',
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${refreshToken}` 
                }
            })

            AuthService.saveAuth(rsp.data)
            return rsp.data.access
        } catch (e) {
            AuthService.clearAuth()
            console.error('Token refresh failed!')
            return null
        }
    }

    static async getSets(search: string, offset: number) { 
        return await client.get('/set', {
                params: {
                    name: search,
                    offset
                }
            })
    }

    static async getCards(search: string, offset: number) { 
        return await client.get('/card', {
                params: {
                    name: search,
                    offset
                }
            })
    }

    static async getSetByName(set_name: string) {
        return await client.get(`/set/${set_name}`)
    }

    static async getCardById(id: number) {
        return await client.get(`/card/${id}`)
    }

    static async register(obj: any) {
        return await client.request({
            url: '/user/signup',
            method: 'POST',
            data: obj
        })
    }

    static async verifyEmail(code: number) {
        return await client.request({
            url: `/user/verify/${code}`,
            method: 'PUT'
        })
    }

    static async login(obj: any) {
        return await client.request({
            url: '/user/login',
            method: 'POST',
            data: obj
        })
    }
}