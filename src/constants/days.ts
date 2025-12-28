// Días programables para el programa de predicación pública
// Estos son los días que aparecen en la vista de programa
export const PROGRAMMABLE_DAYS = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo'
] as const;

export type ProgrammableDay = typeof PROGRAMMABLE_DAYS[number];

// Días con texto para mostrar en UI (incluye opción vacía para selects)
export const DAYS = [
    {
        value: '',
        text: 'Selecciona día'
    },
    {
        value: 'lunes',
        text: 'Lunes'
    },
    {
        value: 'martes',
        text: 'Martes'
    },
    {
        value: 'miercoles',
        text: 'Miércoles'
    },
    {
        value: 'jueves',
        text: 'Jueves'
    },
    {
        value: 'viernes',
        text: 'Viernes'
    },
    {
        value: 'sabado',
        text: 'Sábado'
    },
    {
        value: 'domingo',
        text: 'Domingo'
    }
]