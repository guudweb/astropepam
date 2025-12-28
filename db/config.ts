import { defineDb, defineTable, column } from "astro:db";

const Congregacion = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    nombre: column.text(),
    diaReunion: column.text(),
    turnoReunion: column.text(),
  },
});

const Usuario = defineTable({
  columns: {
    user_id: column.number({ primaryKey: true }),
    nombre: column.text(),
    contraseña: column.text(),
    telefono: column.number(),
    correo: column.text(),
    congregacion: column.number({ references: () => Congregacion.columns.id }),
    sexo: column.text(),
    role: column.text(),
    estado_civil: column.text(),
    nombre_conyuge: column.text(),
    privilegios: column.json(),
    disponibilidad: column.json(),
    isActive: column.boolean({ default: true }),
    userName: column.text({ unique: true }), // OPTIMIZACIÓN: Índice único para userName
    service_link: column.boolean({ default: false }),
    descripcion: column.text({ optional: true }),
    participation_rules: column.json({ optional: true }),
  },
});

const PersonasInteresadas = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    nombre: column.text(),
    telefono: column.number(),
    abordado_por: column.text(),
    congregacion: column.number({ references: () => Congregacion.columns.id }),
    atendido: column.boolean({ default: false }),
    añadido_por: column.text({ references: () => Usuario.columns.nombre }),
    comentarios: column.text(),
  },
});

const disponibilidad = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    user_id: column.number({ references: () => Usuario.columns.user_id }),
    dia: column.text(),
    turnos: column.json(),
  },
});

const WeekData = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    date: column.date({ unique: true }), // OPTIMIZACIÓN: Índice único para fechas
    data: column.json(),
  },
});

const Preajustes = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(), // Nombre del preajuste
    data: column.json(), // Datos del preajuste
  },
});

const UserHistory = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userName: column.text(), // OPTIMIZACIÓN: Necesita índice para consultas frecuentes
    date: column.date(),     // OPTIMIZACIÓN: Necesita índice para filtros por fecha
    day: column.text(),
    turno: column.text(),
    indexValue: column.number(),
  },
});

// Tabla de Incidencias - Para registrar cuando un voluntario no está disponible
const Incidencias = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userName: column.text({ references: () => Usuario.columns.userName }), // Usuario afectado
    fechaInicio: column.date(),   // Fecha desde cuando no está disponible
    fechaFin: column.date(),      // Fecha hasta cuando no está disponible
    motivo: column.text(),        // Motivo de la incidencia
    creadoPor: column.text(),     // Quién registró la incidencia (admin o el propio usuario)
    fechaCreacion: column.date(), // Cuándo se creó la incidencia
    activo: column.boolean({ default: true }), // Si la incidencia sigue activa
  },
});

export default defineDb({
  tables: {
    Usuario,
    disponibilidad,
    WeekData,
    UserHistory,
    Congregacion,
    Preajustes,
    PersonasInteresadas,
    Incidencias,
  },
});
