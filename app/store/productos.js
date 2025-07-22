import { imageOptimization } from "~/services/imageOptimization";
import { useSupabaseCache } from '~/composables/useSupabaseCache';

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
            const { getFromCache, saveToCache } = useSupabaseCache();
            const cacheKey = 'productos_data';

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                this.productos = cachedData;
                this.refreshProductosInBackground();
                return;
            }

            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();
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
                    .order('created_at', { ascending: false });

                if (error) throw error;

                this.productos = data;
                saveToCache(cacheKey, data, 15);
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching productos:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async refreshProductosInBackground() {
            try {
                const supabase = useSupabaseClient();
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
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const { saveToCache } = useSupabaseCache();
                this.productos = data;
                saveToCache('productos_data', data, 15);
            } catch (error) {
                console.error('Error en actualización en segundo plano:', error);
            }
        },

        async createProducto(productoData) {
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();

                const dataToInsert = {
                    titulo: productoData.titulo,
                    codigo: productoData.codigo,
                    descripcion: productoData.descripcion,
                    costo_dolar: productoData.costo_dolar,
                    cantidad_bulto: productoData.cantidad_bulto,
                    cantidad_minima: productoData.cantidad_minima,
                    categoria: productoData.categoria,
                    destacado: productoData.destacado,
                    mas_vendido: productoData.mas_vendido,
                    oculto: productoData.oculto,
                    promocion: productoData.promocion,
                    imagen: productoData.imagen,
                    indice_markup: productoData.indice_markup
                };

                const { data, error } = await supabase
                    .from('productos')
                    .insert(dataToInsert)
                    .select(`
                        *,
                        categoria:categorias (
                            id,
                            nombre,
                            slug
                        )
                    `)
                    .single();

                if (error) throw error;

                const { getFromCache, saveToCache } = useSupabaseCache();
                const cachedData = getFromCache('productos_data');
                if (cachedData) {
                    saveToCache('productos_data', [data, ...cachedData], 15);
                }

                this.productos = [data, ...this.productos];
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
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from('productos')
                    .update({
                        titulo: productoData.titulo,
                        codigo: productoData.codigo,
                        descripcion: productoData.descripcion,
                        costo_dolar: productoData.costo_dolar,
                        cantidad_bulto: productoData.cantidad_bulto,
                        cantidad_minima: productoData.cantidad_minima,
                        categoria: productoData.categoria,
                        destacado: productoData.destacado,
                        mas_vendido: productoData.mas_vendido,
                        oculto: productoData.oculto,
                        promocion: productoData.promocion,
                        imagen: productoData.imagen,
                        indice_markup: productoData.indice_markup
                    })
                    .eq('id', id)
                    .select(`
                        *,
                        categoria:categorias (
                            id,
                            nombre,
                            slug
                        )
                    `)
                    .single();

                if (error) throw error;

                const { getFromCache, saveToCache } = useSupabaseCache();
                const cachedData = getFromCache('productos_data');

                if (cachedData) {
                    const updatedCache = cachedData.map(item =>
                        item.id === id ? data : item
                    );
                    saveToCache('productos_data', updatedCache, 15);
                }

                this.productos = this.productos.map(item =>
                    item.id === id ? data : item
                );

                this.lastAction = 'updated';
                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error updating producto:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateIndiceMarkup(id, indiceMarkup) {
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from('productos')
                    .update({
                        indice_markup: indiceMarkup
                    })
                    .eq('id', id)
                    .select(`
                        *,
                        categoria:categorias (
                            id,
                            nombre,
                            slug
                        )
                    `)
                    .single();

                if (error) throw error;

                const { getFromCache, saveToCache } = useSupabaseCache();
                const cachedData = getFromCache('productos_data');

                if (cachedData) {
                    const updatedCache = cachedData.map(item =>
                        item.id === id ? data : item
                    );
                    saveToCache('productos_data', updatedCache, 15);
                }

                const index = this.productos.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.productos[index] = data;
                }

                return data;
            } catch (error) {
                console.error('Error updating indice_markup:', error);
                throw error;
            }
        },

        async deleteProducto(id) {
            this.loading = true;
            this.error = null;
            try {
                if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
                    throw new Error('ID de producto inválido');
                }

                const supabase = useSupabaseClient();

                const { data: producto, error: fetchError } = await supabase
                    .from('productos')
                    .select('imagen, id, titulo')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;
                if (!producto) throw new Error('Producto no encontrado');

                if (producto?.imagen) {
                    try {
                        await this.deleteImage(producto.imagen);
                    } catch (imageError) {
                        console.error('Error al eliminar la imagen:', imageError);
                    }
                } else {
                    console.log('Producto no tiene imagen para eliminar');
                }

                const { error: deleteError } = await supabase
                    .from('productos')
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;

                const { getFromCache, saveToCache } = useSupabaseCache();
                const cachedData = getFromCache('productos_data');

                if (cachedData) {
                    const updatedCache = cachedData.filter(item => item.id !== id);
                    saveToCache('productos_data', updatedCache, 15);
                }

                this.productos = this.productos.filter(item => item.id !== id);

                this.lastAction = 'deleted';
                return true;
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting producto:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async uploadImage(file, options = {}) {
            try {
                const publicUrl = await imageOptimization.uploadImage(file, options);
                return publicUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                throw error;
            }
        },

        async deleteImage(imagePath) {
            try {
                const supabase = useSupabaseClient();

                let imagePathToDelete = imagePath;

                if (imagePath.startsWith('http')) {
                    imagePathToDelete = imagePath.split('/').pop();
                }

                const { error } = await supabase.storage
                    .from('productos')
                    .remove([imagePathToDelete]);

                if (error) {
                    console.error('Error detallado al eliminar imagen:', error);
                    throw error;
                }

                return true;
            } catch (error) {
                console.error('Error en deleteImage:', error);
                throw error;
            }
        },

        setupRealtimeUpdates() {
            const { subscribeToTable } = useRealtimeSubscription();

            return subscribeToTable('productos', (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newProducto = payload.new;
                    this.productos = [newProducto, ...this.productos];

                    const { getFromCache, saveToCache } = useSupabaseCache();
                    const cachedData = getFromCache('productos_data');
                    if (cachedData) {
                        saveToCache('productos_data', [newProducto, ...cachedData], 15);
                    }
                }
                else if (payload.eventType === 'UPDATE') {
                    const updatedProducto = payload.new;
                    this.productos = this.productos.map(item =>
                        item.id === updatedProducto.id ? updatedProducto : item
                    );

                    const { getFromCache, saveToCache } = useSupabaseCache();
                    const cachedData = getFromCache('productos_data');
                    if (cachedData) {
                        const updatedCache = cachedData.map(item =>
                            item.id === updatedProducto.id ? updatedProducto : item
                        );
                        saveToCache('productos_data', updatedCache, 15);
                    }
                }
                else if (payload.eventType === 'DELETE') {
                    const deletedId = payload.old.id;
                    this.productos = this.productos.filter(item => item.id !== deletedId);

                    const { getFromCache, saveToCache } = useSupabaseCache();
                    const cachedData = getFromCache('productos_data');
                    if (cachedData) {
                        const updatedCache = cachedData.filter(item => item.id !== deletedId);
                        saveToCache('productos_data', updatedCache, 15);
                    }
                }
            });
        },

        clearLastAction() {
            this.lastAction = null;
        },

        clearError() {
            this.error = null;
        }
    }
});