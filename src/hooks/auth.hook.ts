import type { AuthModel } from "@/models/auth.model";
import { AuthService } from "@/services/auth.service";
import { DataService } from "@/services/data.service";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const auth = ref<AuthModel | null>(AuthService.getAuth())

export function useAuth() {
    const router = useRouter()
    
    function login(payload: any) {
        DataService.login(payload).then(rsp => {
            AuthService.saveAuth(rsp.data)
            auth.value = rsp.data
            router.push('/')
        })
    }

    function logout(e: Error | null = null) {
        if (e) alert(e.message)

        AuthService.clearAuth()
        auth.value = null

        router.push('/')
    }

    return {
        login,
        logout,
        auth
    }
}