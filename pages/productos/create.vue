<template>
    <main>
        <h1>Nuevo Producto</h1>
        <section class="w-full productForm column">
            <form class="w-full columnAlignCenter" @submit.prevent="handleSubmit">
                <div class="formFieldsContainer">
                    <FormTextField id="titulo" label="Título" v-model="formData.titulo" :error="errors.titulo" />
                    <FormTextField id="descripcion" label="Descripción" v-model="formData.descripcion"
                        :error="errors.descripcion" />
                </div>
                <div class="formFieldsContainer">
                    <FormTextField id="costo_dolar" label="Costo en dólares" type="number" step="0.01"
                        v-model="formData.costo_dolar" :error="errors.costo_dolar" />
                    <div class="formField column">
                        <label for="categoria">Categorías</label>
                        <Select id="categoria" v-model="formData.categoria_id" :options="categorias"
                            optionLabel="nombre" optionValue="id" placeholder="Seleccione una categoría"
                            class="w-full" />
                        <div class="error" v-if="errors.categoria_id">
                            <Icon name="mingcute:alert-octagon-line" style="color: var(--color-red)" />
                            <p>{{ errors.categoria_id }}</p>
                        </div>
                    </div>
                </div>
                <div class="formFieldsContainer">
                    <FormSwitch id="destacado" label="Destacado" v-model="formData.destacado" data-on="Activado"
                        data-off="Desactivado" />
                    <FormSwitch id="mas_vendido" label="Más vendido" v-model="formData.mas_vendido" data-on="Activado"
                        data-off="Desactivado" />
                    <FormSwitch id="promocion" label="En promoción" v-model="formData.promocion" data-on="Activado"
                        data-off="Desactivado" />
                </div>
                <div class="formActions wrapCenter">
                    <NuxtLink :to="ROUTE_NAMES.PRODUCTS" class="primaryButton">Cancelar</NuxtLink>
                    <button type="submit" class="primaryButton active">Crear</button>
                </div>
            </form>
        </section>
    </main>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductosStore } from '~/store/productos'
import { useCategoriasStore } from '~/store/categorias'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
import { useToast } from 'primevue/usetoast'

definePageMeta({
    middleware: 'auth'
})

const router = useRouter()
const toast = useToast()
const productosStore = useProductosStore()
const categoriasStore = useCategoriasStore()

const categorias = computed(() => {
    return categoriasStore.getCategorias || []
})

const formData = reactive({
    titulo: '',
    descripcion: '',
    costo_dolar: '',
    categoria_id: null,
    destacado: false,
    mas_vendido: false,
    promocion: false,
    oculto: false
})

const errors = reactive({
    titulo: null,
    descripcion: null,
    costo_dolar: null,
    categoria_id: null
})

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

const clearErrors = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = null
    })
}

const validateForm = () => {
    let isValid = true
    clearErrors()

    if (!formData.titulo) {
        errors.titulo = 'El título es requerido'
        isValid = false
    }

    if (!formData.descripcion) {
        errors.descripcion = 'La descripción es requerida'
        isValid = false
    }

    if (!formData.costo_dolar || formData.costo_dolar <= 0) {
        errors.costo_dolar = 'Ingrese un costo válido'
        isValid = false
    }

    if (!formData.categoria_id) {
        errors.categoria_id = 'Seleccione una categoría'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (validateForm()) {
        try {
            await productosStore.createProducto(formData)
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto creado correctamente',
                life: 3000
            })
            router.push({ name: ROUTE_NAMES.PRODUCTS })
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al crear el producto',
                life: 3000
            })
        }
    }
}
</script>