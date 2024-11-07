import { db, Usuario,eq } from "astro:db";

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const nombreParam = url.searchParams.get("nombre");
  if (nombreParam === null) {
    return new Response("nombre parameter is missing", { status: 400 });
  }

  const result = await db
    .select()
    .from(Usuario)
    .where(eq(Usuario.nombre, nombreParam))
    .execute();
  return new Response(
    JSON.stringify({
      telefono: result[0]?.telefono || "Phone number not available",
    }),
    { status: 200 }
  );
};
