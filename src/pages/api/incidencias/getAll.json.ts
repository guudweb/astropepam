import type { APIRoute } from "astro";
import { db, Incidencias, Usuario } from "astro:db";
import { eq, and, gte, desc } from "drizzle-orm";

export const GET: APIRoute = async ({ url }) => {
  try {
    const onlyActive = url.searchParams.get("onlyActive") === "true";
    const fromDate = url.searchParams.get("fromDate");

    let conditions = [];

    if (onlyActive) {
      conditions.push(eq(Incidencias.activo, true));
    }

    if (fromDate) {
      const fromDateParsed = new Date(fromDate);
      conditions.push(gte(Incidencias.fechaFin, fromDateParsed));
    }

    let query;
    if (conditions.length > 0) {
      query = db
        .select({
          id: Incidencias.id,
          userName: Incidencias.userName,
          fechaInicio: Incidencias.fechaInicio,
          fechaFin: Incidencias.fechaFin,
          motivo: Incidencias.motivo,
          creadoPor: Incidencias.creadoPor,
          fechaCreacion: Incidencias.fechaCreacion,
          activo: Incidencias.activo,
          nombreUsuario: Usuario.nombre
        })
        .from(Incidencias)
        .leftJoin(Usuario, eq(Incidencias.userName, Usuario.userName))
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(Incidencias.fechaCreacion));
    } else {
      query = db
        .select({
          id: Incidencias.id,
          userName: Incidencias.userName,
          fechaInicio: Incidencias.fechaInicio,
          fechaFin: Incidencias.fechaFin,
          motivo: Incidencias.motivo,
          creadoPor: Incidencias.creadoPor,
          fechaCreacion: Incidencias.fechaCreacion,
          activo: Incidencias.activo,
          nombreUsuario: Usuario.nombre
        })
        .from(Incidencias)
        .leftJoin(Usuario, eq(Incidencias.userName, Usuario.userName))
        .orderBy(desc(Incidencias.fechaCreacion));
    }

    const incidencias = await query.execute();

    return new Response(
      JSON.stringify({
        success: true,
        data: incidencias,
        count: incidencias.length
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching all incidencias:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
