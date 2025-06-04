import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
  const userName = url.searchParams.get("userName");
  const fromDate = url.searchParams.get("fromDate");

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
    // Por ahora, retornamos un array vacío como placeholder
    // En el futuro, esto debería consultar una tabla de historial de participaciones
    // o analizar los datos guardados de las semanas programadas
    
    const mockHistory = [
      // Ejemplo de datos que podrían venir de la base de datos
      // {
      //   date: "2024-01-15",
      //   day: "lunes", 
      //   turno: "T1"
      // }
    ];

    return new Response(
      JSON.stringify({
        data: mockHistory,
        total: mockHistory.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user participation history" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};