<template>
    <main class="login-container">
        <section class="login-box">
            <h1>Iniciar Sesión</h1>
            <form @submit.prevent="signIn">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input id="email" v-model="email" type="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input id="password" v-model="password" type="password" required>
                </div>
                <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>
                <button type="submit">Ingresar</button>
            </form>
        </section>
    </main>
</template>

<script setup>
const client = useSupabaseClient();
const router = useRouter();

const email = ref('')
const password = ref('')
const errorMsg = ref('')

async function signIn() {
    try {
        const { error } = await client.auth.signInWithPassword({
            email: email.value,
            password: password.value
        });
        if (error) throw error;
        router.push('/')
    } catch (error) {
        errorMsg.value = error.message
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}

.login-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: bold;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 1rem;
}

input:focus {
    outline: none;
    border-color: #4a90e2;
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #357abd;
}

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}
</style>