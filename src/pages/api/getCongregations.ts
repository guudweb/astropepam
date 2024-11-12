// src/pages/api/getAllUsers.js
import { Congregacion, db } from "astro:db";

export async function GET() {

    // Consulta para obtener los usuarios
    const congregations = await db
        .select()
        .from(Congregacion)
        .execute();

    return new Response(
        JSON.stringify(congregations),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}
