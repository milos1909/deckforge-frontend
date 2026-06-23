import type { UserModel } from "@/models/user.model"
import { ApiService } from "./api.service"

export class UserService {
    static async getProfile() {
        return await ApiService.useAxios<UserModel>('/user/profile')
    }

    static async login(obj: any) {
        return await ApiService.useAxios('/user/login', 'post', obj, 'none')
    }

    static async register(obj: any) {
        return await ApiService.useAxios('/user/signup', 'post', obj, 'none')
    }

    static async verifyEmail(code: number) {
        return await ApiService.useAxios(`/user/verify/${code}`, 'put', {}, 'none')
    }
}
