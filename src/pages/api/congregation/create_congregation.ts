import type { APIRoute } from "astro";
import { Congregacion, db } from "astro:db";
import { getSession } from "auth-astro/server";



export const POST: APIRoute = async ({ request }) => {

    const session = await getSession(request);

    try {
        const { nombre, diaReunion, turnoReunion } = await request.json()

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
        if (!nombre || !diaReunion || !turnoReunion) {
            return new Response(
                JSON.stringify({ error: "Nombre y correo son requeridos." }),
                { status: 400 }
            );
        }


        const newCongregation = await db.insert(Congregacion).values({
            nombre,
            diaReunion,
            turnoReunion,
        });

        return new Response(JSON.stringify(newCongregation), { status: 200 });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Error al crear la congreación" }),
            { status: 500 }
        );
    }
}