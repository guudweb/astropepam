import type { APIRoute } from "astro";
import { db, Incidencias } from "astro:db";
import { eq, and, gte, lte } from "drizzle-orm";

export const GET: APIRoute = async ({ url }) => {
  try {
    const userName = url.searchParams.get("userName");
    const fromDate = url.searchParams.get("fromDate");

    if (!userName) {
      return new Response(
        JSON.stringify({ error: "userName es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let query = db
      .select()
      .from(Incidencias)
      .where(
        and(
          eq(Incidencias.userName, userName),
          eq(Incidencias.activo, true)
        )
      );

    // Si se proporciona fromDate, filtrar incidencias que terminen después de esa fecha
    if (fromDate) {
      const fromDateParsed = new Date(fromDate);
      query = db
        .select()
        .from(Incidencias)
        .where(
          and(
            eq(Incidencias.userName, userName),
            eq(Incidencias.activo, true),
            gte(Incidencias.fechaFin, fromDateParsed)
          )
        );
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
    console.error("Error fetching incidencias:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
