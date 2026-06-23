import type { AuthModel } from "@/models/auth.model";

const AUTH_KEY = 'deckforge_auth'

export class AuthService {
    static getAuth(): AuthModel | null {
        const auth = localStorage.getItem(AUTH_KEY)

        return auth ? JSON.parse(auth) : null
    }

    static saveAuth(auth: AuthModel) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
    }

    static clearAuth() {
        localStorage.removeItem(AUTH_KEY)
    }

    static getAccessToken() {
        return this.getAuth()?.access ?? null
    }

    static getRefreshToken() {
        return this.getAuth()?.refresh ?? null
    }
}
