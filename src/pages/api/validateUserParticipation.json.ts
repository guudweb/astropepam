import type { APIRoute } from "astro";
import { db, UserHistory, Usuario, eq, and, gte, lte, asc } from "astro:db";

interface ParticipationRule {
  type: 'max_per_month' | 'max_per_week' | 'specific_weeks' | 'alternating_weeks';
  value: number | number[];
  description: string;
}

interface ValidationResult {
  canParticipate: boolean;
  reason?: string;
  warningMessage?: string;
  participationCount?: number;
  maxAllowed?: number;
}

// Función para validar reglas de participación
const validateParticipationRules = async (
  userName: string, 
  participationRules: ParticipationRule[], 
  selectedDate: Date
): Promise<ValidationResult> => {
  
  if (!participationRules || participationRules.length === 0) {
    return { canParticipate: true };
  }

  for (const rule of participationRules) {
    let fromDate: Date;
    let participationCount = 0;

    switch (rule.type) {
      case 'max_per_month':
        // Calcular inicio del mes
        fromDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        
        // Obtener participaciones del mes actual
        const monthlyHistory = await db
          .select()
          .from(UserHistory)
          .where(
            and(
              eq(UserHistory.userName, userName),
              gte(UserHistory.date, fromDate)
            )
          )
          .execute();

        participationCount = monthlyHistory.length;
        
        if (participationCount >= rule.value) {
          return {
            canParticipate: false,
            reason: `El usuario ya ha participado ${participationCount} veces este mes (máximo: ${rule.value})`,
            participationCount,
            maxAllowed: rule.value as number
          };
        } else if (participationCount >= (rule.value as number) - 1) {
          return {
            canParticipate: true,
            warningMessage: `⚠️ Atención: Este será el último turno del mes para ${userName} (${participationCount + 1}/${rule.value})`,
            participationCount,
            maxAllowed: rule.value as number
          };
        }
        break;

      case 'max_per_week':
        // Calcular inicio de la semana (lunes)
        const dayOfWeek = selectedDate.getDay();
        const diff = selectedDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        fromDate = new Date(selectedDate.setDate(diff));
        fromDate.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(fromDate);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyHistory = await db
          .select()
          .from(UserHistory)
          .where(
            and(
              eq(UserHistory.userName, userName),
              gte(UserHistory.date, fromDate),
              lte(UserHistory.date, endOfWeek)
            )
          )
          .execute();

        participationCount = weeklyHistory.length;
        
        if (participationCount >= rule.value) {
          return {
            canParticipate: false,
            reason: `El usuario ya ha participado ${participationCount} veces esta semana (máximo: ${rule.value})`,
            participationCount,
            maxAllowed: rule.value as number
          };
        }
        break;

      case 'specific_weeks':
        const weekNumbers = Array.isArray(rule.value) ? rule.value : [rule.value];
        const currentWeek = Math.ceil(selectedDate.getDate() / 7);
        
        if (!weekNumbers.includes(currentWeek)) {
          return {
            canParticipate: false,
            reason: `El usuario solo puede participar en las semanas: ${weekNumbers.join(', ')} (semana actual: ${currentWeek})`
          };
        }
        break;

      case 'alternating_weeks':
        // Obtener la primera participación del usuario para establecer el patrón
        const firstParticipation = await db
          .select()
          .from(UserHistory)
          .where(eq(UserHistory.userName, userName))
          .orderBy(asc(UserHistory.date))
          .limit(1)
          .execute();

        if (firstParticipation.length > 0) {
          const firstDate = firstParticipation[0].date;
          const weeksDifference = Math.floor((selectedDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          
          if (weeksDifference % 2 !== 0) {
            return {
              canParticipate: false,
              reason: `El usuario participa en semanas alternadas. Esta semana no le corresponde.`
            };
          }
        }
        break;
    }
  }

  return { canParticipate: true };
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { userName, selectedDate } = await request.json();

    if (!userName || !selectedDate) {
      return new Response(
        JSON.stringify({ 
          error: "userName and selectedDate are required",
          canParticipate: false 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener las reglas de participación del usuario
    const user = await db
      .select()
      .from(Usuario)
      .where(eq(Usuario.userName, userName))
      .execute();

    if (user.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Usuario no encontrado",
          canParticipate: false 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const participationRules = user[0].participation_rules as ParticipationRule[] || [];
    const validationDate = new Date(selectedDate);

    if (isNaN(validationDate.getTime())) {
      return new Response(
        JSON.stringify({ 
          error: "Formato de fecha inválido",
          canParticipate: false 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar las reglas
    const validation = await validateParticipationRules(userName, participationRules, validationDate);

    return new Response(
      JSON.stringify({
        userName,
        selectedDate,
        validation,
        ...validation
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error validating user participation:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
        canParticipate: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};