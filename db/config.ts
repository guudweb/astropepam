import { defineDb, defineTable, column } from "astro:db";

const Usuario = defineTable({
  columns: {
    user_id: column.number({ primaryKey: true }),
    nombre: column.text(),
    contraseña: column.text(),
    telefono: column.number(),
    correo: column.text(),
    congregacion: column.text(),
    sexo: column.text(),
    role: column.text(),
    estado_civil: column.text(),
    nombre_conyuge: column.text(),
    privilegios: column.json(),
    disponibilidad: column.json(),
    isActive: column.boolean({ default: true }),
    userName: column.text()
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
    weekOffset: column.number({ primaryKey: true }),
    data: column.json(),
  },
});

export default defineDb({
  tables: { Usuario, disponibilidad, WeekData },
});
