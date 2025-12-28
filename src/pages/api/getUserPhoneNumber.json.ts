import { db, Usuario,eq } from "astro:db";

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const userNameParam = url.searchParams.get("nombre"); // Mantenemos el parámetro "nombre" por compatibilidad
  if (userNameParam === null) {
    return new Response("nombre parameter is missing", { status: 400 });
  }

  // Buscar por userName en lugar de nombre
  const result = await db
    .select()
    .from(Usuario)
    .where(eq(Usuario.userName, userNameParam))
    .execute();
  return new Response(
    JSON.stringify({
      telefono: result[0]?.telefono || "Phone number not available",
    }),
    { status: 200 }
  );
};
