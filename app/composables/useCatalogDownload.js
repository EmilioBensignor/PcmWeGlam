export const useCatalogDownload = () => {
    const downloadCatalog = async (products, variables) => {
        if (!products || !Array.isArray(products) || products.length === 0) {
            throw new Error('No hay productos para descargar')
        }

        const { jsPDF } = await import('jspdf')
        await import('jspdf-autotable')

        const pdf = new jsPDF('p', 'mm', 'a4')
        await generatePDF(pdf, products, variables)

        const fileName = `catalogo-weglam-${new Date().toISOString().split('T')[0]}.pdf`
        pdf.save(fileName)
    }

    const generatePDF = async (pdf, products, variables) => {
        try {
            let logoData = null
            const logoPaths = [
                '/images/Logo-PDF.png',
                './images/Logo-PDF.png',
                'images/Logo-PDF.png',
                '/public/images/Logo-PDF.png'
            ]

            for (const path of logoPaths) {
                try {
                    logoData = await loadImage(path)
                    if (logoData) {
                        break
                    }
                } catch (error) {
                    console.warn(`Error cargando logo desde ${path}:`, error)
                }
            }

            if (logoData) {
                await addImageWithContain(pdf, logoData, 80, 5, 50, 25)
            } else {
                console.warn('No se pudo cargar el logo desde ninguna ruta')
            }
        } catch (error) {
            console.warn('Error general cargando logo:', error)
        }

        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Catálogo We Glam', 105, 38, { align: 'center' })

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 15, 48)

        let yPosition = 58
        const pageHeight = pdf.internal.pageSize.height
        const marginBottom = 15

        for (let i = 0; i < products.length; i++) {
            const product = products[i]

            let requiredSpace = 50
            if (product.descripcion) {
                const splitDescription = pdf.splitTextToSize(product.descripcion, 130)
                requiredSpace += splitDescription.length * 3 + 8
            }

            if (yPosition + requiredSpace > pageHeight - marginBottom) {
                pdf.addPage()
                yPosition = 28
            }

            const markupActual = product.indice_markup !== null ?
                product.indice_markup :
                variables.GANANCIA

            const precioSinIva = product.costo_dolar * variables.DOLAR_WG * markupActual
            const precioConIva = precioSinIva * 1.21
            const precio = product.costo_dolar * variables.DOLAR_WG * variables.GANANCIA * 1.21

            if (product.imagen) {
                try {
                    const imgData = await loadImage(product.imagen)
                    if (imgData) {
                        await addImageWithContain(pdf, imgData, 15, yPosition, 40, 40)
                    }
                } catch (error) {
                    console.warn('Error cargando imagen:', error)
                }
            }

            pdf.setFontSize(14)
            pdf.setFont('helvetica', 'bold')
            pdf.text(product.titulo || 'Sin título', 60, yPosition + 8)

            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'normal')

            const productInfo = [
                `Código: ${product.codigo || 'N/A'}`,
                `Precio sin IVA: ${formatPrice(precioSinIva)}`,
                `Precio con IVA: ${formatPrice(precioConIva)}`,
                `Cantidad por bulto: ${product.cantidad_bulto || 'N/A'}`,
                `Precio: ${formatPrice(precio)}`
            ]

            productInfo.forEach((info, index) => {
                pdf.text(info, 60, yPosition + 16 + (index * 4))
            })

            let currentY = yPosition + 36

            if (product.descripcion) {
                const splitDescription = pdf.splitTextToSize(product.descripcion, 130)
                pdf.text(splitDescription, 60, currentY)
                currentY += splitDescription.length * 3
            }

            pdf.setDrawColor(200, 200, 200)
            pdf.line(15, currentY + 5, 195, currentY + 5)

            yPosition = currentY + 12
        }
    }

    const addImageWithContain = (pdf, imgData, x, y, maxWidth, maxHeight) => {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                const imgWidth = img.width
                const imgHeight = img.height

                const imgAspectRatio = imgWidth / imgHeight
                const containerAspectRatio = maxWidth / maxHeight

                let newWidth, newHeight, offsetX, offsetY

                if (imgAspectRatio > containerAspectRatio) {
                    newWidth = maxWidth
                    newHeight = maxWidth / imgAspectRatio
                    offsetX = 0
                    offsetY = (maxHeight - newHeight) / 2
                } else {
                    newWidth = maxHeight * imgAspectRatio
                    newHeight = maxHeight
                    offsetX = (maxWidth - newWidth) / 2
                    offsetY = 0
                }

                pdf.setFillColor(250, 250, 250)
                pdf.rect(x, y, maxWidth, maxHeight, 'F')

                const format = imgData.includes('data:image/png') ? 'PNG' : 'JPEG'
                pdf.addImage(imgData, format, x + offsetX, y + offsetY, newWidth, newHeight)
                resolve()
            }
            img.src = imgData
        })
    }

    const loadImage = (url) => {
        return new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'

            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                canvas.width = img.width
                canvas.height = img.height

                ctx.drawImage(img, 0, 0)

                try {
                    const format = url.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
                    const dataURL = canvas.toDataURL(format, 0.9)
                    resolve(dataURL)
                } catch (error) {
                    console.warn('Error convirtiendo imagen:', error)
                    resolve(null)
                }
            }

            img.onerror = () => {
                console.warn('Error cargando imagen:', url)
                resolve(null)
            }

            img.src = url
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    return {
        downloadCatalog
    }
}
