<template>
    <main>
        <section v-if="user">
            <h1>Hiciste tus habitos?</h1>
            <p>Email: {{ user.email }}</p>
            <p>Leer 1 pagina</p>
            <p>Ver 1 clase</p>
            <p>Escribir 1 commit</p>
            <p>Ejercicios de kinesio</p>
            <p>Salir afuera</p>
            <p>Producto del pelo</p>
            <button @click="signOut">Cerrar sesión</button>
        </section>
    </main>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

async function signOut() {
    try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        router.push('/login')
    } catch (error) {
        console.error(error.message)
    }
}
</script>