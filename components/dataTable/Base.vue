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
                    },
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

<style>
table.display th:nth-child(1),
table.display td:nth-child(1) {
    width: 5%;
}

table.display th:nth-child(2),
table.display td:nth-child(2) {
    width: 10%;
}

table.display th:nth-child(3),
table.display td:nth-child(3) {
    width: 30%;
}

table.display th:nth-child(4),
table.display td:nth-child(4),
table.display th:nth-child(5),
table.display td:nth-child(5) {
    width: 8%;
}

table.display th:nth-child(6),
table.display td:nth-child(6) {
    width: 8%;
}

table.display th:nth-child(7),
table.display td:nth-child(7),
table.display th:nth-child(8),
table.display td:nth-child(8),
table.display th:nth-child(9),
table.display td:nth-child(9) {
    width: 5%;
    text-align: center;
}

table.display th:nth-child(10),
table.display td:nth-child(10) {
    width: 8%;
}

table.display th:nth-child(11),
table.display td:nth-child(11),
table.display th:nth-child(12),
table.display td:nth-child(12) {
    width: 4%;
    text-align: center;
}

table.display th,
table.display td {
    white-space: nowrap;
}

table.display td:nth-child(3) {
    white-space: normal;
    overflow: hidden;
}
</style>