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
                    <Icon name="tabler:alert-octagon" style="color: var(--color-red)" />
                    <span class="pi pi-exclamation-circle"></span>
                    <p>{{ errorMsg }}</p>
                </div>
                <Button :loading="loading" :class="{ active: isValid }" class="primaryButton loadingButton"
                    :label="loading ? '' : 'Actualizar contraseña'" type="submit" />
            </form>
        </section>
    </main>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useToast } from "primevue/usetoast";

definePageMeta({
    layout: "auth",
});

const toast = useToast();
const client = useSupabaseClient();
const router = useRouter();
const route = useRoute();

// Estado del formulario
const form = reactive({
    password: '',
    confirmPassword: ''
});

// Estado de errores
const errors = reactive({
    password: null,
    confirmPassword: null
});

// Estado de carga y mensajes
const loading = ref(false);
const errorMsg = ref('');
const passwordUpdateAttempted = ref(false);

// Computar validez del formulario
const isValid = computed(() => {
    return !errors.password &&
        !errors.confirmPassword &&
        form.password &&
        form.confirmPassword &&
        form.password === form.confirmPassword;
});

// Verificar token de restablecimiento al cargar el componente
onMounted(async () => {
    // Verificar si hay un hash en la URL (token de reset)
    if (!route.hash || !route.hash.includes('type=recovery')) {
        errorMsg.value = 'Enlace de restablecimiento inválido o expirado';
        return;
    }

    try {
        const { data, error } = await client.auth.getSession();
        if (error) {
            console.warn('Error al verificar sesión:', error);
        }
    } catch (error) {
        console.error('Error al inicializar recuperación:', error);
    }
});

// Validación de contraseña
const validatePassword = () => {
    if (!form.password) {
        errors.password = 'La contraseña es requerida';
        return false;
    }
    if (form.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
        return false;
    }
    errors.password = null;
    validateConfirmPassword();
    return true;
};

// Validación de confirmación de contraseña
const validateConfirmPassword = () => {
    if (!form.confirmPassword) {
        errors.confirmPassword = 'Debe confirmar la contraseña';
        return false;
    }
    if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
        return false;
    }
    errors.confirmPassword = null;
    return true;
};

// Función para actualizar contraseña
const handleResetPassword = async () => {
    if (passwordUpdateAttempted.value) {
        errorMsg.value = 'El proceso de actualización ya está en curso. Por favor espere.';
        return;
    }

    loading.value = true;
    errorMsg.value = '';
    passwordUpdateAttempted.value = true;

    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isPasswordValid || !isConfirmPasswordValid) {
        loading.value = false;
        passwordUpdateAttempted.value = false;
        return;
    }

    try {
        const { error } = await client.auth.updateUser({
            password: form.password
        });

        if (error) {
            errorMsg.value = handleSupabaseError(error);
        };

        form.password = '';
        form.confirmPassword = '';

        toast.add({
            severity: 'success',
            summary: '¡Éxito!',
            detail: 'Tu contraseña se ha restablecido con éxito.',
            life: 3000
        });

        setTimeout(() => {
            router.push({
                path: ROUTE_NAMES.LOGIN,
            });
        }, 3000);
    } catch (error) {
        errorMsg.value = handleSupabaseError(error) || 'Error al restablecer la contraseña';
        passwordUpdateAttempted.value = false;
    } finally {
        loading.value = false;
    }
};
</script>