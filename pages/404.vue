<template>
    <main>
        <section class="w-full columnAlignCenter">
            <h1>¡Ups! Página no encontrada</h1>
            <p class="text-center">
                Parece que has tomado un desvío inesperado. La página que buscas no está disponible o ha cambiado de
                dirección.
            </p>
            <NuxtLink :to="ROUTE_NAMES.HOME" class="primaryButton active">Volver al inicio</NuxtLink>
        </section>
    </main>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
</script>

<style scoped>
p {
    max-width: 440px;
}

@media (width >=992px) {
    section {
        gap: 2.25rem;
    }

    p {
        max-width: 540px;
    }

    a {
        width: max-content;
    }
}
</style>