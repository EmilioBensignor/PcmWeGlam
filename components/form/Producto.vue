<!-- components/ProductoForm.vue -->
<template>
    <form class="w-full columnAlignCenter" @submit.prevent="handleSubmit">
        <div class="formFieldsContainer">
            <FormTextField id="titulo" label="Título*" v-model="formData.titulo" :error="errors.titulo"
                placeholder="Tender" />
            <div class="formField column">
                <label>Imagen actual</label>
                <img v-if="currentImageUrl" :src="currentImageUrl" alt="Imagen actual" class="preview-image" />
                <FormFileField id="imagen" label="Nueva imagen" v-model="newImage" :error="errors.imagen"
                    accept="image/*" placeholder="Seleccionar imagen" :maxFileSize="5000000" :required="!isEditing" />
            </div>
        </div>
        <div class="formFieldsContainer">
            <FormTextField id="descripcion" label="Descripción*" v-model="formData.descripcion"
                placeholder="Tender plegable de 3 plazas" :error="errors.descripcion" />
            <FormTextField id="costo_dolar" label="Costo en dólares*" type="number" step="0.01"
                v-model="formData.costo_dolar" :error="errors.costo_dolar" placeholder="$5.00" />
        </div>
        <div class="formFieldsContainer">
            <div class="formField column">
                <label for="categoria">Categoría*</label>
                <Select inputId="categoria" id="categoria" v-model="formData.categoria" :options="categorias"
                    optionLabel="nombre" optionValue="id" placeholder="Seleccione una categoría" class="w-full" />
                <div class="error" v-if="errors.categoria">
                    <Icon name="mingcute:alert-octagon-line" style="color: var(--color-red)" />
                    <p>{{ errors.categoria }}</p>
                </div>
            </div>
            <FormTextField id="promocion" label="Promoción" placeholder="30% OFF" type="text"
                v-model="formData.promocion" :error="errors.promocion" />
        </div>
        <div class="formFieldsContainer switchersContainer">
            <FormSwitch v-for="field in switchFields" :key="field.id" :id="field.id" :label="field.label"
                v-model="formData[field.id]" data-on="Activado" data-off="Desactivado" />
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
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
import { useProductoValidation } from '~/composables/useProductoValidation'

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
    }
})

const emit = defineEmits(['submit'])

// Manejar la imagen actual y nueva por separado
const currentImageUrl = ref(props.initialData.imagen || null)
const newImage = ref(null)

// Convertir datos iniciales al formato correcto
const initialFormData = {
    titulo: props.initialData.titulo || '',
    descripcion: props.initialData.descripcion || '',
    costo_dolar: String(props.initialData.costo_dolar || ''),
    categoria: props.initialData.categoria?.id || null,
    destacado: Boolean(props.initialData.destacado),
    mas_vendido: Boolean(props.initialData.mas_vendido),
    oculto: Boolean(props.initialData.oculto),
    promocion: props.initialData.promocion || '',
    imagen: null // La imagen se maneja por separado
}

// Reactive form data initialized with props
const formData = reactive({ ...initialFormData })

// Validation errors
const errors = reactive({
    titulo: null,
    descripcion: null,
    costo_dolar: null,
    categoria: null,
    imagen: null
})

// Switch fields configuration
const switchFields = [
    { id: 'destacado', label: 'Destacado' },
    { id: 'mas_vendido', label: 'Más vendido' },
    { id: 'oculto', label: 'Oculto' }
]

// Validation logic from composable
const { validateForm, clearErrors } = useProductoValidation(formData, errors, props.isEditing)

const handleSubmit = async () => {
    if (validateForm()) {
        // Preparar datos para enviar
        const submitData = {
            ...formData,
            costo_dolar: Number(formData.costo_dolar),
            imagen: newImage.value || currentImageUrl.value // Usar la nueva imagen si existe, sino mantener la URL actual
        }

        emit('submit', submitData)
    }
}
</script>

<style scoped>
.switchersContainer {
    flex-direction: row;
    flex-wrap: wrap;
}

.switchersContainer>div {
    width: max-content;
}

.preview-image {
    max-width: 200px;
    max-height: 200px;
    object-fit: contain;
    margin-bottom: 1rem;
}

@media (width >=992px) {
    .switchersContainer {
        justify-content: flex-start;
        gap: 3rem;
    }

    .switchersContainer>div {
        width: max-content !important;
    }
}
</style>