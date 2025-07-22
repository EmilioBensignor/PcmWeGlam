<template>
    <main>
        <h1>Editar Producto</h1>
        <section v-if="producto" class="w-full productForm column">
            <FormProducto :initial-data="producto" :categorias="categorias" :ganancia-default="variablesStore.GANANCIA"
                :is-editing="true" @submit="handleSubmit" />
        </section>
        <p v-else>Cargando...</p>
    </main>
</template>

<script setup>
import { useProductosStore } from '~/store/productos'
import { useCategoriasStore } from '~/store/categorias'
import { useVariablesStore } from '~/store/variables'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const route = useRoute()
const productosStore = useProductosStore()
const categoriasStore = useCategoriasStore()
const variablesStore = useVariablesStore()
const { $toast } = useNuxtApp()

const producto = ref(null)
const categorias = computed(() => categoriasStore.getCategorias || [])

onMounted(async () => {
    try {
        await Promise.all([
            categoriasStore.fetchCategorias(),
            variablesStore.fetchVariables(),
            loadProducto()
        ])
    } catch (error) {
        $toast.error('Error al cargar los datos')
    }
})

const loadProducto = async () => {
    try {
        await productosStore.fetchProductos()
        producto.value = productosStore.getProductoById(route.params.id)

        if (!producto.value) {
            throw new Error('Producto no encontrado')
        }
    } catch (error) {
        $toast.error('Error al cargar el producto')
        navigateTo(ROUTE_NAMES.HOME)
    }
}

const handleSubmit = async (formData) => {
    try {
        let imageUrl = producto.value.imagen

        if (formData.imagen && formData.imagen !== producto.value.imagen) {
            if (producto.value.imagen) {
                try {
                    await productosStore.deleteImage(producto.value.imagen)
                } catch (imageError) {
                    console.warn('Error eliminando imagen anterior:', imageError)
                }
            }

            imageUrl = await productosStore.uploadImage(formData.imagen, {
                title: formData.titulo
            })
        }

        const productoData = {
            ...formData,
            imagen: imageUrl,
            indice_markup: formData.indice_markup || null
        }

        await productosStore.updateProducto(route.params.id, productoData)
        await navigateTo(ROUTE_NAMES.HOME)
    } catch (error) {
        $toast.error('Error al actualizar el producto')
    }
}
</script>