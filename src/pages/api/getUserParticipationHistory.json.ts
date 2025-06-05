import type { APIRoute } from "astro";
import { db, UserHistory, eq, and, gte, desc } from "astro:db";

export const GET: APIRoute = async ({ url }) => {
  const userName = url.searchParams.get("userName");
  const fromDate = url.searchParams.get("fromDate");

  console.log(`[DEBUG API] Received request for userName: "${userName}"`);
  console.log(`[DEBUG API] fromDate parameter: "${fromDate}"`);
  console.log(`[DEBUG API] Full URL: ${url.toString()}`);

  if (!userName) {
    return new Response(
      JSON.stringify({ error: "userName parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    console.log(`[DEBUG API] Searching for userName: "${userName}"`);
    
    // Construir la consulta base
    let query = db
      .select()
      .from(UserHistory)
      .where(eq(UserHistory.userName, userName))
      .orderBy(desc(UserHistory.date));

    // Si se especifica una fecha de inicio, filtrar desde esa fecha
    if (fromDate) {
      console.log(`[DEBUG API] Using fromDate filter: ${fromDate}`);
      const startDate = new Date(fromDate);
      if (!isNaN(startDate.getTime())) {
        query = db
          .select()
          .from(UserHistory)
          .where(
            and(
              eq(UserHistory.userName, userName),
              gte(UserHistory.date, startDate)
            )
          )
          .orderBy(desc(UserHistory.date));
      }
    } else {
      console.log(`[DEBUG API] No fromDate filter, getting all history for user`);
    }

    // Verificar qué userNames existen en la tabla UserHistory
    const allUserNames = await db
      .select({ userName: UserHistory.userName })
      .from(UserHistory)
      .execute();
    
    const uniqueUserNames = [...new Set(allUserNames.map(u => u.userName))];
    console.log(`[DEBUG API] Todos los userNames en UserHistory:`, uniqueUserNames);
    console.log(`[DEBUG API] ¿Existe "${userName}" en la lista?:`, uniqueUserNames.includes(userName));
    
    console.log(`[DEBUG API] Executing query for userName: "${userName}"`);
    const history = await query.execute();

    console.log(`[DEBUG API] getUserParticipationHistory for ${userName}:`, history.length, 'registros');
    console.log(`[DEBUG API] Raw history data:`, history);

    // Transformar los datos para que coincidan con el formato esperado
    const formattedHistory = history.map((record) => ({
      date: record.date.toISOString().split('T')[0], // Formato YYYY-MM-DD
      day: record.day,
      turno: record.turno,
      indexValue: record.indexValue,
      id: record.id
    }));

    console.log(`[DEBUG API] Formatted history:`, formattedHistory);

    return new Response(
      JSON.stringify({
        data: formattedHistory,
        total: formattedHistory.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching user participation history:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch user participation history",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};