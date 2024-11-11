import { db, Preajustes, eq } from "astro:db";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { name, preajusteData } = await request.json();
  try {
    if (!name || typeof name !== "string") {
      throw new Error("Invalid name format");
    }

    const existingRecord = await db
      .select()
      .from(Preajustes)
      .where(eq(Preajustes.name, name))
      .execute();
    if (existingRecord.length > 0) {
      await db
        .update(Preajustes)
        .set({ data: preajusteData })
        .where(eq(Preajustes.name, name))
        .execute();
    } else {
      await db
        .insert(Preajustes)
        .values({ name, data: preajusteData })
        .execute();
    }
    return new Response("Preajuste saved successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving preajuste:", error);
    return new Response("Error saving preajuste", { status: 500 });
  }
};
