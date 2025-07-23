export const useProductoValidation = (formData, errors, isEditing = false) => {
    const clearErrors = () => {
        Object.keys(errors).forEach(key => {
            errors[key] = null
        })
    }

    const validateForm = () => {
        let isValid = true
        clearErrors()

        if (!isEditing && !formData.imagen) {
            errors.imagen = 'La imagen es requerida'
            isValid = false
        }

        if (!formData.titulo) {
            errors.titulo = 'El título es requerido'
            isValid = false
        } else if (formData.titulo.length < 5) {
            errors.titulo = 'El título debe tener al menos 5 caracteres'
            isValid = false
        } else if (formData.titulo.length > 30) {
            errors.titulo = 'El título no puede exceder los 30 caracteres'
            isValid = false
        }

        if (!formData.codigo) {
            errors.codigo = 'El código es requerido'
            isValid = false
        } else if (formData.codigo.length > 300) {
            errors.codigo = 'El código no puede exceder los 300 caracteres'
            isValid = false
        }



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

        if (!formData.costo_dolar) {
            errors.costo_dolar = 'El costo es requerido'
            isValid = false
        } else if (isNaN(Number(formData.costo_dolar)) || Number(formData.costo_dolar) <= 0) {
            errors.costo_dolar = 'Ingrese un costo válido mayor a 0'
            isValid = false
        }

        if (formData.indice_markup) {
            if (isNaN(Number(formData.indice_markup)) || Number(formData.indice_markup) <= 0) {
                errors.indice_markup = 'Ingrese un índice markup válido mayor a 0'
                isValid = false
            }
        }

        if (formData.promocion) {
            if (isNaN(Number(formData.promocion)) || Number(formData.promocion) < 0 || Number(formData.promocion) > 100) {
                errors.promocion = 'Ingrese un porcentaje válido entre 0 y 100'
                isValid = false
            }
        }

        if (formData.cantidad_bulto) {
            if (isNaN(Number(formData.cantidad_bulto)) || Number(formData.cantidad_bulto) <= 0) {
                errors.cantidad_bulto = 'Ingrese una cantidad válida mayor a 0'
                isValid = false
            }
        }

        if (formData.cantidad_minima) {
            if (isNaN(Number(formData.cantidad_minima)) || Number(formData.cantidad_minima) <= 0) {
                errors.cantidad_minima = 'Ingrese una cantidad válida mayor a 0'
                isValid = false
            }
        }

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