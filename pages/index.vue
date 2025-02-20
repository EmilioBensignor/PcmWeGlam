<template>
    <main>
        <section class="w-full columnAlignCenter">
            <h1>Productos</h1>
            <NuxtLink to="#" class="primaryButton active">
                Agregar nuevo
            </NuxtLink>
            <div v-if="productosStore.isLoading" class="text-center">
                <p>Cargando productos...</p>
            </div>
            <div v-else-if="productosStore.error">
                {{ productosStore.error }}
            </div>
            <!-- DataTable -->
            <DataTableBase v-else-if="formattedProducts" :headings="headings" :data="formattedProducts"
                :columns="tableColumns" :options="tableOptions" @edit="handleEdit" @delete="handleDelete" />

            <!-- Empty state -->
            <div v-else class="text-center py-8">
                <p>No hay productos disponibles</p>
            </div>
        </section>
        <!-- Dialogs -->
        <DialogConfirmation v-model:visible="deleteDialog"
            :confirmation-message="`¿Estás seguro que quieres eliminar ${selectedItem?.titulo}?`"
            @confirm="confirmDelete" />
        <DialogConfirmation v-model:visible="confirmationDialog"
            :confirmation-message="`Se ha eliminado correctamente ${deletedItemName}`" :show-actions="false" />
    </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductosStore } from '~/store/productos'
import { useVariablesStore } from '~/store/variables'

definePageMeta({
    middleware: "auth"
})

const productosStore = useProductosStore()
const variablesStore = useVariablesStore()
const deleteDialog = ref(false)
const confirmationDialog = ref(false)
const selectedItem = ref(null)
const deletedItemName = ref('')

const headings = [
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
]

// TODO - Agregar precio

const tableColumns = [
    { data: 'titulo' },
    {
        data: 'imagen',
        render: (data) => data ? `<img src="${data}" alt="Producto" class="productImg" />` : 'Sin imagen'
    },
    {
        data: 'descripcion',
        render: (data) => `<div class="descriptionColumn">${data}</div>`
    },
    {
        data: 'costo_dolar',
        render: (data) => `$${Number(data).toFixed(2)}`
    },
    {
        data: 'precio',
        render: (data) => `$${Number(data).toFixed(2)}`
    },
    { data: 'categoria.nombre' },
    {
        data: 'destacado',
        render: (data) => `<div class="columnBool">${data ? 'Si' : 'No'}</div>`
    },
    {
        data: 'mas_vendido',
        render: (data) => `<div class="columnBool">${data ? 'Si' : 'No'}</div>`
    },
    {
        data: 'oculto',
        render: (data) => `<div class="columnBool">${data ? 'Si' : 'No'}</div>`
    },
    {
        data: 'promocion',
        render: (data) => `<div class="columnBool">${data ? 'Si' : 'No'}</div>`
    },
    {
        data: null,
        render: (data, type, row) => `
            <div class="columnActions">
                <button class="edit" data-id="${row.id}">
                    <span></span>
                </button>
            </div>
        `
    },
    {
        data: null,
        render: (data, type, row) => `
            <div class="columnActions">
                <button class="delete" data-id="${row.id}">
                    <span></span>
                </button>
            </div>
        `
    }
]

const tableOptions = {
    pageLength: 10,
    order: [[0, 'asc']],
    responsive: true,
    language: {
        search: "_INPUT_",
        searchPlaceholder: "Buscar...",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
        },
        zeroRecords: "No se encontraron resultados",
        emptyTable: "No hay datos disponibles"
    }
}

const productos = computed(() => productosStore.getProductos)
const formattedProducts = computed(() => {
    if (!productos.value || !variablesStore.variables.length) return null

    return productos.value.map(product => ({
        ...product,
        imagen: product.imagen || null,
        precio: product.costo_dolar * variablesStore.DOLAR_WG * variablesStore.GANANCIA
    }))
})

const handleEdit = (id) => {
    navigateTo(`/productos/editar/${id}`)
}

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
            // Aquí iría la lógica de eliminación
            deleteDialog.value = false
            confirmationDialog.value = true
            await productosStore.fetchProductos() // Recargar datos
        } catch (error) {
            console.error('Error al eliminar producto:', error)
        }
    }
    selectedItem.value = null
}

onMounted(async () => {
    // Cargar variables primero
    await variablesStore.fetchVariables()
    await productosStore.fetchProductos()
})
</script>

<style>
.productImg {
    width: 5rem;
}
</style>