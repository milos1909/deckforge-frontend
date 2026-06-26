<script lang="ts" setup>
import { useAuth } from '@/hooks/auth.hook';
import { errorMessage as getErrorMessage } from '@/helpers/error';
import { ref } from 'vue';

const payload = ref({
    username: '',
    password: ''
})

const { login } = useAuth()

const errorMessage = ref('')

async function submitLogin() {
    errorMessage.value = ''

    if (!payload.value.username || !payload.value.password) {
        errorMessage.value = 'Username and password are required.'
        return
    }

    try {
        await login(payload.value)
    } catch (e) {
        errorMessage.value = getErrorMessage(e, 'Login failed. Please check your username and password.')
    }
}
</script>

<template>
    <div class="form-signin m-auto">
        <img class="mb-4" src="/puzzle.jpg" alt="" width="42" height="42" />
        <h1 class="h3 mb-3 fw-normal">Please log in</h1>
        <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
            {{ errorMessage }}
        </div>
        <div class="form-floating mb-2">
            <input type="username" class="form-control" id="username" placeholder="name@example.com" v-model="payload.username" />
            <label for="username">Username</label>
        </div>
        <div class="form-floating mb-2">
            <input type="password" class="form-control" id="password" placeholder="Password" v-model="payload.password" />
            <label for="password">Password</label>
        </div>
        <button class="btn btn-primary w-100 my-2" @click="submitLogin"> 
            <i class="fa-solid fa-arrow-right-to-bracket"></i> 
            Log in
        </button>
        <div>
            Don't have an account? <RouterLink to="/signup">Sign up</RouterLink>
        </div>
    </div>
</template>
