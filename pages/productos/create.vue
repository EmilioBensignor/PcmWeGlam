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
                        <label for="categoria">Categoría</label>
                        <Select inputId="categoria" id="categoria" v-model="formData.categoria" :options="categorias"
                            optionLabel="nombre" optionValue="id" placeholder="Seleccione una categoría"
                            class="w-full" />
                        <div class="error" v-if="errors.categoria">
                            <Icon name="mingcute:alert-octagon-line" style="color: var(--color-red)" />
                            <p>{{ errors.categoria }}</p>
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
                    <NuxtLink :to="ROUTE_NAMES.HOME" class="primaryButton">Cancelar</NuxtLink>
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
import { formatNumberForDB } from '~/utils/numberFormat'

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
    categoria: null,
    destacado: false,
    mas_vendido: false,
    promocion: false,
    oculto: false
})

const errors = reactive({
    titulo: null,
    descripcion: null,
    costo_dolar: null,
    categoria: null
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
    } else if (formData.titulo.length < 5) {
        errors.titulo = 'El título debe tener al menos 5 caracteres'
        isValid = false
    } else if (formData.titulo.length > 20) {
        errors.titulo = 'El título no puede exceder los 20 caracteres'
        isValid = false
    }

    if (!formData.descripcion) {
        errors.descripcion = 'La descripción es requerida'
        isValid = false
    } else if (formData.descripcion.length < 10) {
        errors.descripcion = 'La descripción debe tener al menos 10 caracteres'
        isValid = false
    } else if (formData.descripcion.length > 200) {
        errors.descripcion = 'La descripción no puede exceder los 200 caracteres'
        isValid = false
    }

    if (!formData.costo_dolar) {
        errors.costo_dolar = 'El costo es requerido'
        isValid = false
    } else if (isNaN(Number(formData.costo_dolar)) || Number(formData.costo_dolar) <= 0) {
        errors.costo_dolar = 'Ingrese un costo válido mayor a 0'
        isValid = false
    }

    if (!formData.categoria) {
        errors.categoria = 'Seleccione una categoría'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (validateForm()) {
        try {
            const formattedData = {
                ...formData,
                costo_dolar: formatNumberForDB(formData.costo_dolar)
            }

            if (formattedData.costo_dolar === null) {
                errors.costo_dolar = 'Ingrese un número válido'
                return
            }

            await productosStore.createProducto(formattedData)
            await navigateTo('/')
        } catch (error) {
            const { $toast } = useNuxtApp()
            $toast.error('Error al crear el producto')
        }
    }
}
</script>