import { db, Preajustes, eq } from "astro:db";
import type { APIRoute } from "astro";
import { requireAdmin, createErrorResponse, createSuccessResponse } from "../../utils/validation";

export const POST: APIRoute = async (context) => {
  try {
    // Verificar que el usuario sea admin
    const { error } = await requireAdmin(context);
    if (error) return error;

    const { name, preajusteData } = await context.request.json();
    if (!name || typeof name !== "string") {
      throw new Error("Invalid name format");
    }

    const existingRecord = await db
      .select()
      .from(Preajustes)
      .where(eq(Preajustes.name, name))
      .execute();
    if (existingRecord.length > 0) {
      await db
        .update(Preajustes)
        .set({ data: preajusteData })
        .where(eq(Preajustes.name, name))
        .execute();
    } else {
      await db
        .insert(Preajustes)
        .values({ name, data: preajusteData })
        .execute();
    }
    return createSuccessResponse({ message: "Preajuste saved successfully" });
  } catch (error) {
    console.error("Error saving preajuste:", error);
    return createErrorResponse(
      "Error saving preajuste",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
