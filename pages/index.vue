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
        </section>
    </main>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
const user = useSupabaseUser();
</script>