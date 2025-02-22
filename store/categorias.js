export const useCategoriasStore = defineStore('categorias', {
    state: () => ({
        categorias: [],
        loading: false,
        error: null
    }),

    getters: {
        getCategorias: (state) => state.categorias,
        isLoading: (state) => state.loading,
    },

    actions: {
        async fetchCategorias() {
            this.loading = true
            try {
                const supabase = useSupabaseClient()
                const { data, error } = await supabase
                    .from('categorias')
                    .select('id, nombre')
                    .order('nombre')
                if (error) throw error

                this.categorias = data
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        }
    }
})