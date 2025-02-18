// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  modules: ["@primevue/nuxt-module", '@nuxt/image', '@nuxt/icon', '@pinia/nuxt', '@nuxt/fonts', '@nuxtjs/supabase'],
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/callback',
      exclude: [
        '/login',
        '/forgot-password',
        '/forgot-password-confirmation',
        '/reset-password',
      ]
    }
  },
  icon: {
    size: '1rem',
    class: 'tablerIcon',
    serverBundle: {
      collections: ['tabler'],
    }
  },
  primevue: {
    components: {
      include: ['Toast']
    }
  },
  plugins: [
    { src: '~/plugins/datatables.js', mode: 'client' }
  ],
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://unpkg.com/primeflex@latest/primeflex.css",
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css'
        },
      ],
    },
  },
  build: {
    transpile: ['datatables.net-vue3', 'datatables.net-dt']
  },
})