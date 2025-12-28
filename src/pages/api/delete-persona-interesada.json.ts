import type { APIRoute } from "astro";
import { db, PersonasInteresadas, eq } from "astro:db";
import { getSession } from "auth-astro/server";

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  try {
    // Obtener los datos enviados desde el cliente
    const { personaId } = await request.json();

    // Validar sesión
    if (!session) {
      return new Response("No autorizado", { status: 401 });
    }

    const { user } = session;

    // Validar si el ID de la persona interesada está presente
    if (!personaId) {
      return new Response(
        JSON.stringify({
          error: "El ID de la persona interesada es requerido.",
        }),
        { status: 400 }
      );
    }

    // Verificar que la persona interesada existe
    const personaExists = await db
      .select()
      .from(PersonasInteresadas)
      .where(eq(PersonasInteresadas.id, Number(personaId)))
      .execute();

    if (personaExists.length === 0) {
      return new Response(
        JSON.stringify({ error: "La persona interesada no existe." }),
        { status: 404 }
      );
    }

    // Eliminar la persona interesada
    await db
      .delete(PersonasInteresadas) // Corregido: Especificar la tabla aquí
      .where(eq(PersonasInteresadas.id, Number(personaId))) // Condición para eliminar la fila
      .execute();

    return new Response(
      JSON.stringify({ message: "Persona interesada eliminada con éxito." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar la persona interesada:", error);
    return new Response(
      JSON.stringify({ error: "Error al eliminar la persona interesada." }),
      { status: 500 }
    );
  }
};
