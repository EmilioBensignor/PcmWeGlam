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
import { ref, reactive } from 'vue'
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

const currentImageUrl = ref(props.initialData.imagen || null)
const newImage = ref(null)

const formData = reactive({
    titulo: props.initialData.titulo || '',
    descripcion: props.initialData.descripcion || '',
    costo_dolar: String(props.initialData.costo_dolar || ''),
    categoria: props.initialData.categoria?.id || null,
    destacado: Boolean(props.initialData.destacado),
    mas_vendido: Boolean(props.initialData.mas_vendido),
    oculto: Boolean(props.initialData.oculto),
    promocion: props.initialData.promocion || '',
    imagen: props.initialData.imagen || null
})

const errors = reactive({
    titulo: null,
    descripcion: null,
    costo_dolar: null,
    categoria: null,
    imagen: null
})

const switchFields = [
    { id: 'destacado', label: 'Destacado' },
    { id: 'mas_vendido', label: 'Más vendido' },
    { id: 'oculto', label: 'Oculto' }
]

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
            imagen: newImage.value || currentImageUrl.value
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