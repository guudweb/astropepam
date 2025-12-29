import type { APIRoute } from "astro";
import { db, Usuario, Congregacion, eq, and, sql } from "astro:db";
import { validateUrlParams, createErrorResponse, createSuccessResponse } from "../../utils/validation";

export const GET: APIRoute = async ({ url }) => {
  try {
    const params = url.searchParams;
    const day = params.get("day");
    const turno = params.get("turno");
    const activeOnly = params.get("activeOnly") !== "false"; // Por defecto true
    
    // OPTIMIZACIÓN: Solo seleccionar campos necesarios y usar INNER JOIN para activos
    // Incluir diaReunion y turnoReunion para validación de conflictos de reunión
    const baseSelect = {
      user_id: Usuario.user_id,
      nombre: Usuario.nombre,
      userName: Usuario.userName,
      telefono: Usuario.telefono,
      privilegios: Usuario.privilegios,
      disponibilidad: Usuario.disponibilidad,
      isActive: Usuario.isActive,
      participation_rules: Usuario.participation_rules,
      congregacion_id: Usuario.congregacion,
      congregacion_nombre: Congregacion.nombre,
      congregacion_diaReunion: Congregacion.diaReunion,
      congregacion_turnoReunion: Congregacion.turnoReunion
    };

    let query = db
      .select(baseSelect)
      .from(Usuario)
      .innerJoin(Congregacion, eq(Usuario.congregacion, Congregacion.id)); // INNER JOIN para mejorar rendimiento

    // Filtros en base de datos
    const conditions = [];
    
    if (activeOnly) {
      conditions.push(eq(Usuario.isActive, true));
    }

    // OPTIMIZACIÓN: Filtrar por disponibilidad en memoria para evitar problemas con SQL JSON
    // La base de datos no siempre maneja bien las consultas JSON complejas
    // Es más eficiente filtrar en memoria para este caso específico

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const users = await query.execute();

    // Transformar datos para el formato esperado
    // Incluir datos completos de congregación para validación de reuniones
    const formattedUsers = users.map(user => ({
      user_id: user.user_id,
      nombre: user.nombre,
      userName: user.userName,
      telefono: user.telefono,
      privilegios: user.privilegios,
      disponibilidad: user.disponibilidad,
      isActive: user.isActive,
      participation_rules: user.participation_rules,
      congregacion: {
        id: user.congregacion_id,
        nombre: user.congregacion_nombre,
        diaReunion: user.congregacion_diaReunion,
        turnoReunion: user.congregacion_turnoReunion
      }
    }));

    // Filtrar usuarios por disponibilidad en memoria
    let finalUsers = formattedUsers;
    
    if (day && turno) {
      finalUsers = formattedUsers.filter(user => {
        if (!user.disponibilidad) return false;
        
        try {
          const disponibilidad = typeof user.disponibilidad === "string"
            ? JSON.parse(user.disponibilidad)
            : user.disponibilidad;
            
          return disponibilidad[day] && disponibilidad[day].includes(turno);
        } catch {
          return false;
        }
      });
    }

    return createSuccessResponse({
      data: finalUsers,
      total: finalUsers.length,
      filters: {
        day,
        turno,
        activeOnly
      }
    });

  } catch (error) {
    console.error("Error fetching users for program:", error);
    return createErrorResponse(
      "Error al obtener usuarios para programa",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

// Endpoint adicional para obtener solo usuarios disponibles para un slot específico
export const POST: APIRoute = async ({ request }) => {
  try {
    const { day, turno, date } = await request.json();
    
    if (!day || !turno) {
      return createErrorResponse("day y turno son requeridos", 400);
    }

    // Obtener usuarios disponibles para ese día y turno
    const response = await fetch(
      `${new URL(request.url).origin}/api/getUsersForProgram.json?day=${day}&turno=${turno}&activeOnly=true`
    );
    
    if (!response.ok) {
      throw new Error("Error fetching available users");
    }
    
    const { data: availableUsers } = await response.json();
    
    // Si se proporciona fecha, validar reglas de participación
    const usersWithValidation = [];
    
    for (const user of availableUsers) {
      let canParticipate = true;
      let validationMessage = "";
      
      if (date && user.participation_rules && user.participation_rules.length > 0) {
        try {
          const validationResponse = await fetch(
            `${new URL(request.url).origin}/api/validateUserParticipation.json`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userName: user.userName,
                selectedDate: date
              })
            }
          );
          
          if (validationResponse.ok) {
            const validation = await validationResponse.json();
            canParticipate = validation.canParticipate;
            validationMessage = validation.reason || validation.warningMessage || "";
          }
        } catch (error) {
          console.warn(`Error validating user ${user.userName}:`, error);
          // En caso de error de validación, permitir participación pero log el error
        }
      }
      
      usersWithValidation.push({
        ...user,
        canParticipate,
        validationMessage
      });
    }
    
    // Ordenar: usuarios que pueden participar primero
    usersWithValidation.sort((a, b) => {
      if (a.canParticipate && !b.canParticipate) return -1;
      if (!a.canParticipate && b.canParticipate) return 1;
      return a.nombre.localeCompare(b.nombre);
    });

    return createSuccessResponse({
      data: usersWithValidation,
      total: usersWithValidation.length,
      availableCount: usersWithValidation.filter(u => u.canParticipate).length,
      restrictedCount: usersWithValidation.filter(u => !u.canParticipate).length
    });

  } catch (error) {
    console.error("Error in POST getUsersForProgram:", error);
    return createErrorResponse(
      "Error al validar usuarios para programa",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};