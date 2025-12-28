import { db, Preajustes } from "astro:db";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const result = await db
      .select()
      .from(Preajustes)
      .execute();

    return new Response(
      JSON.stringify({
        data: result,
        total: result.length
      }), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error fetching preajustes:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error fetching preajustes",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};