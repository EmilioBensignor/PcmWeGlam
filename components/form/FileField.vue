<template>
    <div class="w-full formField column">
        <p>{{ label }}</p>

        <div v-if="existingFileUrl && !modelValue" class="fileContainer rowCenter">
            <img :src="existingFileUrl" alt="Existing file" />
            <button type="button" class="primaryButton" @click="showFileUpload = true" v-if="!showFileUpload">
                Cambiar imagen
            </button>
        </div>
        <FileUpload v-if="!existingFileUrl || showFileUpload || modelValue" :id="id" mode="basic" :accept="accept"
            :maxFileSize="maxFileSize" :chooseLabel="placeholder" @select="onSelect" />

        <div v-if="modelValue && previewUrl" class="fileContainer rowCenter">
            <img :src="previewUrl" alt="Selected file preview" />
            <button type="button" class="primaryButton redButton" @click="removeFile">
                Eliminar
            </button>
        </div>

        <div class="error" v-if="error">
            <Icon name="tabler:alert-octagon" style="color: var(--color-red)" />
            <p>{{ error }}</p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        error: {
            type: String,
            default: null
        },
        modelValue: {
            type: [File, null],
            default: null
        },
        existingFileUrl: {
            type: String,
            default: null
        },
        accept: {
            type: String,
            default: 'image/*'
        },
        maxFileSize: {
            type: Number,
            default: 1000000
        },
        placeholder: {
            type: String,
            default: 'Seleccionar archivo'
        }
    },
    data() {
        return {
            showFileUpload: false,
            previewUrl: null
        }
    },
    watch: {
        modelValue(newFile) {
            if (newFile) {
                this.createPreviewUrl(newFile);
            } else {
                this.previewUrl = null;
            }
        }
    },
    emits: ['update:modelValue', 'select'],
    methods: {
        onSelect(event) {
            const file = event.files[0];
            this.$emit('update:modelValue', file);
            this.$emit('select', event);
        },
        removeFile() {
            this.$emit('update:modelValue', null);
            this.previewUrl = null;
            this.showFileUpload = false;
        },
        createPreviewUrl(file) {
            if (file) {
                this.previewUrl = URL.createObjectURL(file);
            }
        }
    },
    beforeUnmount() {
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
        }
    }
}
</script>

<style>
.formField .p-fileupload-basic .p-button {
    background-color: var(--gray-color) !important;
    box-shadow: none !important;
    font-weight: 400 !important;
}
</style>