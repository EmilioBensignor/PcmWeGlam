<template>
    <div class="formField column">
        <label :for="id">{{ label }}</label>
        <Password :inputId="id" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)"
            toggleMask :feedback="false" :inputProps="{
                autocomplete: 'current-password',
                placeholder: placeholder
            }" />
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
            required: false
        },
        modelValue: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue', 'input'],
    methods: {
        validateInput(value) {
            this.$emit('input', value);
        }
    }
}
</script>