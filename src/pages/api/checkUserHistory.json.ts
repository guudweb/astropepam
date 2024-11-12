import { db, UserHistory, eq, and } from "astro:db";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const userName = url.searchParams.get("userName");
  const date = url.searchParams.get("date");
  const day = url.searchParams.get("day");
  const turno = url.searchParams.get("turno");
  const indexValue = url.searchParams.get("indexValue");

  if (!userName || !date || !day || !turno || !indexValue) {
    return new Response("Missing parameters", { status: 400 });
  }

  try {
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) {
      throw new Error("Invalid date format");
    }

    const result = await db
      .select()
      .from(UserHistory)
      .where(
        and(
          eq(UserHistory.userName, userName),
          eq(UserHistory.date, validDate),
          eq(UserHistory.day, day),
          eq(UserHistory.turno, turno),
          eq(UserHistory.indexValue, parseInt(indexValue))
        )
      )
      .execute();

    return new Response(JSON.stringify({ exists: result.length > 0 }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error checking user history:", error);
    return new Response("Error checking user history", { status: 500 });
  }
};
