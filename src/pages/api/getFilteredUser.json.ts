// src/pages/api/getUsersByAvailability.js
import { Congregacion, db, eq, Usuario } from "astro:db";

export async function GET({ url }) {
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = parseInt(url.searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;
  const day = url.searchParams.get("day");
  const turn = url.searchParams.get("turn");

  // Verificación de parámetros obligatorios
  if (!day || !turn) {
    return new Response(
      JSON.stringify({ error: "Day and turn parameters are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Obtiene todos los usuarios
    const allUsers = await db
      .select()
      .from(Usuario)
      .leftJoin(Congregacion, eq(Usuario.congregacion, Congregacion.id))
      .execute();

    const allUsersWithCongregation = allUsers.map((user) => ({
      ...user.Usuario,
      congregacion: user.Congregacion,
    }));

    // Filtra los usuarios según el día y el turno en la disponibilidad
    const filteredUsers = allUsersWithCongregation.filter((user) => {
      const disponibilidad =
        typeof user.disponibilidad === "string"
          ? JSON.parse(user.disponibilidad)
          : {};
      return disponibilidad[day] && disponibilidad[day].includes(turn);
    });

    // Paginación de los resultados filtrados
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return new Response(
      JSON.stringify({
        data: paginatedUsers,
        total: filteredUsers.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch users by availability" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
