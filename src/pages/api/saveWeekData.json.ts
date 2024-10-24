import { db, WeekData } from "astro:db";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { weekOffset, weekData } = await request.json();
  try {
    const existingRecord = await db
      .select()
      .from(WeekData)
      .where(eq(WeekData.weekOffset, weekOffset))
      .execute();

    if (existingRecord.length > 0) {
      await db
        .update(WeekData)
        .set({ data: weekData })
        .where(eq(WeekData.weekOffset, weekOffset))
        .execute();
    } else {
      await db
        .insert(WeekData)
        .values({ weekOffset, data: weekData })
        .execute();
    }

    return new Response("Data saved successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving data:", error);
    return new Response("Error saving data", { status: 500 });
  }
};
