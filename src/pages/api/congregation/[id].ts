import type { APIRoute } from "astro";
import { Congregacion, db, eq } from "astro:db";



export const DELETE: APIRoute = async ({ params }) => {

    const { id } = params

    const congregacion = await db.select().from(Congregacion).where(eq(Congregacion.id, Number(id)))

    if (!congregacion) {
        return new Response(null, {
            status: 404,
            statusText: 'Not found'
        });
    }

    try {
        await db.delete(Congregacion).where(eq(Congregacion.id, Number(id)));
        return new Response(JSON.stringify(congregacion), { status: 200 });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Error al crear la congreación" }),
            { status: 500 }
        );
    }


};


export const GET: APIRoute = async ({ params }) => {

    const { id } = params;

    const congregation = await db.select().from(Congregacion).where(eq(Congregacion.id, Number(id)))

    if (!congregation) {
        return new Response(JSON.stringify({ message: "No se a encontrado ninguna congregacion" }), { status: 404 });
    }

    return new Response(JSON.stringify(congregation), { status: 200 });
}


export const PUT: APIRoute = async ({ request, params }) => {

    const { id } = params;

    const congregation = await db.select().from(Congregacion).where(eq(Congregacion.id, Number(id)))

    if (!congregation) {
        return new Response(JSON.stringify({ message: "No se a encontrado ninguna congregacion" }), { status: 404 });
    }

    const data = await request.json();

    const { nombre, diaReunion, turnoReunion } = data;

    try {
        await db.update(Congregacion).set({ nombre, diaReunion, turnoReunion }).where(eq(Congregacion.id, Number(id)));
        return new Response(JSON.stringify(congregation), { status: 200 });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Error al crear la congreación" }),
            { status: 500 }
        );
    }
}