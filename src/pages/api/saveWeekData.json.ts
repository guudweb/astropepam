import { db, WeekData, UserHistory, eq, and, gte, lte } from "astro:db";
import { validateDate, validateWeekData, sanitizeString, createErrorResponse, createSuccessResponse } from "../../utils/validation";

import type { APIRoute } from "astro";

// Función auxiliar para extraer participaciones del weekData
const extractParticipations = (weekData: any, baseDate: Date) => {
  const participations = [];
  const daysOfWeek = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  
  if (weekData && typeof weekData === 'object') {
    Object.keys(weekData).forEach(dayKey => {
      const dayData = weekData[dayKey];
      if (dayData && typeof dayData === 'object') {
        
        // Calcular la fecha específica del día
        const dayIndex = daysOfWeek.indexOf(dayKey.toLowerCase());
        if (dayIndex !== -1) {
          const participationDate = new Date(baseDate);
          participationDate.setDate(baseDate.getDate() + dayIndex);
          
          // Recorrer los turnos del día
          Object.keys(dayData).forEach(turnoKey => {
            const turnoData = dayData[turnoKey];
            if (turnoData && typeof turnoData === 'object') {
              
              // Recorrer los índices del turno
              Object.keys(turnoData).forEach(indexKey => {
                const userData = turnoData[indexKey];
                if (userData && userData.userName) {
                  participations.push({
                    userName: userData.userName,
                    date: participationDate,
                    day: dayKey,
                    turno: turnoKey,
                    indexValue: parseInt(indexKey)
                  });
                }
              });
            }
          });
        }
      }
    });
  }
  
  return participations;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { date, weekData } = await request.json();
    
    // Validar fecha
    const validDate = validateDate(date);
    if (!validDate) {
      return createErrorResponse("Formato de fecha inválido o fecha fuera del rango permitido", 400);
    }

    // Validar estructura de weekData
    const weekDataValidation = validateWeekData(weekData);
    if (!weekDataValidation.valid) {
      return createErrorResponse("Datos de semana inválidos", 400, weekDataValidation.errors);
    }

    // Guardar/actualizar los datos de la semana
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

    // Extraer y guardar las participaciones individuales en UserHistory
    const participations = extractParticipations(weekData, validDate);
    
    // SIEMPRE eliminar registros existentes para esta semana
    // (incluso si no hay nuevas participaciones)
    const startOfWeek = new Date(validDate);
    const endOfWeek = new Date(validDate);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    console.log(`[DEBUG] Eliminando historial de la semana ${startOfWeek.toISOString().split('T')[0]} a ${endOfWeek.toISOString().split('T')[0]}`);
    
    await db
      .delete(UserHistory)
      .where(
        and(
          gte(UserHistory.date, startOfWeek),
          lte(UserHistory.date, endOfWeek)
        )
      )
      .execute();

    // Insertar los nuevos registros (solo si hay participaciones)
    if (participations.length > 0) {
      console.log(`[DEBUG] Insertando ${participations.length} nuevas participaciones`);
      for (const participation of participations) {
        await db
          .insert(UserHistory)
          .values({
            userName: participation.userName,
            date: participation.date,
            day: participation.day,
            turno: participation.turno,
            indexValue: participation.indexValue
          })
          .execute();
      }
    } else {
      console.log(`[DEBUG] No hay nuevas participaciones que insertar - historial limpio`);
    }

    return createSuccessResponse({ 
      message: "Data saved successfully",
      participationsRecorded: participations.length,
      weekCleaned: true,
      weekRange: `${startOfWeek.toISOString().split('T')[0]} to ${endOfWeek.toISOString().split('T')[0]}`
    });
  } catch (error) {
    console.error("Error saving data:", error);
    return createErrorResponse(
      "Error interno del servidor al guardar datos", 
      500, 
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
