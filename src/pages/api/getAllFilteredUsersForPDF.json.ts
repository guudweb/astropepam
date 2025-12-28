import type { APIRoute } from "astro";
import { Congregacion, db, eq, Usuario, and, like, or } from "astro:db";

export const GET: APIRoute = async ({ url }) => {
  const searchTerm = url.searchParams.get("q") || "";
  const day = url.searchParams.get("day") || "";
  const turn = url.searchParams.get("turn") || "";
  const isActiveParam = url.searchParams.get("isActive");
  const privilegesParam = url.searchParams.get("privileges") || "";

  try {
    // Construir la consulta base
    let query = db
      .select()
      .from(Usuario)
      .leftJoin(Congregacion, eq(Usuario.congregacion, Congregacion.id));

    // Array para almacenar condiciones
    const conditions = [];

    // Filtro por término de búsqueda
    if (searchTerm) {
      conditions.push(
        or(
          like(Usuario.nombre, `%${searchTerm}%`),
          like(Usuario.telefono, `%${searchTerm}%`)
        )
      );
    }

    // Filtro por disponibilidad (isActive)
    if (isActiveParam !== null && isActiveParam !== "") {
      const isActive = isActiveParam === "true";
      conditions.push(eq(Usuario.isActive, isActive));
    }

    // Aplicar condiciones si existen
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allUsers = await query.execute();

    let usersWithCongregation = allUsers.map((user) => ({
      ...user.Usuario,
      congregacion: user.Congregacion,
    }));

    // Filtros adicionales en memoria (para casos complejos)
    
    // Filtro por día y turno (disponibilidad)
    if (day || turn) {
      usersWithCongregation = usersWithCongregation.filter((user) => {
        if (!user.disponibilidad) return false;
        
        const disponibilidad = Array.isArray(user.disponibilidad) 
          ? user.disponibilidad 
          : [];

        return disponibilidad.some((disp: any) => {
          const matchesDay = !day || disp.day === day;
          const matchesTurn = !turn || disp.turn === turn;
          return matchesDay && matchesTurn;
        });
      });
    }

    // Filtro por privilegios
    if (privilegesParam) {
      const privilegesArray = privilegesParam.split(",").map(p => p.trim());
      usersWithCongregation = usersWithCongregation.filter((user) => {
        if (!user.privilegios || !Array.isArray(user.privilegios)) return false;
        
        return privilegesArray.some(privilege => 
          user.privilegios.some((userPrivilege: string) => 
            userPrivilege.toLowerCase().includes(privilege.toLowerCase())
          )
        );
      });
    }

    return new Response(
      JSON.stringify({
        data: usersWithCongregation,
        total: usersWithCongregation.length,
        filters: {
          searchTerm,
          day,
          turn,
          isActive: isActiveParam,
          privileges: privilegesParam
        }
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching filtered users for PDF:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch filtered users for PDF" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};