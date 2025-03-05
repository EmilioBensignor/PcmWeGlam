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
                    <Icon name="tabler:alert-octagon" style="color: var(--color-red)" />
                    <span class="pi pi-exclamation-circle"></span>
                    <p>{{ errorMsg }}</p>
                </div>
                <Button :loading="loading" :class="{ active: isValid }" class="primaryButton loadingButton"
                    :label="loading ? '' : 'Ingresar'" type="submit" />
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
const route = useRoute();

// Estado del formulario
const form = reactive({
    email: '',
    password: ''
});

// Estado de errores
const errors = reactive({
    email: null,
    password: null
});

// Estado de carga y mensajes
const loading = ref(false);
const errorMsg = ref('');

// Computar validez del formulario
const isValid = computed(() => {
    return !errors.email &&
        !errors.password &&
        form.email &&
        form.password;
});

// Autocompletar email si viene del registro
onMounted(() => {
    const lastEmail = sessionStorage.getItem('lastRegisteredEmail');
    if (lastEmail) {
        form.email = lastEmail;
        // Limpiar después de usarlo
        sessionStorage.removeItem('lastRegisteredEmail');
    }

    // Verificar si hay un hash en la URL (redirección de verificación de email)
    if (route.hash && route.hash.includes('type=recovery')) {
        // Extraer el email del hash si está disponible
        const emailMatch = route.hash.match(/email=([^&]*)/);
        if (emailMatch && emailMatch[1]) {
            form.email = decodeURIComponent(emailMatch[1]);
        }
    }
});

// Validación de email
const validateEmail = () => {
    if (!form.email) {
        errors.email = 'El email es requerido';
        return false;
    }
    errors.email = null;
    return true;
};

// Validación de contraseña
const validatePassword = () => {
    if (!form.password) {
        errors.password = 'La contraseña es requerida';
        return false;
    }
    errors.password = null;
    return true;
};

// Función de inicio de sesión
const handleSignIn = async () => {
    loading.value = true;
    errorMsg.value = '';

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
        loading.value = false;
        return;
    }

    try {
        // Guardar el email en localStorage para futuras sesiones
        localStorage.setItem('lastLoginEmail', form.email);
        errorMsg.value = '';
        const { error } = await client.auth.signInWithPassword({
            email: form.email,
            password: form.password,
            options: {
                staySignedIn: true
            }
        });

        if (error) {
            errorMsg.value = handleSupabaseError(error);
        }

        router.push(ROUTE_NAMES.HOME);
    } catch (error) {
        errorMsg.value = handleSupabaseError(error);
    } finally {
        loading.value = false;
    }
};
</script>