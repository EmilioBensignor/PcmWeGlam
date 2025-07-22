export const imageOptimization = {
    BUCKET_NAME: 'productos',

    // Configuración de imágenes
    IMAGE_CONFIG: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 1200,
        quality: 0.8,
        outputFormat: 'webp'
    },

    // Comprimir imagen antes de subir
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = event => {
                const img = new Image()
                img.src = event.target.result
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height

                    // Redimensionar si excede el ancho máximo
                    if (width > this.IMAGE_CONFIG.maxWidth) {
                        const ratio = this.IMAGE_CONFIG.maxWidth / width
                        width = this.IMAGE_CONFIG.maxWidth
                        height = height * ratio
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    canvas.toBlob(
                        blob => {
                            const optimizedFile = new File(
                                [blob],
                                `${file.name.split('.')[0]}.${this.IMAGE_CONFIG.outputFormat}`,
                                { type: `image/${this.IMAGE_CONFIG.outputFormat}` }
                            )
                            resolve(optimizedFile)
                        },
                        `image/${this.IMAGE_CONFIG.outputFormat}`,
                        this.IMAGE_CONFIG.quality
                    )
                }
            }
            reader.onerror = error => reject(error)
        })
    },

    // Generar nombre único para la imagen
    generateImageName(title = '') {
        const baseTitle = title || 'producto'

        const cleanTitle = baseTitle
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        const timestamp = Date.now()
        const extension = this.IMAGE_CONFIG.outputFormat

        return `${cleanTitle}-${timestamp}.${extension}`
    },

    // Subir imagen
    async uploadImage(file, options = {}) {
        try {
            const supabase = useSupabaseClient()

            if (!this.IMAGE_CONFIG.allowedTypes.includes(file.type)) {
                throw new Error('Tipo de archivo no permitido')
            }

            if (file.size > this.IMAGE_CONFIG.maxSize) {
                throw new Error('El archivo excede el tamaño máximo permitido')
            }

            const fileName = this.generateImageName(options.title)

            const { error: uploadError } = await supabase.storage
                .from(this.BUCKET_NAME)
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from(this.BUCKET_NAME)
                .getPublicUrl(fileName)

            return publicUrl
        } catch (error) {
            console.error('Error al subir imagen:', error)
            throw error
        }
    },

    // Eliminar imagen
    async deleteImage(imageUrl) {
        try {
            const supabase = useSupabaseClient()
            const fileName = imageUrl.split('/').pop()

            const { error } = await supabase.storage
                .from(this.BUCKET_NAME)
                .remove([fileName])

            if (error) throw error
        } catch (error) {
            console.error('Error al eliminar imagen:', error)
            throw error
        }
    }
}