<template>
    <main>
        <section class="w-full columnAlignCenter">
            <h1>Variables</h1>
            <div v-if="loading" class="w-full">
                Cargando...
            </div>
            <div v-else class="w-full variablesContainer columnAlignCenter">
                <div v-for="variable in variables" :key="variable.id" class="w-full">
                    <div class="w-full rowSpaceBetweenCenter">
                        <div class="variableItem rowCenter">
                            <strong>{{ variable.nombre }}:</strong>
                            <template v-if="editingId === variable.id">
                                <input v-model="editValue" type="text" @keyup.enter="saveEdit(variable.id)" class="variableInput">
                            </template>
                            <template v-else>
                                {{ variable.valor }}
                            </template>
                        </div>
                        <div>
                            <div v-if="editingId === variable.id" class="rowCenter gap-3">
                                <button @click="saveEdit(variable.id)" class="primaryButton active">
                                    Guardar
                                </button>
                                <button @click="cancelEdit" class="primaryButton redButton">
                                    Cancelar
                                </button>
                            </div>
                            <button v-else @click="startEdit(variable)" class="primaryButton">
                                Editar
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
import { ref } from 'vue'

const store = useVariablesStore()
const { variables, loading, error } = storeToRefs(store)
const { $toast } = useNuxtApp()

const editingId = ref(null)
const editValue = ref('')

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
.variablesContainer {
    gap: 2rem;
}

.variableItem {
    gap: 0.5rem;
}
</style>