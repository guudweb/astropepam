import { db, Preajustes, eq } from "astro:db";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const nameParam = url.searchParams.get("name");
  if (nameParam === null) {
    return new Response("name parameter is missing", { status: 400 });
  }

  const result = await db
    .select()
    .from(Preajustes)
    .where(eq(Preajustes.name, nameParam))
    .execute();

  return new Response(JSON.stringify(result[0]?.data || {}), { status: 200 });
};
