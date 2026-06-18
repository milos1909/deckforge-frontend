import type { AuthModel } from "@/models/auth.model";

const AUTH_KEY = 'deckforge_auth'

export class AuthService {
    static getAuth(): AuthModel {
        return JSON.parse(localStorage.getItem(AUTH_KEY)!)
    }

    static saveAuth(auth: AuthModel) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
    }

    static clearAuth() {
        localStorage.removeItem(AUTH_KEY)
    }

    static getAccessToken() {
        return this.getAuth().access
    }

    static getRefreshToken() {
        return this.getAuth().refresh
    }
}