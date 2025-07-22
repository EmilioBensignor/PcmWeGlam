<template>
    <main>
        <section class="w-full columnAlignCenter">
            <h1>Variables</h1>
            <div v-if="loading" class="w-full">
                Cargando...
            </div>
            <div v-else class="w-full variablesContainer rowCenter">
                <div v-for="variable in sortedVariables" :key="variable.id">
                    <div class="variableItem rowCenter">
                        <div class="rowCenter">
                            <p class="font-medium">{{ variable.alias }}:</p>
                            <input v-if="editingId === variable.id" v-model="editValue" type="text"
                                @keyup.enter="saveEdit(variable.id)" class="variableInput">
                            <p v-else>
                                {{ variable.valor }}
                            </p>
                        </div>
                        <div>
                            <div v-if="editingId === variable.id" class="rowCenter gap-3">
                                <button @click="saveEdit(variable.id)" class="saveEdit btnVariable active">
                                    <Icon name="tabler:check" />
                                </button>
                                <button @click="cancelEdit" class="cancelEdit btnVariable">
                                    <Icon name="tabler:plus" />
                                </button>
                            </div>
                            <button v-else @click="startEdit(variable)" class="editVariable btnVariable"
                                aria-label="Editar">
                                <Icon name="tabler:edit" class="text-terciary" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup>
import { useVariablesStore } from '~/store/variables'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

const store = useVariablesStore()
const { variables, loading, error } = storeToRefs(store)
const { $toast } = useNuxtApp()

const editingId = ref(null)
const editValue = ref('')
const originalOrder = ref([]) // Mantener el orden original

// Computed property para mantener las variables en el orden original
const sortedVariables = computed(() => {
    // Si es la primera carga, guardar el orden
    if (originalOrder.value.length === 0 && variables.value.length > 0) {
        originalOrder.value = variables.value.map(v => v.id)
    }

    // Ordenar según el orden original
    return [...variables.value].sort((a, b) => {
        return originalOrder.value.indexOf(a.id) - originalOrder.value.indexOf(b.id)
    })
})

const startEdit = (variable) => {
    editingId.value = variable.id
    editValue.value = variable.valor
}

const cancelEdit = () => {
    editingId.value = null
    editValue.value = ''
}

const saveEdit = async (id) => {
    try {
        await store.updateVariable(id, editValue.value)
        editingId.value = null
        editValue.value = ''
        $toast.success('Variable actualizada correctamente')
    } catch (error) {
        $toast.error('Error al actualizar la variable')
    }
}

onMounted(() => {
    store.fetchVariables()
})
</script>

<style scoped>
section {
    max-width: 1100px;
}

.variablesContainer {
    flex-wrap: wrap;
    gap: 4rem;
}

.variablesContainer>div {
    width: 100%;
}

.variableItem {
    gap: 2rem;
}

.variableItem>div {
    gap: 0.625rem;
}

.variableItem>div>p {
    white-space: nowrap;
}

.btnVariable {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 5px;
    padding: 0.75rem;
    cursor: pointer;
}

.btnVariable span {
    font-size: 1.25rem !important;
}

.editVariable {
    background: var(--light-gray-color);
}

.saveEdit {
    background: var(--secondary-color);
}

.cancelEdit {
    background: var(--color-red);
}

.cancelEdit span {
    transform: rotate(45deg);
}

@media (width >=600px) {
    .variablesContainer {
        flex-wrap: nowrap;
    }
}
</style>