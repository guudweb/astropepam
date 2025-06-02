import type { APIRoute } from "astro";
import { db, PersonasInteresadas, Usuario, eq } from "astro:db";
import { getSession } from "auth-astro/server";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  if (!session) {
    return new Response(JSON.stringify([]), { status: 401 });
  }

  try {
    // Obtener información del usuario actual
    const [currentUser] = await db
      .select()
      .from(Usuario)
      .where(eq(Usuario.user_id, Number(session.user.id)));

    const isAdmin = session.user.role === "admin";
    const hasServiceLink = currentUser?.service_link || false;

    let personasQuery;

    if (isAdmin) {
      // Admin ve todas las personas no atendidas
      personasQuery = await db
        .select({
          id: PersonasInteresadas.id,
          nombre: PersonasInteresadas.nombre,
          telefono: PersonasInteresadas.telefono,
          añadido_por: PersonasInteresadas.añadido_por,
        })
        .from(PersonasInteresadas)
        .where(eq(PersonasInteresadas.atendido, false));
    } else if (hasServiceLink) {
      // Usuario con service_link ve las de su congregación y las que añadió
      personasQuery = await db
        .select({
          id: PersonasInteresadas.id,
          nombre: PersonasInteresadas.nombre,
          telefono: PersonasInteresadas.telefono,
          añadido_por: PersonasInteresadas.añadido_por,
          congregacion: PersonasInteresadas.congregacion,
        })
        .from(PersonasInteresadas)
        .where(eq(PersonasInteresadas.atendido, false));

      // Filtrar por congregación o añadido_por
      personasQuery = personasQuery.filter(
        (p) => p.congregacion === currentUser.congregacion || 
               p.añadido_por === session.user.id
      );
    } else {
      // Usuario normal solo ve las que añadió
      personasQuery = await db
        .select({
          id: PersonasInteresadas.id,
          nombre: PersonasInteresadas.nombre,
          telefono: PersonasInteresadas.telefono,
          añadido_por: PersonasInteresadas.añadido_por,
        })
        .from(PersonasInteresadas)
        .where(eq(PersonasInteresadas.atendido, false))
        .where(eq(PersonasInteresadas.añadido_por, session.user.id));
    }

    return new Response(JSON.stringify(personasQuery), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching unattended personas:", error);
    return new Response(JSON.stringify([]), { status: 500 });
  }
};