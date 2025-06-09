
import type { APIRoute } from "astro";
import { db, eq, Usuario } from "astro:db";
import { getSession } from "auth-astro/server";

export const PUT: APIRoute = async ({ request, params }) => {
    const session = await getSession(request);
    const id = params.id;

    try {
        const { nombre, contraseña, telefono, correo, congregacion, isActive, sexo, estadoCivil, availability, role, descripcion, privilegios, participation_rules, service_link } = await request.json();
        console.log({
            availability
        });

        // Verifica si el usuario está autenticado
        if (!session) {
            return new Response('No autorizado', { status: 401 });
        }

        // Verifica si es administrador o el mismo usuario
        const isAuthorized =
            session.user.role === 'admin' || session.user.id === id;

        if (!isAuthorized) {
            return new Response('No autorizado', { status: 403 });
        }

        // Validación de los datos
        if (!nombre || !correo) {
            return new Response(JSON.stringify({ error: "Nombre y correo son requeridos." }), { status: 400 });
        }

        // Consulta de actualización por ID
        const updatedUser = await db.update(Usuario)
            .set({ nombre, contraseña, telefono, correo, congregacion, isActive, sexo, disponibilidad: JSON.stringify(availability), estado_civil: estadoCivil, role, descripcion, privilegios: privilegios || [], participation_rules: participation_rules || [], service_link: service_link ?? false })
            .where(eq(Usuario.user_id, Number(id)))


        return new Response(JSON.stringify(updatedUser), { status: 200 });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        return new Response(JSON.stringify({ error: "Error al actualizar el usuario." }), { status: 500 });
    }
};


export const DELETE: APIRoute = async ({ request, params }) => {

    const id = params.id;

    const user = await db.select().from(Usuario).where(eq(Usuario.user_id, Number(id)));

    if(!user) {
        return new Response(null, {
            status: 404,
            statusText: 'Not found'
        });
    }

    try {
         await db.delete(Usuario).where(eq(Usuario.user_id, Number(id)));
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        return new Response(JSON.stringify({ error: "Error al eliminar el usuario." }), { status: 500 });
    }
}
