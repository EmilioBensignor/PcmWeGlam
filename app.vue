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
  const session = await supabase.auth.getSession();
  const userInfo = session.data.session

  if (!session.data.session) {
    return navigateTo(ROUTE_NAMES.LOGIN);
  } else {
    const { data, error } = await supabase.auth.setSession({
      access_token: userInfo.access_token,
      refresh_token: userInfo.refresh_token,
      expires_in: userInfo.expires_in,
      token_type: userInfo.token_type,
      user: userInfo.user,
    })
    if (error) {
      console.error(error);
    } else {
      console.log(data);
      navigateTo(ROUTE_NAMES.HOME);
    }
  }
}
</script>