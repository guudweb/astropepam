import { db, WeekData } from "astro:db";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const weekOffsetParam = url.searchParams.get("weekOffset");
  if (weekOffsetParam === null) {
    return new Response("weekOffset parameter is missing", { status: 400 });
  }
  const weekOffset = parseInt(weekOffsetParam, 10);

  const result = await db
    .select()
    .from(WeekData)
    .where(eq(WeekData.weekOffset, weekOffset))
    .execute();
  return new Response(JSON.stringify(result[0]?.data || {}), { status: 200 });
};
