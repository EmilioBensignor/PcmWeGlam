import { useCategoriasStore } from "~/store/categorias";
import { useProductosStore } from "~/store/productos";
import { useVariablesStore } from "~/store/variables";

export default defineNuxtPlugin(async (nuxtApp) => {
    const variablesStore = useVariablesStore();
    const categoriasStore = useCategoriasStore();
    const productosStore = useProductosStore();
    const user = useSupabaseUser();

    if (user.value) {
        try {
            await Promise.all([
                variablesStore.fetchVariables(),
                categoriasStore.fetchCategorias()
            ]);

            productosStore.fetchProductos();

            const unsubscribeVariables = variablesStore.setupRealtimeUpdates();
            const unsubscribeCategorias = categoriasStore.setupRealtimeUpdates();
            const unsubscribeProductos = productosStore.setupRealtimeUpdates();

            nuxtApp.hook('app:beforeDestroy', () => {
                unsubscribeVariables && unsubscribeVariables();
                unsubscribeCategorias && unsubscribeCategorias();
                unsubscribeProductos && unsubscribeProductos();
            });
        } catch (error) {
            console.error('Error al precargar datos:', error);
        }
    }
});