import type { APIRoute } from "astro";
import { db, Usuario } from "astro:db";
import { createErrorResponse, createSuccessResponse } from "../../utils/validation";

export const GET: APIRoute = async () => {
  try {
    // Obtener todos los usuarios con su userName y nombre
    const users = await db
      .select({
        userName: Usuario.userName,
        nombre: Usuario.nombre
      })
      .from(Usuario)
      .execute();
    
    // Crear un mapa de userName -> nombre
    const userNameMapping = {};
    users.forEach(user => {
      if (user.userName && user.nombre) {
        userNameMapping[user.userName] = user.nombre;
      }
    });
    
    return createSuccessResponse({
      mapping: userNameMapping,
      total: Object.keys(userNameMapping).length
    });
    
  } catch (error) {
    console.error("Error fetching users name mapping:", error);
    return createErrorResponse(
      "Error al obtener mapeo de nombres",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};