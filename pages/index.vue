<template>
    <main class="relative max-w-screen">
        <section class="w-full columnAlignCenter">
            <h1>Productos</h1>
            <NuxtLink :to="ROUTE_NAMES.PRODUCT_CREATE" class="primaryButton active">
                Agregar nuevo
            </NuxtLink>
            <div v-if="productosStore.isLoading" class="text-center">
                <p>Cargando productos...</p>
            </div>
            <DataTableBase v-else-if="formattedProducts" :headings="headings" :data="formattedProducts"
                :columns="tableColumns" @edit="handleEdit" @delete="handleDelete" />
        </section>
        <DialogConfirmation v-model:visible="deleteDialog"
            :confirmation-message="`¿Estás seguro que quieres eliminar ${selectedItem?.titulo}?`"
            @confirm="confirmDelete" />
    </main>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, render } from 'vue'
import { useProductosStore } from '~/store/productos'
import { useVariablesStore } from '~/store/variables'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const productosStore = useProductosStore()
const variablesStore = useVariablesStore()

const deleteDialog = ref(false)
const selectedItem = ref(null)
const deletedItemName = ref('')

const headings = [
    'Título',
    'Imagen',
    'Descripción',
    'Código',
    'Costo dólar',
    'Precio',
    'Cantidad por bulto',
    'Cantidad mín.',
    'Categoría',
    'Destacado',
    'Más vendido',
    'Oculto',
    'Promoción',
    'Editar',
    'Eliminar'
]

const tableColumns = [
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
        data: 'codigo',
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
        data: 'cantidad_bulto',
    },
    {
        data: 'cantidad_minima',
    },
    {
        data: 'categoria',
        render: (data) => data?.nombre || 'Sin categoría'
    },
    {
        data: 'destacado',
        render: (data) => data ? '✔️' : ''
    },
    {
        data: 'mas_vendido',
        render: (data) => data ? '✔️' : ''
    },
    {
        data: 'oculto',
        render: (data) => data ? '✔️' : ''
    },
    {
        data: 'promocion',
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

const productos = computed(() => productosStore.getProductos)

const formattedProducts = computed(() => {
    if (!productos.value || !variablesStore.variables.length) return null

    return productos.value.map(product => ({
        ...product,
        imagen: product.imagen || null,
        precio: product.costo_dolar * variablesStore.DOLAR_WG * variablesStore.GANANCIA * 1.21,
    }))
})

const handleEdit = (id) => {
    navigateTo(`${ROUTE_NAMES.PRODUCT_EDIT}/${id}`)
}

const { $toast } = useNuxtApp()

const handleDelete = (id) => {
    selectedItem.value = productos.value.find(item => item.id === id)
    if (selectedItem.value) {
        deleteDialog.value = true
    }
}

const confirmDelete = async () => {
    if (selectedItem.value) {
        try {
            deletedItemName.value = selectedItem.value.titulo

            await productosStore.deleteProducto(selectedItem.value.id)

            deleteDialog.value = false
            $toast.success(`El producto ${deletedItemName.value} ha sido eliminado`)

            selectedItem.value = null
            deletedItemName.value = ''

        } catch (error) {
            console.error('Error al eliminar producto:', error)
            $toast.error('Error al eliminar el producto')
        }
    }
}

onMounted(async () => {
    await Promise.all([
        variablesStore.fetchVariables(),
        productosStore.fetchProductos()
    ])

    if (productosStore.lastAction === 'created') {
        $toast.success('Producto creado correctamente')
        productosStore.clearLastAction()
    }
})
</script>