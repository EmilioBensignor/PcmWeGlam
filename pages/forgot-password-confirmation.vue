<template>
  <main>
    <section class="w-full max-480 columnAlignCenter">
      <h1>Restablecer contraseña</h1>
      <div class="columnAlignCenter">
        <p>
          Se envió un correo electrónico a {{ email }} para poder
          reestablecer la contraseña.
        </p>
        <div class="w-full">
          <p>¿El correo electrónico indicado no es correcto?</p>
          <NuxtLink :to="routes.FORGOT_PASSWORD" class="text-black">
            Modificar.
          </NuxtLink>
        </div>
      </div>
      <NuxtLink :to="routes.LOGIN" class="primaryButton active no-underline">
        Volver a Iniciar Sesión
      </NuxtLink>
    </section>
  </main>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const routes = ROUTE_NAMES;
const email = ref('');

watch(() => route.query.email, (newEmail) => {
  if (newEmail) {
    email.value = newEmail;
  }
}, { immediate: true });
</script>

<style scoped>
section,
section>div {
  gap: 1.75rem;
}

section div {
  max-width: 480px;
}

section>p {
  max-width: 480px;
}
</style>
