import { db, UserHistory } from "astro:db";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { userName, date, day, turno, indexValue } = await request.json();
  try {
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) {
      throw new Error("Invalid date format");
    }

    await db
      .insert(UserHistory)
      .values({
        userName,
        date: validDate,
        day,
        turno,
        indexValue,
      })
      .execute();

    return new Response("User history saved successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving user history:", error);
    return new Response("Error saving user history", { status: 500 });
  }
};
