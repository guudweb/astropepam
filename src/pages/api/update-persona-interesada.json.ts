import type { APIRoute } from "astro";
import { db, PersonasInteresadas, eq } from "astro:db";
import { getSession } from "auth-astro/server";

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  if (!session) {
    return new Response(
      JSON.stringify({ message: "No autorizado" }), 
      { status: 401 }
    );
  }

  try {
    const {
      personaId,
      nombre,
      telefono,
      abordado_por,
      congregacion,
      comentarios,
      atendido,
    } = await request.json();

    // Validar datos requeridos
    if (!personaId || !nombre || !telefono || !abordado_por || !congregacion) {
      return new Response(
        JSON.stringify({ message: "Faltan campos requeridos" }),
        { status: 400 }
      );
    }

    // Verificar que la persona existe
    const [personaExistente] = await db
      .select()
      .from(PersonasInteresadas)
      .where(eq(PersonasInteresadas.id, personaId));

    if (!personaExistente) {
      return new Response(
        JSON.stringify({ message: "Persona no encontrada" }),
        { status: 404 }
      );
    }

    // Verificar permisos: admin o el usuario que la añadió
    const isAdmin = session.user.role === "admin";
    const isOwner = personaExistente.añadido_por === session.user.id;

    if (!isAdmin && !isOwner) {
      return new Response(
        JSON.stringify({ message: "No tienes permisos para editar esta persona" }),
        { status: 403 }
      );
    }

    // Actualizar la persona
    await db
      .update(PersonasInteresadas)
      .set({
        nombre,
        telefono: Number(telefono),
        abordado_por,
        congregacion: Number(congregacion),
        comentarios: comentarios || null,
        atendido: Boolean(atendido),
      })
      .where(eq(PersonasInteresadas.id, personaId));

    return new Response(
      JSON.stringify({ message: "Persona actualizada exitosamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar persona interesada:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500 }
    );
  }
};