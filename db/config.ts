import { defineDb, defineTable, column } from "astro:db";

const Usuario = defineTable({
  columns: {
    user_id: column.number({ primaryKey: true }),
    nombre: column.text(),
    telefono: column.number(),
    correo: column.text(),
    congregacion: column.text(),
    sexo: column.text(),
    estado_civil: column.text(),
    nombre_conyuge: column.text(),
    privilegios: column.text(),
    isActive: column.boolean({ default: true }),
  },
});

const Disponibilidad = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    usuario_id: column.number({ references: () => Usuario.columns.user_id }),
    dias_semana: column.text(),
    turnos: column.text(),
  },
});

export default defineDb({
  tables: { Usuario, Disponibilidad },
});
