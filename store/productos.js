export const useProductosStore = defineStore('productos', {
    state: () => ({
        productos: [],
        loading: false,
        error: null
    }),

    getters: {
        getProductos: (state) => state.productos,
        isLoading: (state) => state.loading,
        getProductosByCategoria: (state) => (categoriaSlug) => {
            return state.productos.filter(producto => producto.categoria?.slug === categoriaSlug)
        }
    },

    actions: {
        async fetchProductos() {
            this.loading = true
            this.error = null
            try {
                const supabase = useSupabaseClient()
                const { data, error } = await supabase
                    .from('productos')
                    .select(`
                        *,
                        categoria:categorias (
                            id,
                            nombre,
                            slug
                        )
                    `)
                if (error) throw error

                this.productos = data.filter(producto => !producto.oculto)
            } catch (error) {
                this.error = error.message
                console.error('Error fetching productos:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        async createProducto(productoData) {
            this.loading = true
            this.error = null
            try {
                const supabase = useSupabaseClient()
                const { data, error } = await supabase
                    .from('productos')
                    .insert(productoData)
                    .select()
                    .single()

                if (error) throw error
                
                await this.fetchProductos()
                return data
            } catch (error) {
                this.error = error.message
                console.error('Error creating producto:', error)
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})
