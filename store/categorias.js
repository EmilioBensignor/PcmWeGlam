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

                // Verificar la estructura de los datos
                console.log('Categorías cargadas:', data)
                this.categorias = data
            } catch (error) {
                console.error('Error fetching categorias:', error)
                this.error = error.message
            } finally {
                this.loading = false
            }
        }
    }
})