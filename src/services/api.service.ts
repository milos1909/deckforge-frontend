import axios from "axios";
import { AuthService } from "./auth.service";

type AuthMode = 'required' | 'optional' | 'none'
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

const client = axios.create({
    baseURL:'http://localhost:3300/api',
    headers: {
        'Accept': 'application/json',
    }
})

export class ApiService {
    static async useAxios<T>(url: string, method: HttpMethod = 'get', payload: any = {}, authMode: AuthMode = 'required', retry = true): Promise<any> {
        const accessToken = authMode === 'none' ? null : AuthService.getAccessToken()
        const headers: Record<string, string> = {
            'Accept': 'application/json'
        }

        if (authMode !== 'none' && accessToken) {
            headers.Authorization = `Bearer ${accessToken}`
        }

        const rsp = await client.request<T>({
            url,
            method,
            headers,
            data: payload,
            validateStatus: () => true
        })

        if (rsp.status === 403 && retry && authMode !== 'none' && accessToken) {
            const newAccess = await this.refreshAccessToken()

            if (newAccess) {
                return await this.useAxios<T>(url, method, payload, authMode, false)
            }
        }

        if (rsp.status >= 200 && rsp.status < 300) {
            return rsp
        }

        const responseData = rsp.data as { message?: string } | undefined
        throw new Error(responseData?.message ?? `Status code: ${rsp.status}`)
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
}
