import { db, WeekData, eq } from "astro:db";

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  if (dateParam === null) {
    return new Response("date parameter is missing", { status: 400 });
  }
  const date = new Date(dateParam);

  // Ensure the date is a valid Date object
  if (isNaN(date.getTime())) {
    return new Response("Invalid date format", { status: 400 });
  }

  // Calculate the start date of the week
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

  const result = await db
    .select()
    .from(WeekData)
    .where(eq(WeekData.date, startOfWeek))
    .execute();

  return new Response(JSON.stringify(result[0]?.data || {}), { status: 200 });
};
