import { db, PersonasInteresadas, eq } from "astro:db";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { personaId, atendido } = await request.json();

  // Ensure personaId is valid and the 'atendido' value is a boolean
  if (!personaId || typeof atendido !== "boolean") {
    console.log(personaId, atendido);

    return new Response("Invalid input data", { status: 400 });
  }

  try {
    // Check if the record exists in the database
    const existingRecord = await db
      .select()
      .from(PersonasInteresadas)
      .where(eq(PersonasInteresadas.id, personaId))
      .execute();

    if (existingRecord.length > 0) {
      // Update the 'atendido' field with the new boolean value (true/false)
      await db
        .update(PersonasInteresadas)
        .set({ atendido }) // Directly set the boolean value
        .where(eq(PersonasInteresadas.id, personaId))
        .execute();

      return new Response("Atendido status updated successfully", {
        status: 200,
      });
    } else {
      return new Response("Persona not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error updating atendido status:", error);
    return new Response("Error updating atendido status", { status: 500 });
  }
};
