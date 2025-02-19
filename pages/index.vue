<template>
    <main class="relative">
        <h1>Productos</h1>
        <NuxtLink to="#" class="primaryButton active">
            Agregar nuevo
        </NuxtLink>

        <DataTableBase v-if="productos" :headings="headings" :data="productos" :columns="tableColumns"
            @edit="handleEdit" @delete="handleDelete" />

        <DialogConfirmation v-model:visible="deleteDialog"
            :confirmation-message="`¿Estas seguro que queres eliminar ${selectedItem?.titulo}?`"
            @confirm="confirmDelete" />

        <DialogConfirmation v-model:visible="confirmationDialog"
            :confirmation-message="`Se ha eliminado correctamente ${deletedItemName}`" :show-actions="false" />
    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductosStore } from '~/store/productos'

definePageMeta({
    middleware: "auth"
})

const productosStore = useProductosStore()
const deleteDialog = ref(false)
const confirmationDialog = ref(false)
const selectedItem = ref(null)
const deletedItemName = ref('')

const headings = [
    'Títul',
    'Imagen',
    'Descripción',
    'Costo dólar',
    'Categoría',
    'Destacado',
    'Más vendido',
    'Oculto',
    'Promoción',
    'Editar',
    'Eliminar'
]

const tableColumns = [
    { data: 'titulo' },
    { data: 'imagen' },
    { data: 'descripcion' },
    { data: 'costo_dolar' },
    { data: 'categoria.nombre' },
    { data: 'destacado' },
    { data: 'mas_vendido' },
    { data: 'oculto' },
    { data: 'promocion' },
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

const handleEdit = (id) => {
    console.log('Editando producto:', id)
}

const handleDelete = (id) => {
    selectedItem.value = productos.value.find(item => item.id === id)
    deleteDialog.value = true
}

const confirmDelete = () => {
    deletedItemName.value = selectedItem.value.titulo
    console.log('Confirmada eliminación del producto:', selectedItem.value.id)
    deleteDialog.value = false
    selectedItem.value = null
    confirmationDialog.value = true
}

onMounted(async () => {
    await productosStore.fetchProductos()
})
</script>

<style scoped>
.collectionActions {
    width: 2.125rem;
    height: 2.125rem;
    position: absolute;
    top: 1.5rem;
    right: 1.25rem;
    background: var(--light-gray-color);
    border: none;
    border-radius: 10px;
    cursor: pointer;
}

@media (width >=992px) {
    .collectionActions {
        top: 2rem;
        right: 5.625rem;
    }
}
</style>