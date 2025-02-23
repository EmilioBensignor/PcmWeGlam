// composables/useProductoValidation.js
export const useProductoValidation = (formData, errors, isEditing = false) => {
    const clearErrors = () => {
        Object.keys(errors).forEach(key => {
            errors[key] = null
        })
    }

    const validateForm = () => {
        let isValid = true
        clearErrors()

        // Validación de imagen
        if (!isEditing && !formData.imagen) {
            errors.imagen = 'La imagen es requerida'
            isValid = false
        } else if (formData.imagen && typeof formData.imagen !== 'string') {
            const maxSize = 5000000
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

            if (formData.imagen.size > maxSize) {
                errors.imagen = 'La imagen no puede superar los 5MB'
                isValid = false
            }

            if (!allowedTypes.includes(formData.imagen.type)) {
                errors.imagen = 'Formato de imagen no válido. Use JPG, PNG o GIF'
                isValid = false
            }
        }

        // Validación del título
        if (!formData.titulo) {
            errors.titulo = 'El título es requerido'
            isValid = false
        } else if (formData.titulo.length < 5) {
            errors.titulo = 'El título debe tener al menos 5 caracteres'
            isValid = false
        } else if (formData.titulo.length > 20) {
            errors.titulo = 'El título no puede exceder los 20 caracteres'
            isValid = false
        }

        // Validación de la descripción
        if (!formData.descripcion) {
            errors.descripcion = 'La descripción es requerida'
            isValid = false
        } else if (formData.descripcion.length < 10) {
            errors.descripcion = 'La descripción debe tener al menos 10 caracteres'
            isValid = false
        } else if (formData.descripcion.length > 200) {
            errors.descripcion = 'La descripción no puede exceder los 200 caracteres'
            isValid = false
        }

        // Validación del costo
        if (!formData.costo_dolar) {
            errors.costo_dolar = 'El costo es requerido'
            isValid = false
        } else if (isNaN(Number(formData.costo_dolar)) || Number(formData.costo_dolar) <= 0) {
            errors.costo_dolar = 'Ingrese un costo válido mayor a 0'
            isValid = false
        }

        // Validación de la categoría
        if (!formData.categoria) {
            errors.categoria = 'Seleccione una categoría'
            isValid = false
        }

        return isValid
    }

    return {
        validateForm,
        clearErrors
    }
}