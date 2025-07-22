<template>
    <footer class="center">
        <p>© {{ new Date().getFullYear() }} Peripeteia. Todos los derechos reservados</p>
    </footer>
</template>

<style scoped>
footer {
    background-color: var(--mid-gray-color);
    padding: 0.5rem;
}

footer p {
    font-size: 0.625rem;
}

@media (width >=992px) {
    footer p {
        font-size: 0.75rem;
    }
}
</style>