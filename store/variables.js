import { useSupabaseCache } from '~/composables/useSupabaseCache';

export const useVariablesStore = defineStore('variables', {
    state: () => ({
        variables: [],
        loading: false,
        error: null
    }),

    getters: {
        getVariables: (state) => state.variables,
        isLoading: (state) => state.loading,
        DOLAR_WG: (state) => {
            const dolar = state.variables.find(v => v.nombre === 'DOLAR_WG');
            return dolar ? parseFloat(dolar.valor) : 0;
        },
        GANANCIA: (state) => {
            const ganancia = state.variables.find(v => v.nombre === 'GANANCIA');
            return ganancia ? parseFloat(ganancia.valor) : 0;
        },
        calculatePrice: (state) => {
            return (costoDolar) => {
                return costoDolar * this.DOLAR_WG * this.GANANCIA;
            };
        }
    },

    actions: {
        async fetchVariables() {
            const { getFromCache, saveToCache } = useSupabaseCache();
            const cacheKey = 'variables_data';

            // Intentar obtener datos desde caché
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                this.variables = cachedData;
                // El dólar y ganancia son críticos, refrescar en segundo plano
                this.refreshVariablesInBackground();
                return;
            }

            this.loading = true;
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from('variables')
                    .select('*');

                if (error) throw error;

                this.variables = data;
                // Guardar en caché por 30 minutos
                saveToCache(cacheKey, data, 30);
            } catch (error) {
                this.error = error.message;
                console.error('Error al cargar variables:', error);
            } finally {
                this.loading = false;
            }
        },

        // Método para actualizar en segundo plano
        async refreshVariablesInBackground() {
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from('variables')
                    .select('*');

                if (error) throw error;

                const { saveToCache } = useSupabaseCache();
                this.variables = data;
                saveToCache('variables_data', data, 30);
            } catch (error) {
                console.error('Error en actualización en segundo plano:', error);
            }
        },

        async updateVariable(id, valor) {
            this.loading = true;
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from('variables')
                    .update({ valor })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                // Actualizar el estado local y la caché
                this.variables = this.variables.map(v =>
                    v.id === id ? data : v
                );

                // Actualizar caché
                const { getFromCache, saveToCache } = useSupabaseCache();
                const cachedData = getFromCache('variables_data');
                if (cachedData) {
                    saveToCache('variables_data',
                        cachedData.map(v => v.id === id ? data : v),
                        30
                    );
                }

                return data;
            } catch (error) {
                this.error = error.message;
                console.error('Error actualizando variable:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        setupRealtimeUpdates() {
            const { subscribeToTable } = useRealtimeSubscription();

            return subscribeToTable('variables', (payload) => {
                // Manejar actualizaciones en tiempo real
                if (payload.eventType === 'UPDATE') {
                    const updatedVariable = payload.new;
                    this.variables = this.variables.map(v =>
                        v.id === updatedVariable.id ? updatedVariable : v
                    );

                    // Actualizar caché
                    const { getFromCache, saveToCache } = useSupabaseCache();
                    const cachedData = getFromCache('variables_data');
                    if (cachedData) {
                        saveToCache('variables_data',
                            cachedData.map(v => v.id === updatedVariable.id ? updatedVariable : v),
                            30
                        );
                    }
                }
            });
        }
    }
});