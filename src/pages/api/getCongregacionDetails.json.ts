import { db, Congregacion, eq } from "astro:db";

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const congregacionParam = url.searchParams.get("congregacion");
  if (congregacionParam === null) {
    return new Response("congregacion parameter is missing", { status: 400 });
  }

  const result = await db
    .select()
    .from(Congregacion)
    .where(eq(Congregacion.id, parseInt(congregacionParam)))
    .execute();

  console.log("Fetched congregation data:", result); // Add this line

  return new Response(
    JSON.stringify({
      diaReunion: result[0]?.diaReunion || "No meeting day available",
      turnoReunion: result[0]?.turnoReunion || "No meeting turn available",
    }),
    { status: 200 }
  );
};
