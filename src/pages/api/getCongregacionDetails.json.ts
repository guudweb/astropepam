import { db, Congregacion, eq } from "astro:db";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const congregacionParam = url.searchParams.get("congregacionId");
  if (congregacionParam === null) {
    return new Response("congregacionId parameter is missing", { status: 400 });
  }

  const result = await db
    .select()
    .from(Congregacion)
    .where(eq(Congregacion.id, parseInt(congregacionParam)))
    .execute();

  console.log("Fetched congregation data:", result);

  return new Response(
    JSON.stringify({
      nombre: result[0]?.nombre || "No name available",
      diaReunion: result[0]?.diaReunion || "No meeting day available",
      turnoReunion: result[0]?.turnoReunion || "No meeting turn available",
    }),
    { status: 200 }
  );
};
