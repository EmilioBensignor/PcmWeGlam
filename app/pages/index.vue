<template>
    <main class="relative max-w-screen">
        <section class="w-full columnAlignCenter">
            <h1>Productos</h1>
            <div class="buttons">
                <NuxtLink :to="ROUTE_NAMES.PRODUCT_CREATE" class="primaryButton active">
                    Agregar nuevo
                </NuxtLink>
                <button 
                    @click="handleDownloadCatalog" 
                    class="primaryButton"
                    :disabled="!formattedProducts || formattedProducts.length === 0"
                >
                    Descargar Catálogo
                </button>
            </div>
            <div v-if="productosStore.isLoading" class="text-center">
                <p>Cargando productos...</p>
            </div>
            <DataTableBase v-else-if="formattedProducts" :headings="headings" :data="formattedProducts"
                :columns="tableColumns" @edit="handleEdit" @delete="handleDelete" />
        </section>

        <DialogConfirmation :visible="deleteDialog" @update:visible="deleteDialog = $event"
            :confirmation-message="`¿Estás seguro que quieres eliminar ${selectedItem?.titulo}?`"
            @confirm="confirmDelete" />
    </main>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useProductosStore } from '~/store/productos'
import { useVariablesStore } from '~/store/variables'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
import { useCatalogDownload } from '~/composables/useCatalogDownload'

const productosStore = useProductosStore()
const variablesStore = useVariablesStore()
const { downloadCatalog } = useCatalogDownload()

const deleteDialog = ref(false)
const selectedItem = ref(null)
const deletedItemName = ref('')

const headings = [
    'Título',
    'Imagen',
    'Descripción',
    'Código',
    'Costo dólar',
    'Índice Markup',
    'Promoción',
    'Precio s/IVA',
    'Descuento s/IVA',
    'Precio c/IVA',
    'Descuento c/IVA',
    'Cantidad por bulto',
    'Cantidad mín.',
    'Categoría',
    'Destacado',
    'Más vendido',
    'Oculto',
    'Editar',
    'Eliminar'
]

const tableColumns = [
    { data: 'titulo' },
    {
        data: 'imagen',
        render: (data) => data ? `<img src="${data}" alt="Producto" class="productImg" />` : 'Sin imagen'
    },
    { data: 'descripcion' },
    { data: 'codigo' },
    {
        data: 'costo_dolar',
        render: (data) => `$${Number(data).toFixed(2)}`
    },
    {
        data: 'markup_display',
        render: (data, type, row) => {
            const { valor, esPersonalizado } = data
            const clase = esPersonalizado ? 'markup-personalizado' : 'markup-default'
            const valorFormateado = parseFloat(valor.toFixed(4)).toString()
            return `<span class="${clase}">${valorFormateado}</span>`
        }
    },
    {
        data: 'promocion',
        render: (data) => data && data > 0 ? `${data}%` : ''
    },
    {
        data: 'precio_sin_iva',
        render: (data) => formatPrice(data)
    },
    {
        data: 'precio_sin_iva_con_descuento',
        render: (data, type, row) => row.promocion && row.promocion > 0 ? formatPrice(data) : ''
    },
    {
        data: 'precio_con_iva',
        render: (data) => formatPrice(data)
    },
    {
        data: 'precio_con_iva_con_descuento',
        render: (data, type, row) => row.promocion && row.promocion > 0 ? formatPrice(data) : ''
    },
    { data: 'cantidad_bulto' },
    { data: 'cantidad_minima' },
    {
        data: 'categoria',
        render: (data) => data?.nombre || 'Sin categoría'
    },
    {
        data: 'destacado',
        render: (data) => data ? '✔️' : ''
    },
    {
        data: 'mas_vendido',
        render: (data) => data ? '✔️' : ''
    },
    {
        data: 'oculto',
        render: (data) => data ? '✔️' : ''
    },
    {
        data: null,
        render: (data, type, row) => `
            <button class="edit" data-id="${row.id}">
                <span></span>
            </button>
        `
    },
    {
        data: null,
        render: (data, type, row) => `
            <button class="delete" data-id="${row.id}">
                <span></span>
            </button>
        `
    }
]

const productos = computed(() => productosStore.getProductos)

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}

const formattedProducts = computed(() => {
    if (!productos.value || !variablesStore.variables.length) return null

    return productos.value.map(product => {
        const markupActual = product.indice_markup !== null ?
            product.indice_markup :
            variablesStore.GANANCIA

        let precioSinIva = product.costo_dolar * variablesStore.DOLAR_WG * markupActual
        let precioConIva = precioSinIva * 1.21
        
        let precioSinIvaConDescuento = precioSinIva
        let precioConIvaConDescuento = precioConIva
        
        if (product.promocion && product.promocion > 0) {
            const descuento = product.promocion / 100
            precioSinIvaConDescuento = precioSinIva * (1 - descuento)
            precioConIvaConDescuento = precioSinIvaConDescuento * 1.21
        }

        return {
            ...product,
            imagen: product.imagen || null,
            markup_display: {
                valor: markupActual,
                esPersonalizado: product.indice_markup !== null,
                valorDefault: variablesStore.GANANCIA
            },
            precio_sin_iva: precioSinIva,
            precio_con_iva: precioConIva,
            precio_sin_iva_con_descuento: precioSinIvaConDescuento,
            precio_con_iva_con_descuento: precioConIvaConDescuento,
            precio: precioConIvaConDescuento
        }
    })
})

const handleEdit = (id) => {
    navigateTo(`${ROUTE_NAMES.PRODUCT_EDIT}/${id}`)
}

const { $toast } = useNuxtApp()

const handleDelete = (id) => {
    selectedItem.value = productos.value.find(item => item.id === id)
    if (selectedItem.value) {
        deleteDialog.value = true
    }
}

const confirmDelete = async () => {
    if (selectedItem.value) {
        try {
            deletedItemName.value = selectedItem.value.titulo
            await productosStore.deleteProducto(selectedItem.value.id)
            deleteDialog.value = false
            $toast.success(`El producto ${deletedItemName.value} ha sido eliminado`)
            selectedItem.value = null
            deletedItemName.value = ''
        } catch (error) {
            console.error('Error al eliminar producto:', error)
            $toast.error('Error al eliminar el producto')
        }
    }
}

const handleDownloadCatalog = async () => {
    try {
        if (!productos.value || productos.value.length === 0) {
            $toast.error('No hay productos para descargar')
            return
        }

        $toast.info('Generando catálogo PDF...')
        await downloadCatalog(productos.value, variablesStore)
        $toast.success('Catálogo PDF descargado correctamente')
    } catch (error) {
        console.error('Error al descargar catálogo:', error)
        $toast.error('Error al descargar el catálogo')
    }
}

onMounted(async () => {
    await Promise.all([
        variablesStore.fetchVariables(),
        productosStore.fetchProductos()
    ])

    if (productosStore.lastAction === 'created') {
        $toast.success('Producto creado correctamente')
        productosStore.clearLastAction()
    }
})
</script>

<style scoped>
.markup-personalizado {
    background: #fff3cd;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;
}

.markup-default {
    background: #d1ecf1;
    padding: 2px 6px;
    border-radius: 3px;
}

.primaryButton:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.buttons {
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
}
</style>