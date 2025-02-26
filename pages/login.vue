<template>
    <main>
        <section class="w-full columnAlignCenter">
            <h1>Iniciar sesión</h1>
            <form @submit.prevent="handleSignIn" class="w-full formAuth columnAlignCenter">
                <div class="formFieldsContainer">
                    <FormEmailField id="email" label="Correo electrónico" placeholder="stevejobs@gmail.com"
                        autocomplete="email" v-model="form.email" :error="errors.email" @input="validateEmail" />
                    <FormPasswordField id="password" label="Contraseña" placeholder="********"
                        autocomplete="current-password" v-model="form.password" :error="errors.password"
                        @input="validatePassword" type="password" />
                </div>
                <NuxtLink :to="ROUTE_NAMES.FORGOT_PASSWORD" class="pSmall text-black">
                    ¿Olvidaste tu contraseña?
                </NuxtLink>
                <p class="pSmall">Si todavía no tienes una cuenta, <NuxtLink :to="ROUTE_NAMES.REGISTER"
                        class="pSmall text-black">
                        registrate</NuxtLink>
                </p>
                <div class="error center" v-if="errorMsg">
                    <Icon name="mingcute:alert-octagon-line" style="color: var(--color-red)" />
                    <span class="pi pi-exclamation-circle"></span>
                    <p>{{ errorMsg }}</p>
                </div>
                <Button :loading="loading" :class="{ active: isValid }" class="primaryButton" label="Ingresar"
                    type="submit" />
            </form>
        </section>
    </main>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

definePageMeta({
    layout: "auth",
});

const client = useSupabaseClient()
const router = useRouter()

const form = reactive({
    email: '',
    password: ''
})

const errors = reactive({
    email: null,
    password: null
})

const loading = ref(false)
const errorMsg = ref('')

const isValid = computed(() => {
    return !errors.email &&
        !errors.password &&
        form.email &&
        form.password
})

const validateEmail = () => {
    if (!form.email) {
        errors.email = 'El email es requerido'
        return false
    }
    errors.email = null
    return true
}

const validatePassword = () => {
    if (!form.password) {
        errors.password = 'La contraseña es requerida'
        return false
    }
    errors.password = null
    return true
}

const handleSignIn = async () => {
    loading.value = true
    errorMsg.value = ''

    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()

    if (!isEmailValid || !isPasswordValid) {
        loading.value = false
        return
    }

    try {
        const { error } = await client.auth.signInWithPassword({
            email: form.email,
            password: form.password
        })

        if (error) throw error
        router.push(ROUTE_NAMES.HOME)
    } catch (error) {
        errorMsg.value = error.message
    } finally {
        loading.value = false
    }
}
</script>