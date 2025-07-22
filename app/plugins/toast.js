import { useToast } from 'primevue/usetoast'
// import ToastService from 'primevue/toastservice' // <- ya no necesitas esto

export default defineNuxtPlugin((nuxtApp) => {
    // nuxtApp.vueApp.use(ToastService) // <- quita esta línea

    const toast = useToast()

    return {
        provide: {
            toast: {
                success: (message, title = 'Éxito') => {
                    toast.add({
                        severity: 'success',
                        summary: title,
                        detail: message,
                        life: 4000
                    })
                },
                // resto del código...
            }
        }
    }
})