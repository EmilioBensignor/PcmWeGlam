<template>
    <main>
        <h1>Editar Producto</h1>
        <section v-if="producto" class="w-full productForm column">
            <FormProducto :initial-data="producto" :categorias="categorias" :is-editing="true" @submit="handleSubmit" />
        </section>
        <p v-else>Cargando...</p>
    </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProductosStore } from '~/store/productos'
import { useCategoriasStore } from '~/store/categorias'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

definePageMeta({
    middleware: 'auth'
})

const route = useRoute()
const productosStore = useProductosStore()
const categoriasStore = useCategoriasStore()
const toast = useToast()

const producto = ref(null)
const categorias = computed(() => categoriasStore.getCategorias || [])

onMounted(async () => {
    try {
        await Promise.all([
            categoriasStore.fetchCategorias(),
            loadProducto()
        ])
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los datos',
            life: 3000
        })
    }
})

const loadProducto = async () => {
    try {
        producto.value = await productosStore.getProductoById(route.params.id)
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el producto',
            life: 3000
        })
        navigateTo(ROUTE_NAMES.HOME)
    }
}

const handleSubmit = async (formData) => {
    try {
        let imageUrl = producto.value.imagen

        if (formData.imagen && formData.imagen !== producto.value.imagen) {
            imageUrl = await productosStore.uploadImage(formData.imagen, {
                title: formData.titulo
            })
        }

        const productoData = {
            ...formData,
            imagen: imageUrl
        }

        await productosStore.updateProducto(route.params.id, productoData)
        await navigateTo(ROUTE_NAMES.HOME)
    } catch (error) {
        const { $toast } = useNuxtApp()
        $toast.error('Error al actualizar el producto')
    }
}
</script>