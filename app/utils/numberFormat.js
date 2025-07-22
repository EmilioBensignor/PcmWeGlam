export const formatNumberForDB = (value) => {
    if (!value) return null
    
    // Si es string, reemplazar comas por puntos
    if (typeof value === 'string') {
        value = value.replace(',', '.')
    }
    
    // Convertir a número y limitar a 2 decimales
    const number = Number(value)
    
    // Verificar si es un número válido
    if (isNaN(number)) return null
    
    // Retornar número con 2 decimales fijos
    return Number(number.toFixed(2))
}
