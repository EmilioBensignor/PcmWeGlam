<template>
    <div class="w-full formField column">
        <label :for="id">{{ label }}</label>
        <InputText :id="id" type="text" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            :autocomplete="autocomplete" :placeholder="placeholder" />
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
            type: String,
            default: ''
        },
        autocomplete: {
            type: String,
            default: 'off'
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue', 'input'],
    methods: {
        validateInput(event) {
            this.$emit('input', event.target.value);
        }
    }
}
</script>