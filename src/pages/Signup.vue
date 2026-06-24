<script lang="ts" setup>
import { errorMessage as getErrorMessage } from '@/helpers/error';
import { UserService } from '@/services/user.service';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const year = new Date().getFullYear()

const router = useRouter()
const payload = ref({
    username: '',
    email: '',
    password: '',
    repeat: ''
})

const errorMessage = ref('')

function signUp(){
    errorMessage.value = ''

    if(payload.value.username == '' || payload.value.email == '') {
        errorMessage.value = 'Username and email are required.'
        return
    }

    if(payload.value.password == '' || payload.value.repeat == '') {
        errorMessage.value = 'Password and repeated password are required.'
        return
    }

    if(payload.value.repeat !== payload.value.password) {
        errorMessage.value = 'Passwords do not match.'
        return
    }

    UserService.register(payload.value).then(rsp => {
        sessionStorage.setItem('verify_email', payload.value.email)
        router.push('/verify')
    }).catch(e => {
        errorMessage.value = getErrorMessage(e, 'Account could not be created.')
    })
}
</script>

<template>
    <div class="form-signin m-auto">
        <img class="mb-4" src="/puzzle.jpg" alt="" width="42" height="42" />
        <h1 class="h3 mb-3 fw-normal">Please sign up</h1>
        <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
            {{ errorMessage }}
        </div>
        <div class="form-floating">
            <input type="username" class="form-control" id="username" placeholder="Username" v-model="payload.username" />
            <label for="username">Username</label>
        </div>
        <div class="form-floating">
            <input type="email" class="form-control" id="email" placeholder="Email" v-model="payload.email" />
            <label for="email">Email</label>
        </div>
        <div class="form-floating">
            <input type="password" class="form-control" id="password" placeholder="Password" v-model="payload.password" />
            <label for="password">Password</label>
        </div>
        <div class="form-floating">
            <input type="password" class="form-control" id="password" placeholder="Password" v-model="payload.repeat" />
            <label for="password">Repeat Password</label>
        </div>
        <button class="btn btn-primary w-100 my-2" @click="signUp"> 
            <i class="fa-solid fa-arrow-right-to-bracket"></i> 
            Create account
        </button>
        <div>
            Already have an account? <RouterLink to="/login">Log in</RouterLink>
        </div>
    </div>
</template>
