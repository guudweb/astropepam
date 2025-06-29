import type { APIRoute } from "astro";
import { db, eq, Usuario } from "astro:db";
import { getSession } from "auth-astro/server";

export const POST: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);

  try {
    const {
      nombre,
      contraseña,
      telefono,
      correo,
      congregacion,
      isActive,
      sexo,
      estadoCivil,
      availability,
      role,
      conyuje,
      userName,
      descripcion, // NUEVO
      privilegios, // NUEVO
      participation_rules, // NUEVO
      service_link, // NUEVO
    } = await request.json();

    // Verifica si el usuario está autenticado
    if (!session) {
      return new Response("No autorizado", { status: 401 });
    }

    // Verifica si es administrador o el mismo usuario
    const isAuthorized = session.user.role === "admin";

    if (!isAuthorized) {
      return new Response("No autorizado", { status: 403 });
    }

    // Validación de los datos
    if (!nombre || !correo) {
      return new Response(
        JSON.stringify({ error: "Nombre y correo son requeridos." }),
        { status: 400 }
      );
    }

    // Consulta de actualización por ID
    const newUser = await db.insert(Usuario).values({
      nombre: nombre,
      contraseña: contraseña,
      telefono: telefono,
      correo: correo,
      congregacion: congregacion,
      isActive: isActive,
      sexo: sexo,
      estado_civil: estadoCivil,
      disponibilidad: availability,
      role: role,
      nombre_conyuge: conyuje,
      userName: userName,
      privilegios: privilegios || [], // ACTUALIZADO
      descripcion: descripcion || null, // NUEVO
      participation_rules: participation_rules || [], // NUEVO
      service_link: service_link || false, // NUEVO
    });

    return new Response(JSON.stringify(newUser), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el usuario." }),
      { status: 500 }
    );
  }
};
