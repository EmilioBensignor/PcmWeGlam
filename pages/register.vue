<template>
    <main>
        <Toast />
        <section class="w-full columnAlignCenter">
            <h1>Registrarse</h1>
            <form @submit.prevent="signUp" class="w-full formAuth columnAlignCenter">
                <div class="formFieldsContainer">
                    <FormEmailField id="email" label="Correo electrónico" placeholder="stevejobs@gmail.com"
                        autocomplete="email" v-model="form.email" :error="errors.email" @input="validateEmail" />
                    <FormPasswordField id="password" label="Contraseña" placeholder="********"
                        autocomplete="current-password" v-model="form.password" :error="errors.password"
                        @input="validatePassword" type="password" />
                </div>
                <p class="pSmall">Si ya tienes una cuenta, <NuxtLink :to="ROUTE_NAMES.LOGIN" class="pSmall text-black">
                        inicia sesión</NuxtLink>
                </p>
                <div class="error center" v-if="errorMsg">
                    <Icon name="mingcute:alert-octagon-line" style="color: var(--color-red)" />
                    <span class="pi pi-exclamation-circle"></span>
                    <p>{{ errorMsg }}</p>
                </div>
                <Button :loading="loading" :class="{ active: isValid }" class="primaryButton" label="Registrarse"
                    type="submit" />
            </form>
        </section>
    </main>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useToast } from "primevue/usetoast";
import { useRouter } from 'vue-router';

definePageMeta({
    layout: "auth",
});

const client = useSupabaseClient();
const toast = useToast()
const router = useRouter();

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
const successMsg = ref('')

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
        errors.email = 'El email debe incluir un @ y un . (punto)'
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

    if (form.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres'
        return false
    }

    if (!/[a-z]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos una minúscula'
        return false
    }

    if (!/[A-Z]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos una mayúscula'
        return false
    }

    if (!/[0-9]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos un número'
        return false
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos un caracter especial'
        return false
    }

    errors.password = null
    return true
}

async function signUp() {
    loading.value = true
    errorMsg.value = ''

    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()

    if (!isEmailValid || !isPasswordValid) {
        loading.value = false
        return
    }

    try {
        const { data, error } = await client.auth.signUp({
            email: form.email,
            password: form.password
        });

        if (error) throw error;

        form.email = ''
        form.password = ''

        toast.add({
            severity: 'success',
            summary: '¡Éxito!',
            detail: 'Tu cuenta se ha creado con éxito. Revisa tu correo electrónico para verificar tu cuenta.',
            life: 5000
        });

        setTimeout(() => {
            router.push(ROUTE_NAMES.LOGIN);
        }, 5000);

    } catch (error) {
        errorMsg.value = error.message
    } finally {
        loading.value = false
    }
}
</script>