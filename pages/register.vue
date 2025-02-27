// Mejora del componente de registro actual
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
                        autocomplete="new-password" v-model="form.password" :error="errors.password"
                        @input="validatePassword" type="password" />
                    <FormPasswordField id="passwordConfirm" label="Confirmar contraseña" placeholder="********"
                        autocomplete="new-password" v-model="form.passwordConfirm" :error="errors.passwordConfirm"
                        @input="validatePasswordConfirm" type="password" />
                </div>
                <p class="pSmall">Si ya tienes una cuenta, <NuxtLink :to="ROUTE_NAMES.LOGIN" class="pSmall text-black">
                        inicia sesión</NuxtLink>
                </p>
                <div class="error center" v-if="errorMsg">
                    <Icon name="tabler:alert-octagon" style="color: var(--color-red)" />
                    <span class="pi pi-exclamation-circle"></span>
                    <p>{{ errorMsg }}</p>
                </div>
                <div v-if="checkingPassword" class="info center">
                    <Icon name="tabler:loader" style="color: var(--color-blue)" class="animate-spin" />
                    <p>Verificando la seguridad de tu contraseña...</p>
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
    password: '',
    passwordConfirm: ''
})

const errors = reactive({
    email: null,
    password: null,
    passwordConfirm: null
})

const loading = ref(false)
const checkingPassword = ref(false)
const errorMsg = ref('')
const isPasswordCompromised = ref(false)

const isValid = computed(() => {
    return !errors.email &&
        !errors.password &&
        !errors.passwordConfirm &&
        form.email &&
        form.password &&
        form.passwordConfirm &&
        !isPasswordCompromised.value
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

const validatePassword = async () => {
    if (!form.password) {
        errors.password = 'La contraseña es requerida'
        isPasswordCompromised.value = false
        return false
    }

    if (form.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres'
        isPasswordCompromised.value = false
        return false
    }

    if (!/[a-z]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos una minúscula'
        isPasswordCompromised.value = false
        return false
    }

    if (!/[A-Z]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos una mayúscula'
        isPasswordCompromised.value = false
        return false
    }

    if (!/[0-9]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos un número'
        isPasswordCompromised.value = false
        return false
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos un caracter especial'
        isPasswordCompromised.value = false
        return false
    }

    try {
        checkingPassword.value = true
        isPasswordCompromised.value = await checkPasswordLeak(form.password)

        if (isPasswordCompromised.value) {
            errors.password = 'Esta contraseña ha aparecido en filtraciones de datos. Por favor, utiliza una contraseña única.'
            return false
        }
    } catch (error) {
        console.error('Error al verificar contraseña:', error)
    } finally {
        checkingPassword.value = false
    }

    if (form.passwordConfirm) {
        validatePasswordConfirm()
    }

    errors.password = null
    return true
}

const validatePasswordConfirm = () => {
    if (!form.passwordConfirm) {
        errors.passwordConfirm = 'La confirmación de contraseña es requerida'
        return false
    }

    if (form.passwordConfirm !== form.password) {
        errors.passwordConfirm = 'Las contraseñas no coinciden'
        return false
    }

    errors.passwordConfirm = null
    return true
}

async function checkPasswordLeak(password) {
    try {
        const encoder = new TextEncoder()
        const data = encoder.encode(password)
        const hashBuffer = await crypto.subtle.digest('SHA-1', data)

        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        const prefix = hashHex.substring(0, 5)
        const suffix = hashHex.substring(5).toUpperCase()

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)

        if (!response.ok) {
            throw new Error('Error al consultar la API de contraseñas comprometidas')
        }

        const text = await response.text()

        return text.split('\r\n').some(line => {
            const [hashSuffix] = line.split(':')
            return hashSuffix.toUpperCase() === suffix
        })
    } catch (error) {
        console.error('Error al verificar contraseña:', error)
        return false
    }
}

async function signUp() {
    loading.value = true
    errorMsg.value = ''

    const isEmailValid = validateEmail()
    const isPasswordValid = await validatePassword()
    const isPasswordConfirmValid = validatePasswordConfirm()

    if (!isEmailValid || !isPasswordValid || !isPasswordConfirmValid) {
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
        form.passwordConfirm = ''

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