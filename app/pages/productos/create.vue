<template>
    <main>
        <h1>Nuevo Producto</h1>
        <section class="w-full productForm column">
            <FormProducto :categorias="categorias" :initialData="initialFormData"
                :ganancia-default="variablesStore.GANANCIA" @submit="handleSubmit" />
        </section>
    </main>
</template>

<script setup>
import { computed } from 'vue'
import { useProductosStore } from '~/store/productos'
import { useCategoriasStore } from '~/store/categorias'
import { useVariablesStore } from '~/store/variables'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const productosStore = useProductosStore()
const categoriasStore = useCategoriasStore()
const variablesStore = useVariablesStore()
const { $toast } = useNuxtApp()

const initialFormData = {
    titulo: '',
    descripcion: '',
    codigo: '',
    costo_dolar: '',
    cantidad_bulto: '',
    cantidad_minima: '',
    categoria: null,
    destacado: false,
    mas_vendido: false,
    oculto: false,
    promocion: '',
    imagen: null,
    indice_markup: null
}

const categorias = computed(() => categoriasStore.getCategorias || [])

onMounted(async () => {
    try {
        await Promise.all([
            categoriasStore.fetchCategorias(),
            variablesStore.fetchVariables()
        ])
    } catch (error) {
        $toast.error('Error al cargar los datos')
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
            imagen: imageUrl,
            indice_markup: formData.indice_markup || null
        };

        await productosStore.createProducto(productoData);
        await navigateTo(ROUTE_NAMES.HOME);
    } catch (error) {
        $toast.error('Error al crear el producto')
    }
}
</script>