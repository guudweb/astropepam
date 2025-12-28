import { db, WeekData, UserHistory, eq, and, gte, lte } from "astro:db";
import { validateDate, validateWeekData, createErrorResponse, createSuccessResponse, requireAdmin } from "../../utils/validation";

import type { APIRoute } from "astro";

// Función auxiliar para extraer participaciones del weekData
// CORREGIDO: Ahora parsea claves planas "lunes-T1-0" en lugar de estructura anidada
const extractParticipations = (weekData: any, baseDate: Date) => {
  const participations: Array<{
    userName: string;
    date: Date;
    day: string;
    turno: string;
    indexValue: number;
  }> = [];
  const daysOfWeek = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  if (weekData && typeof weekData === 'object') {
    Object.keys(weekData).forEach(key => {
      const value = weekData[key];

      // Parsear clave plana: "lunes-T1-0" -> { day: "lunes", turno: "T1", index: "0" }
      const parts = key.split('-');

      if (parts.length === 3) {
        const [day, turno, indexStr] = parts;
        const userName = value;

        // Validar que el valor sea un userName válido (string no vacío)
        if (userName && typeof userName === 'string' &&
            userName !== '--separator--' &&
            userName !== '--error--' &&
            userName !== 'add') {

          const dayIndex = daysOfWeek.indexOf(day.toLowerCase());

          if (dayIndex !== -1) {
            // Calcular la fecha específica del día
            const participationDate = new Date(baseDate);
            participationDate.setDate(baseDate.getDate() + dayIndex);

            participations.push({
              userName: userName,
              date: participationDate,
              day: day,
              turno: turno,
              indexValue: parseInt(indexStr, 10)
            });
          }
        }
      }
    });
  }

  return participations;
};

export const POST: APIRoute = async (context) => {
  try {
    // Verificar que el usuario sea admin
    const { error } = await requireAdmin(context);
    if (error) return error;

    const { date, weekData } = await context.request.json();
    
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

    // Insertar los nuevos registros en batch (más eficiente)
    if (participations.length > 0) {
      console.log(`[DEBUG] Insertando ${participations.length} nuevas participaciones en batch`);

      // Preparar valores para inserción batch
      const batchValues = participations.map(p => ({
        userName: p.userName,
        date: p.date,
        day: p.day,
        turno: p.turno,
        indexValue: p.indexValue
      }));

      // Insertar en lotes de 50 para evitar problemas con límites de BD
      const BATCH_SIZE = 50;
      for (let i = 0; i < batchValues.length; i += BATCH_SIZE) {
        const batch = batchValues.slice(i, i + BATCH_SIZE);
        await db.insert(UserHistory).values(batch).execute();
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
