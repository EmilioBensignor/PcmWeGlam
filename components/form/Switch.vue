<template>
    <label class="custom-switch" role="button">
        <input type="checkbox" :value="modelValue" :checked="modelValue"
            @change="$emit('update:modelValue', $event.target.checked)" />
        <div class="switch-circle" :class="{
            'switch-circle-on': modelValue,
            'switch-circle-off': !modelValue
        }">
            <span>{{ modelValue ? dataOn : dataOff }}</span>
        </div>
    </label>
</template>

<script setup>
// Props con valores por defecto
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    dataOn: {
        type: String,
        default: 'On'
    },
    dataOff: {
        type: String,
        default: 'Off'
    }
})

// Emitir eventos para v-model
defineEmits(['update:modelValue'])
</script>

<style>
/* Variables CSS para personalización */
:root {
    --switch-color-default: black;
    --switch-color-active: #f96332;
    --switch-color-inactive: #6c757d;
    --switch-color-text: #9d9d9d;
    --switch-color-text-hover: white;
    --switch-size: 2.5rem;
    --switch-width: 300px;
    --switch-height: 100px;
}

.custom-switch {
    position: relative;
    display: inline-block;
    width: var(--switch-width);
    height: var(--switch-height);
    border-radius: 100px;
}

.custom-switch input {
    display: none;
}

.switch-circle {
    display: flex;
    align-items: center;
    width: 100%;
    height: calc(var(--switch-height) - 2px);
    border-radius: 100px;
    background-color: var(--switch-color-default);
    transition: background-color 0.4s;
}

.switch-circle span {
    font-size: var(--switch-size);
    color: var(--switch-color-text);
    padding-left: calc(var(--switch-height) + 4px);
    transition: color 0.4s;
}

.switch-circle::before {
    position: absolute;
    content: "";
    height: calc(var(--switch-height) - 4px);
    width: calc(var(--switch-height) - 4px);
    left: 1px;
    top: 1px;
    border-radius: 100px;
    background-color: white;
    transition: transform 0.4s;
}

/* Estados activo/inactivo */
.switch-circle-on {
    background-color: var(--switch-color-active);
}

.switch-circle-on span {
    color: white;
}

.switch-circle-off {
    background-color: var(--switch-color-inactive);
}

.switch-circle-off span {
    color: white;
}

/* Efectos hover */
.switch-circle:hover {
    background-color: white;
}

.switch-circle-on:hover {
    border: 1px solid var(--switch-color-active);
}

.switch-circle-on:hover::before {
    background-color: var(--switch-color-active);
}

.switch-circle-on:hover span {
    color: var(--switch-color-active);
}

.switch-circle-off:hover {
    border: 1px solid var(--switch-color-inactive);
}

.switch-circle-off:hover::before {
    background-color: var(--switch-color-inactive);
}

.switch-circle-off:hover span {
    color: var(--switch-color-inactive);
}

/* Animación del círculo */
input:checked+.switch-circle::before {
    transform: translateX(calc(var(--switch-width) - var(--switch-height) + 2px));
}
</style>