import { db, Preajustes, eq } from "astro:db";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const nameParam = url.searchParams.get("name");
  if (nameParam === null) {
    return new Response("name parameter is missing", { status: 400 });
  }

  console.log("Fetching data for preajuste:", nameParam); // Add this line

  const result = await db
    .select()
    .from(Preajustes)
    .where(eq(Preajustes.name, nameParam))
    .execute();

  console.log("Database query result:", result); // Add this line

  return new Response(JSON.stringify(result[0]?.data || {}), { status: 200 });
};
