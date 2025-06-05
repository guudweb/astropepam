import { db, Preajustes, eq } from "astro:db";
import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== "string") {
      return new Response(
        JSON.stringify({ error: "Name parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar que el preajuste existe
    const existingRecord = await db
      .select()
      .from(Preajustes)
      .where(eq(Preajustes.name, name))
      .execute();

    if (existingRecord.length === 0) {
      return new Response(
        JSON.stringify({ error: "Preajuste not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Eliminar el preajuste
    await db
      .delete(Preajustes)
      .where(eq(Preajustes.name, name))
      .execute();

    return new Response(
      JSON.stringify({ message: "Preajuste deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting preajuste:", error);
    return new Response(
      JSON.stringify({
        error: "Error deleting preajuste",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};