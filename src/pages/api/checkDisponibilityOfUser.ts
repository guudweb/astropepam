// src/pages/api/getUsersByAvailability.js
import { Congregacion, db, eq, Usuario } from "astro:db";

export async function GET({ url }) {
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = parseInt(url.searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;
  const isActiveParam = url.searchParams.get("isActive");

  // Convertir el valor del parámetro a booleano
  const isActive = isActiveParam === "true";

  try {
    const allUsers = await db
      .select()
      .from(Usuario)
      .leftJoin(Congregacion, eq(Usuario.congregacion, Congregacion.id))
      .execute();

    const allUsersWithCongregation = allUsers.map((user) => ({
      ...user.Usuario,
      congregacion: user.Congregacion,
    }));

    // Filtrar los usuarios por disponibilidad
    const filteredUsers = allUsersWithCongregation.filter(
      (user) => user.isActive === isActive
    );

    // Paginación
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return new Response(
      JSON.stringify({
        data: paginatedUsers,
        total: filteredUsers.length,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch users by availability" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
