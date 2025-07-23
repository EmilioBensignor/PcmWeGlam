<template>
    <form class="w-full columnAlignCenter" @submit.prevent="handleSubmit">
        <div class="formFieldsContainer">
            <FormTextField id="titulo" label="Título*" v-model="formData.titulo" :error="errors.titulo"
                placeholder="Tender" />
            <div class="formField column">
                <FormFileField id="imagen" :label="isEditing ? 'Nueva imagen' : 'Imagen*'" v-model="newImage"
                    :error="errors.imagen" accept="image/*" placeholder="Seleccionar imagen" :maxFileSize="5000000"
                    :required="!isEditing" />
                <div v-if="isEditing && currentImageUrl && !newImage" class="imagePreview">
                    <img :src="currentImageUrl" alt="Imagen actual" class="preview-image" />
                    <button type="button" class="primaryButton redButton" @click="removeImage">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>

        <div class="formFieldsContainer">
            <FormTextField id="codigo" label="Código*" v-model="formData.codigo" placeholder="EZ3000"
                :error="errors.codigo" />
            <FormTextField id="descripcion" label="Descripción*" v-model="formData.descripcion"
                placeholder="Tender plegable de 3 plazas" :error="errors.descripcion" />
        </div>

        <div class="formFieldsContainer">
            <FormTextField id="costo_dolar" label="Costo en dólares*" type="number" step="0.01"
                v-model="formData.costo_dolar" :error="errors.costo_dolar" placeholder="$5.00" />
            <FormTextField id="indice_markup" label="Índice Markup" type="number" step="0.01"
                v-model="formData.indice_markup" :error="errors.indice_markup" placeholder="1.4" />
        </div>

        <div class="formFieldsContainer">
            <FormTextField id="cantidad_bulto" label="Cantidad por bulto" v-model="formData.cantidad_bulto"
                placeholder="6" :error="errors.cantidad_bulto" />
            <FormTextField id="cantidad_minima" label="Cantidad mínima" type="number" v-model="formData.cantidad_minima"
                :error="errors.cantidad_minima" placeholder="1" />
        </div>

        <div class="formFieldsContainer">
            <div class="formField column">
                <p for="categoria">Categoría*</p>
                <Select inputId="categoria" id="categoria" v-model="formData.categoria" :options="categorias"
                    optionLabel="nombre" optionValue="id" placeholder="Seleccione una categoría" class="w-full" />
                <div class="error" v-if="errors.categoria">
                    <Icon name="tabler:alert-octagon" style="color: var(--color-red)" />
                    <p>{{ errors.categoria }}</p>
                </div>
            </div>
            <FormTextField id="promocion" label="Promoción" placeholder="30" type="number" v-model="formData.promocion"
                :error="errors.promocion" />
        </div>

        <div class="formFieldsContainer switchersContainer">
            <FormSwitch v-for="field in switchFields" :key="field.id" :id="field.id" :label="field.label"
                v-model="formData[field.id]" data-on="Activado" data-off="Desactivado" />
        </div>

        <div v-if="pricePreview" class="price-preview">
            <p>Vista previa de precios:</p>
            <div class="price-container">
                <div>
                    <p><strong>Precio sin IVA:</strong> {{ formatPrice(pricePreview.precioSinIva) }}</p>
                    <p><strong>Precio con IVA:</strong> {{ formatPrice(pricePreview.precioConIva) }}</p>
                </div>
                <div v-if="pricePreview.tieneDescuento">
                    <p style="color: var(--color-red);">{{ formData.promocion }}% descuento sin IVA: {{ formatPrice(pricePreview.precioSinIvaConDescuento)
                        }}</p>
                    <p style="color: var(--color-red);">{{ formData.promocion }}% descuento con IVA: {{ formatPrice(pricePreview.precioConIvaConDescuento)
                        }}</p>
                </div>
            </div>
        </div>

        <div class="formActions wrapCenter">
            <NuxtLink :to="ROUTE_NAMES.HOME" class="primaryButton">Cancelar</NuxtLink>
            <button type="submit" class="primaryButton active">
                {{ isEditing ? 'Actualizar' : 'Crear' }}
            </button>
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useVariablesStore } from '~/store/variables'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
import { useProductoValidation } from '~/composables/useProductoValidation'

const variablesStore = useVariablesStore()

const props = defineProps({
    initialData: {
        type: Object,
        required: true
    },
    isEditing: {
        type: Boolean,
        default: false
    },
    categorias: {
        type: Array,
        required: true
    },
    gananciaDefault: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['submit'])

const currentImageUrl = ref(props.initialData.imagen || null)
const newImage = ref(null)

const formData = reactive({
    titulo: props.initialData.titulo || '',
    codigo: props.initialData.codigo || '',
    descripcion: props.initialData.descripcion || '',
    costo_dolar: String(props.initialData.costo_dolar || ''),
    indice_markup: props.initialData.indice_markup ? String(props.initialData.indice_markup) : '',
    cantidad_bulto: props.initialData.cantidad_bulto ? String(props.initialData.cantidad_bulto) : '',
    cantidad_minima: props.initialData.cantidad_minima ? String(props.initialData.cantidad_minima) : '',
    categoria: props.initialData.categoria?.id || null,
    destacado: Boolean(props.initialData.destacado),
    mas_vendido: Boolean(props.initialData.mas_vendido),
    oculto: Boolean(props.initialData.oculto),
    promocion: props.initialData.promocion ? String(props.initialData.promocion) : '',
    imagen: props.initialData.imagen || null
})

const errors = reactive({
    titulo: null,
    codigo: null,
    descripcion: null,
    costo_dolar: null,
    indice_markup: null,
    cantidad_bulto: null,
    cantidad_minima: null,
    categoria: null,
    promocion: null,
    imagen: null
})

const switchFields = [
    { id: 'destacado', label: 'Destacado' },
    { id: 'mas_vendido', label: 'Más vendido' },
    { id: 'oculto', label: 'Oculto' }
]

const pricePreview = computed(() => {
    if (!formData.costo_dolar || !variablesStore.DOLAR_WG) {
        return null
    }

    const costoDolar = Number(formData.costo_dolar)
    if (isNaN(costoDolar) || costoDolar <= 0) {
        return null
    }

    const markup = formData.indice_markup ? Number(formData.indice_markup) : props.gananciaDefault
    const precioSinIva = costoDolar * variablesStore.DOLAR_WG * markup
    const precioConIva = precioSinIva * 1.21

    let precioSinIvaConDescuento = precioSinIva
    let precioConIvaConDescuento = precioConIva

    if (formData.promocion && Number(formData.promocion) > 0) {
        const descuento = Number(formData.promocion) / 100
        precioSinIvaConDescuento = precioSinIva * (1 - descuento)
        precioConIvaConDescuento = precioSinIvaConDescuento * 1.21
    }

    return {
        precioSinIva,
        precioConIva,
        precioSinIvaConDescuento,
        precioConIvaConDescuento,
        tieneDescuento: formData.promocion && Number(formData.promocion) > 0
    }
})

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}

const { validateForm, clearErrors } = useProductoValidation(formData, errors, props.isEditing)

const removeImage = () => {
    newImage.value = null
    currentImageUrl.value = null
    formData.imagen = null
}

const handleSubmit = async () => {
    formData.imagen = newImage.value || currentImageUrl.value

    if (validateForm()) {
        const submitData = {
            ...formData,
            costo_dolar: Number(formData.costo_dolar),
            indice_markup: formData.indice_markup ? Number(formData.indice_markup) : null,
            cantidad_bulto: formData.cantidad_bulto ? Number(formData.cantidad_bulto) : null,
            cantidad_minima: formData.cantidad_minima ? Number(formData.cantidad_minima) : null,
            promocion: formData.promocion ? Number(formData.promocion) : null,
            imagen: newImage.value || currentImageUrl.value
        }
        emit('submit', submitData)
    }
}
</script>

<style scoped>
.switchersContainer {
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
}

.switchersContainer>div {
    width: max-content;
}

.price-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 16px;
    margin: 20px 0;
}

.price-container {
    display: flex;
    gap: 1rem;
}

.price-container p {
    margin: 6px 0;
}

@media (width >=992px) {
    .switchersContainer>div {
        width: max-content !important;
    }
}
</style>