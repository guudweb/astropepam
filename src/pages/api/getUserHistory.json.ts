import { db, UserHistory } from "astro:db";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const result = await db.select().from(UserHistory).execute();
  return new Response(JSON.stringify(result), { status: 200 });
};
