<template>
    <main class="relative max-w-screen">
        <h1>Productos</h1>
        <NuxtLink to="#" class="primaryButton active">
            Agregar nuevo
        </NuxtLink>
        <div v-if="productosStore.isLoading" class="text-center">
            <p>Cargando productos...</p>
        </div>
        <DataTableBase v-else-if="formattedProducts" :headings="headings" :data="formattedProducts"
            :columns="tableColumns" @edit="handleEdit" @delete="handleDelete" />
        <DialogConfirmation v-model:visible="deleteDialog"
            :confirmation-message="`¿Estás seguro que quieres eliminar ${selectedItem?.titulo}?`"
            @confirm="confirmDelete" />
        <DialogConfirmation v-model:visible="confirmationDialog"
            :confirmation-message="`Se ha eliminado correctamente ${deletedItemName}`" :show-actions="false" />
    </main>
</template>

<script>
import { useProductosStore } from '~/store/productos'
import { useVariablesStore } from '~/store/variables'

export default {
    middleware: 'auth',

    data() {
        return {
            productosStore: useProductosStore(),
            variablesStore: useVariablesStore(),
            deleteDialog: false,
            confirmationDialog: false,
            selectedItem: null,
            deletedItemName: '',
            headings: [
                'Título',
                'Imagen',
                'Descripción',
                'Costo dólar',
                'Precio',
                'Categoría',
                'Destacado',
                'Más vendido',
                'Oculto',
                'Promoción',
                'Editar',
                'Eliminar'
            ],
            tableColumns: [
                {
                    data: 'titulo',
                },
                {
                    data: 'imagen',
                    render: (data) => data ? `<img src="${data}" alt="Producto" class="productImg" />` : 'Sin imagen'
                },
                {
                    data: 'descripcion',
                },
                {
                    data: 'costo_dolar',
                    render: (data) => `$${Number(data).toFixed(2)}`
                },
                {
                    data: 'precio',
                    render: (data) => `$${Number(data).toFixed(2)}`
                },
                {
                    data: 'categoria.nombre',
                },
                {
                    data: 'destacado',
                    render: (data) => data ? 'Si' : 'No'
                },
                {
                    data: 'mas_vendido',
                    render: (data) => data ? 'Si' : 'No'
                },
                {
                    data: 'oculto',
                    render: (data) => data ? 'Si' : 'No'
                },
                {
                    data: 'promocion',
                    render: (data) => data ? 'Si' : 'No'
                },
                {
                    data: null,
                    render: (data, type, row) => `
                        <button class="edit" data-id="${row.id}">
                            <span></span>
                        </button>
                    `
                },
                {
                    data: null,
                    render: (data, type, row) => `
                        <button class="delete" data-id="${row.id}">
                            <span></span>
                        </button>
                    `
                }
            ]
        }
    },

    computed: {
        productos() {
            return this.productosStore.getProductos
        },

        formattedProducts() {
            if (!this.productos || !this.variablesStore.variables.length) return null

            return this.productos.map(product => ({
                ...product,
                imagen: product.imagen || null,
                precio: product.costo_dolar * this.variablesStore.DOLAR_WG * this.variablesStore.GANANCIA
            }))
        }
    },

    methods: {
        handleEdit(id) {
            this.$router.push(`/productos/editar/${id}`)
        },

        handleDelete(id) {
            this.selectedItem = this.productos.find(item => item.id === id)
            if (this.selectedItem) {
                this.deleteDialog = true
            }
        },

        async confirmDelete() {
            if (this.selectedItem) {
                try {
                    this.deletedItemName = this.selectedItem.titulo
                    // Aquí iría la lógica de eliminación
                    this.deleteDialog = false
                    this.confirmationDialog = true
                    await this.productosStore.fetchProductos() // Recargar datos
                } catch (error) {
                    console.error('Error al eliminar producto:', error)
                }
            }
            this.selectedItem = null
        }
    },

    async mounted() {
        // Cargar variables primero
        await this.variablesStore.fetchVariables()
        await this.productosStore.fetchProductos()
    }
}
</script>