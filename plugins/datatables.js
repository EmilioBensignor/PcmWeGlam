import jQuery from 'jquery'
import 'datatables.net'

export default defineNuxtPlugin((nuxtApp) => {
    if (process.client) {
        window.$ = window.jQuery = jQuery
    }
})