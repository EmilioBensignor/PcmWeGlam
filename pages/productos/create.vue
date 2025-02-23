<template>
    <main>
        <h1>Nuevo Producto</h1>
        <section class="w-full productForm column">
            <FormProducto :categorias="categorias" @submit="handleSubmit" />
        </section>
    </main>
</template>

<script setup>
import { computed } from 'vue'
import { useProductosStore } from '~/store/productos'
import { useCategoriasStore } from '~/store/categorias'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

definePageMeta({
    middleware: 'auth'
})

const productosStore = useProductosStore()
const categoriasStore = useCategoriasStore()
const toast = useToast()

const categorias = computed(() => categoriasStore.getCategorias || [])

onMounted(async () => {
    try {
        await categoriasStore.fetchCategorias()
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las categorías',
            life: 3000
        })
    }
})

const handleSubmit = async (formData) => {
    try {
        const imageUrl = formData.imagen ?
            await productosStore.uploadImage(formData.imagen, {
                title: formData.titulo
            }) : null;

        const productoData = {
            ...formData,
            imagen: imageUrl
        };

        await productosStore.createProducto(productoData);
        await navigateTo(ROUTE_NAMES.HOME);
    } catch (error) {
        const { $toast } = useNuxtApp()
        $toast.error('Error al crear el producto')
    }
}
</script>