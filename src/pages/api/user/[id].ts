
import type { APIRoute } from "astro";
import { db, eq, Usuario } from "astro:db";

export const PUT: APIRoute = async ({ request, params }) => {
    const id = params.id;

    try {
        const { nombre, contraseña, telefono, correo, congregacion, isActive, sexo, estadoCivil, availability, role } = await request.json();
        console.log({
            availability
        });
        
        // Validación de los datos
        if (!nombre || !correo) {
            return new Response(JSON.stringify({ error: "Nombre y correo son requeridos." }), { status: 400 });
        }

        // Consulta de actualización por ID
        const updatedUser = await db.update(Usuario)
            .set({ nombre, contraseña, telefono, correo, congregacion, isActive, sexo, disponibilidad: JSON.stringify(availability), estado_civil: estadoCivil, role })
            .where(eq(Usuario.user_id, Number(id)))
        
        
        return new Response(JSON.stringify(updatedUser), { status: 200 });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        return new Response(JSON.stringify({ error: "Error al actualizar el usuario." }), { status: 500 });
    }
};
