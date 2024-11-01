import { db, WeekData } from "astro:db";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { date, weekData } = await request.json();
  try {
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) {
      throw new Error("Invalid date format");
    }

    const existingRecord = await db
      .select()
      .from(WeekData)
      .where(eq(WeekData.date, validDate))
      .execute();
    if (existingRecord.length > 0) {
      await db
        .update(WeekData)
        .set({ data: weekData })
        .where(eq(WeekData.date, validDate))
        .execute();
    } else {
      await db
        .insert(WeekData)
        .values({ date: validDate, data: weekData })
        .execute();
    }
    return new Response("Data saved successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving data:", error);
    return new Response("Error saving data", { status: 500 });
  }
};
