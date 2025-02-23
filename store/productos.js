import { imageOptimization } from "~/services/imageOptimization"

export const useProductosStore = defineStore('productos', {
    state: () => ({
        productos: [],
        loading: false,
        error: null,
        lastAction: null
    }),

    getters: {
        getProductos: (state) => state.productos,
        isLoading: (state) => state.loading,
        getProductosByCategoria: (state) => (categoriaSlug) => {
            return state.productos.filter(producto => producto.categoria?.slug === categoriaSlug)
        },
        getProductoById: (state) => (id) => {
            return state.productos.find(producto => producto.id === id)
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
                    .order('created_at', { ascending: false })

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
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();

                const dataToInsert = {
                    titulo: productoData.titulo,
                    descripcion: productoData.descripcion,
                    costo_dolar: productoData.costo_dolar,
                    categoria: productoData.categoria,
                    destacado: productoData.destacado,
                    mas_vendido: productoData.mas_vendido,
                    oculto: productoData.oculto,
                    promocion: productoData.promocion,
                    imagen: productoData.imagen
                };

                const { data, error } = await supabase
                    .from('productos')
                    .insert(dataToInsert)
                    .select()
                    .single();

                if (error) throw error;

                await this.fetchProductos();
                this.lastAction = 'created';
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating producto:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateProducto(id, productoData) {
            this.loading = true
            this.error = null
            try {
                const supabase = useSupabaseClient()
                const { data, error } = await supabase
                    .from('productos')
                    .update(productoData)
                    .eq('id', id)
                    .select()
                    .single()

                if (error) throw error

                await this.fetchProductos()
                this.lastAction = 'updated'
                return data
            } catch (error) {
                this.error = error.message
                console.error('Error updating producto:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteProducto(id) {
            this.loading = true
            this.error = null
            try {
                const supabase = useSupabaseClient()
                const { error } = await supabase
                    .from('productos')
                    .delete()
                    .eq('id', id)

                if (error) throw error

                await this.fetchProductos()
                this.lastAction = 'deleted'
            } catch (error) {
                this.error = error.message
                console.error('Error deleting producto:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async uploadImage(file, options = {}) {
            try {
                const publicUrl = await imageOptimization.uploadImage(file, options)
                return publicUrl
            } catch (error) {
                console.error('Error uploading image:', error)
                throw error
            }
        },

        async deleteImage(imagePath) {
            try {
                const supabase = useSupabaseClient()
                const { error } = await supabase.storage
                    .from('productos')
                    .remove([imagePath])

                if (error) throw error

                return true
            } catch (error) {
                console.error('Error deleting image:', error)
                throw error
            }
        },

        async deleteProducto(id) {
            this.loading = true
            this.error = null
            try {
                const supabase = useSupabaseClient()

                const { data: producto } = await supabase
                    .from('productos')
                    .select('imagen')
                    .eq('id', id)
                    .single()

                const { error: deleteError } = await supabase
                    .from('productos')
                    .delete()
                    .eq('id', id)

                if (deleteError) throw deleteError

                if (producto?.imagen) {
                    try {
                        await this.deleteImage(producto.imagen)
                    } catch (imageError) {
                        console.error('Error al eliminar la imagen:', imageError)
                    }
                }

                await this.fetchProductos()
                this.lastAction = 'deleted'
            } catch (error) {
                this.error = error.message
                console.error('Error deleting producto:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        clearLastAction() {
            this.lastAction = null
        },

        clearError() {
            this.error = null
        }
    }
})