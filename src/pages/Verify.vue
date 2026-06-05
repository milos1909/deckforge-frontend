<script lang="ts" setup>
    import { DataService } from '@/services/data.service';
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';

    const year = new Date().getFullYear()

    const code = ref<number>()
    const router = useRouter()
    const email = sessionStorage.getItem('verify_email')

    function verify(){
        if(code.value == null) {
           alert("Code can't be empty") 
           return
        }
        
        DataService.verifyEmail(code.value).then(rsp => router.push('/login')).catch(e => alert('Error: ' + e.message))
    }
</script>

<template>
    <div class="form-signin m-auto">
        <img class="mb-4" src="/puzzle.jpg" alt="" width="42" height="42" />
        <h1 class="h3 mb-3 fw-normal">Verify your email</h1>
        <div class="alert alert-warning" role="alert">
            The verification code has been sent to {{ email ?? 'your email' }} adress
        </div>
        <div class="form-floating">
            <input type="number" class="form-control" id="code" placeholder="Password" v-model="code" />
            <label for="code">Verification code</label>
        </div>
        <button class="btn btn-primary w-100 my-2" @click="verify"> 
            Verify and go to login
        </button>
        <p class="mt-5 mb-3 text-body-secondary">© {{ year }}</p>
    </div>
</template>