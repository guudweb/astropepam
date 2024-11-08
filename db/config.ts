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
    Congregacion: column.number({ references: () => Congregacion.columns.id }),
    sexo: column.text(),
    role: column.text(),
    estado_civil: column.text(),
    nombre_conyuge: column.text(),
    privilegios: column.json(),
    disponibilidad: column.json(),
    isActive: column.boolean({ default: true }),
    userName: column.text(),
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
    date: column.date(),
    data: column.json(),
  },
});

const UserHistory = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userName: column.text(),
    date: column.date(),
    day: column.text(),
    turno: column.text(),
    indexValue: column.number(),
  },
});

export default defineDb({
  tables: { Usuario, disponibilidad, WeekData, UserHistory, Congregacion },
});
