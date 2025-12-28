import type { APIRoute } from "astro";
import { db, Incidencias } from "astro:db";
import { eq } from "drizzle-orm";

// GET - Obtener una incidencia específica
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || "0");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID de incidencia inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const incidencia = await db
      .select()
      .from(Incidencias)
      .where(eq(Incidencias.id, id))
      .execute();

    if (incidencia.length === 0) {
      return new Response(
        JSON.stringify({ error: "Incidencia no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: incidencia[0] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching incidencia:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT - Actualizar una incidencia
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id || "0");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID de incidencia inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { fechaInicio, fechaFin, motivo, activo } = body;

    // Construir objeto de actualización solo con campos proporcionados
    const updateData: Record<string, any> = {};

    if (fechaInicio !== undefined) {
      updateData.fechaInicio = new Date(fechaInicio);
    }
    if (fechaFin !== undefined) {
      updateData.fechaFin = new Date(fechaFin);
    }
    if (motivo !== undefined) {
      updateData.motivo = motivo;
    }
    if (activo !== undefined) {
      updateData.activo = activo;
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: "No se proporcionaron campos para actualizar" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await db
      .update(Incidencias)
      .set(updateData)
      .where(eq(Incidencias.id, id))
      .execute();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Incidencia actualizada correctamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating incidencia:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// DELETE - Eliminar (desactivar) una incidencia
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || "0");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID de incidencia inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Soft delete - marcar como inactiva
    await db
      .update(Incidencias)
      .set({ activo: false })
      .where(eq(Incidencias.id, id))
      .execute();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Incidencia desactivada correctamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting incidencia:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
