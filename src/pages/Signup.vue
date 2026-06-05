<script lang="ts" setup>
    import { DataService } from '@/services/data.service';
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

    function signUp(){
        if(payload.value.username == '' || payload.value.email == '') return
        if(payload.value.password == '' || payload.value.repeat == '') return
        if(payload.value.repeat !== payload.value.password) return

        DataService.register(payload.value).then(rsp => {
            sessionStorage.setItem('verify_email', payload.value.email)
            router.push('/verify')
        })
    }
</script>

<template>
    <div class="form-signin m-auto">
        <img class="mb-4" src="/puzzle.jpg" alt="" width="42" height="42" />
        <h1 class="h3 mb-3 fw-normal">Please sign up</h1>
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
        <p class="mt-5 mb-3 text-body-secondary">© {{ year }}</p>
    </div>
</template>