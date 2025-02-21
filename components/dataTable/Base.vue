<template>
    <div class="w-full max-w-screen">
        <table ref="dataTable" class="display">
            <thead>
                <tr>
                    <th v-for="(head, index) in headings" :key="index">
                        <div class="head rowCenter">
                            {{ head }}
                            <Icon v-if="sortStates[index] === 'asc'" name="tabler:sort-ascending" />
                            <Icon v-else-if="sortStates[index] === 'desc'" name="tabler:sort-descending" />
                            <Icon v-else name="tabler:arrows-sort" />
                        </div>
                    </th>
                </tr>
            </thead>
        </table>
    </div>
</template>

<script>
export default {
    props: {
        headings: {
            type: Array,
            required: true
        },
        data: {
            type: Array,
            required: true
        },
        columns: {
            type: Array,
            required: true
        },
        options: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            dataTable: null,
            sortStates: []
        }
    },
    mounted() {
        this.initializeDataTable()
    },
    methods: {
        initializeDataTable() {
            if (process.client) {
                const $ = window.jQuery
                const defaultOptions = {
                    lengthChange: false,
                    info: false,
                    language: {
                        search: "_INPUT_",
                        searchPlaceholder: "Buscar..."
                    }
                }

                this.sortStates = Array(this.headings.length).fill('default')
                this.dataTable = $(this.$refs.dataTable).DataTable({
                    ...defaultOptions,
                    ...this.options,
                    data: this.data,
                    columns: this.columns,
                    drawCallback: () => this.updateSortStates($)
                })

                this.setupEventListeners($)
            }
        },
        updateSortStates($) {
            $('table.dataTable>thead>tr>th').each((index, th) => {
                const $th = $(th);
                this.sortStates[index] = $th.hasClass('dt-ordering-asc')
                    ? 'asc'
                    : $th.hasClass('dt-ordering-desc')
                        ? 'desc'
                        : 'default'
            })
        },
        setupEventListeners($) {
            $(this.$refs.dataTable).on('click', '.edit', (e) => {
                const id = $(e.currentTarget).data('id')
                this.$emit('edit', id)
            })

            $(this.$refs.dataTable).on('click', '.delete', (e) => {
                const id = $(e.currentTarget).data('id')
                this.$emit('delete', id)
            })
        }
    },
    beforeDestroy() {
        if (this.dataTable) {
            this.dataTable.destroy()
        }
    }
}
</script>