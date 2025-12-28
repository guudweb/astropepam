import type { APIRoute } from "astro";
import { db, Incidencias } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userName, fechaInicio, fechaFin, motivo, creadoPor } = body;

    // Validaciones
    if (!userName || !fechaInicio || !fechaFin || !motivo || !creadoPor) {
      return new Response(
        JSON.stringify({
          error: "Todos los campos son requeridos: userName, fechaInicio, fechaFin, motivo, creadoPor"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parsear fechas
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    // Validar que fechaFin sea posterior a fechaInicio
    if (fechaFinDate < fechaInicioDate) {
      return new Response(
        JSON.stringify({
          error: "La fecha de fin debe ser posterior o igual a la fecha de inicio"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Crear la incidencia
    const result = await db.insert(Incidencias).values({
      userName,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
      motivo,
      creadoPor,
      fechaCreacion: new Date(),
      activo: true
    }).execute();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Incidencia creada correctamente",
        data: {
          userName,
          fechaInicio: fechaInicioDate.toISOString(),
          fechaFin: fechaFinDate.toISOString(),
          motivo,
          creadoPor
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating incidencia:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
