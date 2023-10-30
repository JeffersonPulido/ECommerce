export const format = ( value: number ) => {
    //Crear formato
    const formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return formatter.format(value)
}