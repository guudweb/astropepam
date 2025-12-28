// src/pages/api/getUsersByAvailability.js
import { Congregacion, db, eq, Usuario } from "astro:db";

export async function GET({ url }) {
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = parseInt(url.searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;
  const day = url.searchParams.get("day");
  const turn = url.searchParams.get("turn");
  const privilegesParam = url.searchParams.get("privileges");
  const privileges = privilegesParam ? privilegesParam.split(",") : [];
  const serviceLinkParam = url.searchParams.get("serviceLink");
  const serviceLink = serviceLinkParam === "true" ? true : serviceLinkParam === "false" ? false : null;
  const congregationsParam = url.searchParams.get("congregations");
  const congregations = congregationsParam ? congregationsParam.split(",") : [];

  // Verificación de parámetros obligatorios - actualizada para ser más flexible
  if (!day && !turn && privileges.length === 0 && serviceLink === null && congregations.length === 0) {
    return new Response(
      JSON.stringify({ error: "At least one filter parameter is required" }),
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

    // Filtra los usuarios según el día, turno y privilegios
    const filteredUsers = allUsersWithCongregation.filter((user) => {
      // Filtro por disponibilidad (día y turno)
      if (day && turn) {
        const disponibilidad =
          typeof user.disponibilidad === "string"
            ? JSON.parse(user.disponibilidad)
            : {};
        if (!disponibilidad[day] || !disponibilidad[day].includes(turn)) {
          return false;
        }
      }
      
      // Filtro por privilegios
      if (privileges.length > 0) {
        const userPrivileges = user.privilegios || [];
        // Verifica si el usuario tiene al menos uno de los privilegios seleccionados
        const hasMatchingPrivilege = privileges.some(privilege => 
          userPrivileges.some(userPriv => 
            userPriv.toLowerCase() === privilege.toLowerCase()
          )
        );
        if (!hasMatchingPrivilege) {
          return false;
        }
      }
      
      // Filtro por service_link
      if (serviceLink !== null) {
        if (user.service_link !== serviceLink) {
          return false;
        }
      }
      
      // Filtro por congregaciones
      if (congregations.length > 0) {
        // Verificar si el usuario pertenece a alguna de las congregaciones seleccionadas
        if (!user.congregacion || !congregations.includes(user.congregacion.id.toString())) {
          return false;
        }
      }
      
      return true;
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
