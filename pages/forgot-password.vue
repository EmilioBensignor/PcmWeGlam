<template>
    <main>
        <section class="w-full max-800 columnAlignCenter">
            <NuxtLink :to="ROUTE_NAMES.LOGIN" class="back rowCenter gap-2 align-self-start text-black no-underline">
                <Icon name="tabler:arrow-left" />
                Volver a Iniciar sesión
            </NuxtLink>
            <h1>Restablecer contraseña</h1>
            <p class="max-480">
                Ingrese el correo electrónico de su cuenta para poder reestablecer su
                contraseña.
            </p>
            <form @submit.prevent="handleForgotPassword" class="w-full max-480 formAuth columnAlignCenter">
                <div class="w-full">
                    <FormEmailField id="email" label="Correo electrónico" placeholder="stevejobs@gmail.com"
                        v-model="form.email" :error="errors.email" @input="validateEmail" />
                </div>
                <div class="error center" v-if="errorMsg">
                    <Icon name="tabler:alert-octagon" style="color: var(--color-red)" />
                    <span class="pi pi-exclamation-circle"></span>
                    <p>{{ errorMsg }}</p>
                </div>
                <Button :loading="loading" :class="{ active: isValid }" class="primaryButton loadingButton"
                    :label="loading ? '' : 'Restablecer contraseña'" type="submit" />
            </form>
        </section>
    </main>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

definePageMeta({
    layout: "auth",
});

const client = useSupabaseClient();
const router = useRouter();

// Estado del formulario
const form = reactive({
    email: ''
});

// Estado de errores
const errors = reactive({
    email: null
});

// Estado de carga y mensajes
const loading = ref(false);
const errorMsg = ref('');
const emailRequestCache = ref(new Set());

// Computar validez del formulario
const isValid = computed(() => {
    return !errors.email && form.email;
});

onMounted(() => {
    const lastEmail = localStorage.getItem('lastLoginEmail');
    if (lastEmail) {
        form.email = lastEmail;
    }
});

// Validación de email
const validateEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!form.email.trim()) {
        errors.email = 'Debes ingresar tu correo electrónico';
        return false;
    }
    if (!emailPattern.test(form.email)) {
        errors.email = 'El correo electrónico debe incluir un @ y . (punto)';
        return false;
    }

    errors.email = null;
    return true;
};

// Función para solicitar restablecimiento de contraseña
const handleForgotPassword = async () => {
    loading.value = true;
    errorMsg.value = '';

    const isEmailValid = validateEmail();
    if (!isEmailValid || !form.email.trim()) {
        loading.value = false;
        return;
    }

    // Verificar si ya se envió un email recientemente a esta dirección
    const cleanEmail = form.email.trim();
    if (emailRequestCache.value.has(cleanEmail)) {
        loading.value = false;
        errorMsg.value = 'Ya se ha enviado un correo a esta dirección en los últimos minutos. Por favor, revisa tu bandeja de entrada';
        return;
    }

    try {
        // Configurar URL de redirección absoluta
        const redirectUrl = new URL(ROUTE_NAMES.RESET_PASSWORD, window.location.origin).toString();

        const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: redirectUrl
        });

        if (error) {
            errorMsg.value = handleSupabaseError(error);
        };

        // Agregar email a caché para prevenir peticiones duplicadas
        emailRequestCache.value.add(cleanEmail);
        setTimeout(() => {
            emailRequestCache.value.delete(cleanEmail);
        }, 120000);

        router.push({
            path: ROUTE_NAMES.FORGOT_PASSWORD_CONFIRMATION,
            query: { email: cleanEmail }
        });

        resetForm();
    } catch (error) {
        errorMsg.value = handleSupabaseError(error) || 'Ha ocurrido un error al restablecer la contraseña';
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    form.email = '';
    errors.email = null;
    errorMsg.value = '';
};
</script>

<style scoped>
.back {
    font-size: 0.75rem;
}

@media (width >=992px) {
    .back {
        font-size: 0.875rem;
    }

    .back span {
        font-size: 1.5rem !important;
    }
}
</style>