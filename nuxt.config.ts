// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],

  // Módulos
  modules: [
    "@primevue/nuxt-module",
    '@nuxt/image',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxtjs/supabase'
  ],

  // Configuración de Supabase
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/callback',
      exclude: [
        '/login',
        '/register',
        '/forgot-password',
        '/forgot-password-confirmation',
        '/reset-password',
      ]
    },
    // Optimización de Supabase: reducir la tasa de sondeo para sesiones (menos peticiones Auth)
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    },
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  },

  // Configuración de íconos
  icon: {
    size: '1rem',
    class: 'tablerIcon',
    serverBundle: {
      collections: ['tabler'],
    }
  },

  // PrimeVue - Sólo cargar los componentes necesarios
  primevue: {
    components: {
      include: ['Toast', 'Button', 'Dialog', 'InputText', 'Password', 'ProgressSpinner', 'Drawer']
    },
    options: {
      ripple: false,
      unstyled: false
    }
  },
  plugins: [
    { src: '~/plugins/datatables.js', mode: 'client' },
    { src: '~/plugins/preload-data.js', mode: 'client' }
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
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
    },
  },

  vite: {
    optimizeDeps: {
      include: ['primeflex', 'pinia']
    },
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
    },
    server: {
      fs: {
        strict: false
      }
    }
  },

  // Configuración de build
  build: {
    transpile: ['datatables.net-vue3', 'datatables.net-dt']
  },

  // Optimizaciones de rendimiento
  experimental: {
    payloadExtraction: true,
    crossOriginPrefetch: true,
    viewTransition: true,
    componentIslands: true
  },
});