<template>
    <div class="formField column">
        <p>{{ label }}</p>
        <label :for="id" class="customSwitch">
            <input type="checkbox" :id="id" :checked="modelValue"
                @change="$emit('update:modelValue', $event.target.checked)" />
            <div class="switchCircle" :class="{
                'switchCircle-on': modelValue,
                'switchCircle-off': !modelValue
            }">
                <span>{{ modelValue ? 'True' : 'False' }}</span>
            </div>
        </label>
    </div>
</template>

<script setup>
// Props con valores por defecto
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
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

<style scoped>
.customSwitch {
    width: 9.5rem;
    height: 3.125rem;
    display: inline-block;
    position: relative;
    cursor: pointer;
}

.customSwitch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.switchCircle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    border-radius: 999px;
    background-color: var(--mid-gray-color);
    transition: background-color 0.4s;
    border: 1px solid var(--gray-color);
}

.switchCircle span {
    width: 100%;
    text-align: center;
    font-size: 1rem;
    color: var(--black-color);
    transition: color 0.4s;
}

.switchCircle::before {
    position: absolute;
    content: "";
    height: 2.625rem;
    width: 2.625rem;
    left: 4px;
    top: 3px;
    border-radius: 50%;
    background-color: white;
    transition: transform 0.4s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switchCircle-on {
    background-color: var(--secondary-color);
}

.switchCircle-off {
    background-color: var(--mid-gray-color);
}

input:checked+.switchCircle::before {
    transform: translateX(6.25rem);
}
</style>