<template>
  <NuxtLayout>
    <Toast />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { ROUTE_NAMES } from './constants/ROUTE_NAMES';

onMounted(async () => {
  setUserSession();
})

async function setUserSession() {
  const supabase = useSupabaseClient();
  const route = useRoute();
  const session = await supabase.auth.getSession();
  const userInfo = session.data.session;
  const currentPath = route.fullPath;

  if (!session.data.session) {
    if (currentPath !== ROUTE_NAMES.HOME && currentPath !== ROUTE_NAMES.LOGIN) {
      return navigateTo(ROUTE_NAMES.LOGIN);
    }
    return;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: userInfo.access_token,
    refresh_token: userInfo.refresh_token,
    expires_in: userInfo.expires_in,
    token_type: userInfo.token_type,
    user: userInfo.user,
  });

  if (error) {
    console.error(error);
    return navigateTo(ROUTE_NAMES.LOGIN);
  }

  if (currentPath === ROUTE_NAMES.LOGIN || currentPath === ROUTE_NAMES.HOME) {
    return navigateTo(ROUTE_NAMES.HOME);
  }
}
</script>