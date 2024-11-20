import type { APIRoute } from "astro";
import { db, PersonasInteresadas, Usuario, eq } from "astro:db";
import { getSession } from "auth-astro/server";

type Privilegios = {
  roles?: string[];
  [key: string]: any;
};

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  try {
    // Obtener los datos enviados desde el cliente
    const { nombre, telefono, abordado_por, congregacion_id, comentarios } =
      await request.json();

    // Validar sesión
    if (!session) {
      return new Response("No autorizado", { status: 401 });
    }

    const { user } = session;

    // Obtener información del usuario desde la base de datos
    const usuarioDB = await db
      .select()
      .from(Usuario)
      .where(eq(Usuario.user_id, Number(user.id)))
      .execute();

    const currentUser = usuarioDB[0];

    // Deserializar privilegios
    let privilegios: Privilegios = {};
    if (currentUser?.privilegios) {
      try {
        privilegios = JSON.parse(
          currentUser.privilegios as string
        ) as Privilegios;
      } catch (error) {
        console.error("Error al deserializar privilegios:", error);
      }
    }

    // Verificar si el usuario tiene autorización
    const isAuthorized =
      user.role === "admin" ||
      currentUser?.service_link === true ||
      (Array.isArray(privilegios.roles) &&
        privilegios.roles.includes("capitan"));

    if (!isAuthorized) {
      return new Response("No autorizado", { status: 403 });
    }

    // Validar datos requeridos
    if (!nombre || !telefono || !abordado_por || !congregacion_id) {
      return new Response(
        JSON.stringify({
          error:
            "Faltan datos requeridos: nombre, teléfono, abordado_por o congregación.",
        }),
        { status: 400 }
      );
    }

    // Insertar nueva persona interesada
    const newPersona = await db.insert(PersonasInteresadas).values({
      nombre: String(nombre),
      telefono: Number(telefono),
      congregacion: Number(congregacion_id),
      abordado_por: String(abordado_por),
      añadido_por: String(user.id),
      atendido: false,
      comentarios: comentarios ? String(comentarios) : null, // Insertar el valor de comentarios
    });

    return new Response(JSON.stringify(newPersona), { status: 201 });
  } catch (error) {
    console.error("Error al crear la persona interesada:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear la persona interesada." }),
      { status: 500 }
    );
  }
};
