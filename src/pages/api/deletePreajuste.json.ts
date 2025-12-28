import { db, Preajustes, eq } from "astro:db";
import type { APIRoute } from "astro";
import { requireAdmin, createErrorResponse, createSuccessResponse } from "../../utils/validation";

export const DELETE: APIRoute = async (context) => {
  try {
    // Verificar que el usuario sea admin
    const { error } = await requireAdmin(context);
    if (error) return error;

    const { name } = await context.request.json();

    if (!name || typeof name !== "string") {
      return createErrorResponse("Name parameter is required", 400);
    }

    // Verificar que el preajuste existe
    const existingRecord = await db
      .select()
      .from(Preajustes)
      .where(eq(Preajustes.name, name))
      .execute();

    if (existingRecord.length === 0) {
      return createErrorResponse("Preajuste not found", 404);
    }

    // Eliminar el preajuste
    await db
      .delete(Preajustes)
      .where(eq(Preajustes.name, name))
      .execute();

    return createSuccessResponse({ message: "Preajuste deleted successfully" });
  } catch (error) {
    console.error("Error deleting preajuste:", error);
    return createErrorResponse(
      "Error deleting preajuste",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
