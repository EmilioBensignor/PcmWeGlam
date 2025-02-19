<template>
    <main>
        <Toast />
        <section class="w-full columnAlignCenter">
            <h1>Restablecer contraseña</h1>
            <form @submit.prevent="handleResetPassword" class="w-full formAuth columnAlignCenter">
                <div class="formFieldsContainer">
                    <FormPasswordField id="password" label="Nueva contraseña" placeholder="********"
                        v-model="form.password" :error="errors.password" @input="validatePassword" />
                    <FormPasswordField id="confirmPassword" label="Confirmar contraseña" placeholder="********"
                        v-model="form.confirmPassword" :error="errors.confirmPassword"
                        @input="validateConfirmPassword" />
                </div>
                <div class="error center" v-if="errorMsg">
                    <Icon name="mingcute:alert-octagon-line" style="color: var(--color-red)" />
                    <span class="pi pi-exclamation-circle"></span>
                    <p>{{ errorMsg }}</p>
                </div>
                <Button :loading="loading" :class="{ active: isValid }" class="primaryButton"
                    label="Actualizar contraseña" type="submit" />
            </form>
        </section>
    </main>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
import { useToast } from "primevue/usetoast";

definePageMeta({
    layout: "auth",
});

const toast = useToast()

const client = useSupabaseClient()
const router = useRouter()

const form = reactive({
    password: '',
    confirmPassword: ''
})

const errors = reactive({
    password: null,
    confirmPassword: null
})

const loading = ref(false)
const errorMsg = ref('')

const isValid = computed(() => {
    return !errors.password &&
        !errors.confirmPassword &&
        form.password &&
        form.confirmPassword &&
        form.password === form.confirmPassword
})

const validatePassword = () => {
    if (!form.password) {
        errors.password = 'La contraseña es requerida'
        return false
    }
    if (form.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres'
        return false
    }
    errors.password = null
    validateConfirmPassword()
    return true
}

const validateConfirmPassword = () => {
    if (!form.confirmPassword) {
        errors.confirmPassword = 'Debe confirmar la contraseña'
        return false
    }
    if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden'
        return false
    }
    errors.confirmPassword = null
    return true
}

const handleResetPassword = async () => {
    loading.value = true
    errorMsg.value = ''

    const isPasswordValid = validatePassword()
    const isConfirmPasswordValid = validateConfirmPassword()

    if (!isPasswordValid || !isConfirmPasswordValid) {
        loading.value = false
        return
    }

    try {
        const { error } = await client.auth.updateUser({
            password: form.password
        })

        if (error) throw error

        toast.add({
            severity: 'success',
            summary: '¡Éxito!',
            detail: 'Tu contraseña se ha restablecido con éxito.',
            life: 3000
        });

        setTimeout(() => {
            router.push({
                path: ROUTE_NAMES.LOGIN,
            })
        }, 3000)
    } catch (error) {
        errorMsg.value = error.message || 'Error al restablecer la contraseña'
    } finally {
        loading.value = false
    }
}
</script>