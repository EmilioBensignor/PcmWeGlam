<template>
    <div v-if="visible" class="dialog-overlay" @click.self="$emit('update:visible', false)">
        <div class="dialog-modal">
            <button class="close-button" @click="$emit('update:visible', false)">
                X
            </button>
            <div class="dialog-content">
                <h2 class="dialog-title">{{ confirmationMessage }}</h2>
                <slot></slot>
            </div>
            <div v-if="showActions" class="dialog-footer">
                <button @click="$emit('update:visible', false)" class="primaryButton">
                    Cancelar
                </button>
                <button @click="$emit('confirm')" class="primaryButton redButton">
                    Eliminar
                </button>
            </div>
        </div>
    </div>
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

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.dialog-modal {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 18px;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.close-button:hover {
    background-color: #f5f5f5;
    color: #333;
}

.dialog-content {
    padding: 24px;
    text-align: center;
}

.dialog-title {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 400;
    color: #333;
    line-height: 1.4;
}

.dialog-footer {
    max-width: max-content;
    padding: 16px 24px 24px;
    display: flex;
    gap: 12px;
    justify-content: center;
    margin: 0 auto;
}
</style>