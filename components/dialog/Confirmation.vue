<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal class="dialog">
        <button class="closeButton" @click="$emit('update:visible', false)">
            <Icon name="tabler:plus" />
        </button>
        <div class="deleteContainer columnAlignCenter">
            <h2 class="text-center">{{ confirmationMessage }}</h2>
            <slot></slot>
        </div>
        <template #footer v-if="showActions">
            <button @click="$emit('update:visible', false)" class="primaryButton">
                Cancelar
            </button>
            <button @click="$emit('confirm')" class="primaryButton redButton">
                Eliminar
            </button>
        </template>
    </Dialog>
</template>

<script setup>
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    confirmationMessage: {
        type: String,
        required: true
    },
    showActions: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:visible', 'confirm'])
</script>