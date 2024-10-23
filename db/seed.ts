import { db, Usuario, Disponibilidad } from "astro:db";

export default async function () {
  await db.insert(Usuario).values([
    {
      user_id: 2,
      nombre: "juan",
      role: "admin",
      contraseña: "1234",
      telefono: 2227006560,
      correo: "edu@sjsoco.com",
      congregacion: "furlam",
      sexo: "macho",
      estado_civil: "soltero",
      nombre_conyuge: "",
      privilegios: "guapo",
      isActive: true,
    },
    {
      id: 2,
      nombre: "pedro",
      role: "admin",
      contraseña: "1234",
      telefono: 2227006560,
      correo: "edu@sjsoco.com",
      congregacion: "furlam",
      sexo: "macho",
      estado_civil: "soltero",
      nombre_conyuge: "",
      privilegios: "guapo",
      isActive: true,
    },
  ]);

  await db
    .insert(Disponibilidad)
    .values([{ id: 1, dias_semana: "Lunes", turnos: "T1,T4", usuario_id: 2 }]);
}
