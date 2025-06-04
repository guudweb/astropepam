import type { APIRoute } from "astro";
import { Congregacion, db, eq, Usuario } from "astro:db";

export const GET: APIRoute = async ({ url }) => {
  const reportType = url.searchParams.get("type") || "all";

  try {
    // Obtener todos los usuarios con sus congregaciones
    const allUsers = await db
      .select()
      .from(Usuario)
      .leftJoin(Congregacion, eq(Usuario.congregacion, Congregacion.id))
      .execute();

    const usersWithCongregation = allUsers.map((user) => ({
      ...user.Usuario,
      congregacion: user.Congregacion,
    }));

    // Filtrar según el tipo de reporte solicitado
    let filteredUsers = usersWithCongregation;

    switch (reportType) {
      case 'active':
        filteredUsers = usersWithCongregation.filter(user => user.isActive);
        break;
      case 'inactive':
        filteredUsers = usersWithCongregation.filter(user => !user.isActive);
        break;
      case 'privileged':
        filteredUsers = usersWithCongregation.filter(user => 
          user.privilegios && Array.isArray(user.privilegios) && user.privilegios.length > 0
        );
        break;
      case 'all':
      default:
        // Retornar todos los usuarios
        break;
    }

    return new Response(
      JSON.stringify({
        data: filteredUsers,
        total: filteredUsers.length,
        type: reportType
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
      JSON.stringify({ error: "Failed to fetch users for PDF" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};