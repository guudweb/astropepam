// Utilidades para gestión de datos de semana
import type { WeekData, UserAssignment, WeekDay, Turno } from '../../types/program';

export class WeekDataManager {
  static async loadWeekData(date: Date): Promise<WeekData> {
    try {
      const response = await fetch(
        `/api/getWeekData.json?date=${date.toISOString().split("T")[0]}`
      );
      
      if (!response.ok) {
        console.warn('No week data found for date:', date);
        return {};
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching week data:", error);
      return {};
    }
  }

  static async saveWeekData(weekData: WeekData, date: Date): Promise<{ success: boolean; error?: string }> {
    try {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      const weekDate = startOfWeek.toISOString().split("T")[0];

      // Preparar datos para guardar
      const userHistoryPromises: Promise<any>[] = [];
      const cleanWeekData: WeekData = {};

      // Procesar cada asignación
      Object.entries(weekData).forEach(([key, userName]) => {
        if (userName && userName !== "--separator--" && userName !== "--error--" && userName !== "add") {
          cleanWeekData[key] = userName;

          // Extraer información de la clave
          const [day, turno, index] = key.split('-');

          // Verificar y guardar en UserHistory
          const userHistoryPromise = fetch(
            `/api/checkUserHistory.json?userName=${userName}&date=${weekDate}&day=${day}&turno=${turno}&indexValue=${index}`
          )
            .then((response) => response.json())
            .then((data) => {
              if (!data.exists) {
                return fetch("/api/saveUserHistory.json", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userName,
                    date: weekDate,
                    day,
                    turno,
                    indexValue: index,
                  }),
                });
              }
            });

          userHistoryPromises.push(userHistoryPromise);
        }
      });

      // Esperar a que se completen las operaciones de UserHistory
      await Promise.all(userHistoryPromises);

      // Guardar datos de semana
      const response = await fetch("/api/saveWeekData.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: weekDate,
          weekData: cleanWeekData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving week data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async loadPreajustesData(preajusteName: string): Promise<WeekData> {
    try {
      const response = await fetch(
        `/api/getPreajustesData.json?name=${encodeURIComponent(preajusteName)}`
      );
      
      if (!response.ok) {
        throw new Error('Error loading preajustes data');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error loading preajustes data:", error);
      return {};
    }
  }

  static async savePreajustesData(weekData: WeekData, preajusteName: string = "Preajuste1"): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanData: WeekData = {};
      
      // Filtrar solo asignaciones válidas
      Object.entries(weekData).forEach(([key, userName]) => {
        if (userName && userName !== "--separator--" && userName !== "--error--" && userName !== "add") {
          cleanData[key] = userName;
        }
      });

      const response = await fetch("/api/savePreajustesData.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: preajusteName,
          preajusteData: cleanData,
        }),
      });

      if (!response.ok) {
        throw new Error('Error saving preajustes data');
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving preajustes data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static getAssignmentKey(day: WeekDay, turno: Turno, index: number): string {
    return `${day}-${turno}-${index}`;
  }

  static parseAssignmentKey(key: string): { day: WeekDay; turno: Turno; index: number } | null {
    const parts = key.split('-');
    if (parts.length !== 3) return null;

    const [day, turno, indexStr] = parts;
    const index = parseInt(indexStr, 10);

    if (isNaN(index)) return null;

    return {
      day: day as WeekDay,
      turno: turno as Turno,
      index
    };
  }

  static createAssignment(day: WeekDay, turno: Turno, index: number, userName: string, date: Date): UserAssignment {
    return {
      day,
      turno,
      index,
      userName,
      date: date.toISOString().split('T')[0]
    };
  }

  static getAllAssignments(weekData: WeekData, weekDates: Date[]): UserAssignment[] {
    const assignments: UserAssignment[] = [];
    
    Object.entries(weekData).forEach(([key, userName]) => {
      if (!userName) return;
      
      const parsed = this.parseAssignmentKey(key);
      if (!parsed) return;

      const dayIndex = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].indexOf(parsed.day);
      if (dayIndex === -1 || !weekDates[dayIndex]) return;

      assignments.push(this.createAssignment(
        parsed.day,
        parsed.turno,
        parsed.index,
        userName,
        weekDates[dayIndex]
      ));
    });

    return assignments;
  }

  static findUserConflicts(userName: string, weekData: WeekData): string[] {
    const assignments: string[] = [];
    
    Object.entries(weekData).forEach(([key, assignedUser]) => {
      if (assignedUser === userName) {
        const parsed = this.parseAssignmentKey(key);
        if (parsed) {
          assignments.push(`${parsed.day} en el turno ${parsed.turno}`);
        }
      }
    });

    return assignments;
  }
}