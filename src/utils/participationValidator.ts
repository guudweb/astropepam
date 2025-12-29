import type { ParticipationRule, Congregacion, Incidencia } from '@/interfaces/user.interface';

export interface ValidationResult {
  canParticipate: boolean;
  warnings: string[];
  restrictions: string[];
}

export interface ExtendedValidationResult extends ValidationResult {
  icon: string;
  rulesDescription: string[];
}

export interface UserParticipation {
  date: string;
  day: string;
  turno: string;
}

// Tipo flexible para congregación (acepta campos opcionales)
export interface CongregacionPartial {
  id?: number;
  nombre?: string;
  diaReunion?: string;
  turnoReunion?: string;
}

// Contexto adicional para validación de reunión e incidencias
export interface ValidationContext {
  congregacion?: CongregacionPartial | Congregacion;
  incidencias?: Incidencia[];
  day?: string; // Día de la semana seleccionado (lunes, martes, etc.)
  turno?: string; // Turno seleccionado (T1, T2, T3, T4)
}

// Nombres de meses en español
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Calcula la semana del mes para una fecha dada.
 * Considera el día de la semana en que comienza el mes para un cálculo más preciso.
 * @param date - Fecha para calcular
 * @returns Número de semana (1-5)
 */
export function calculateWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstWeekDay = firstDay.getDay();
  const offsetDate = date.getDate() + firstWeekDay - 1;
  return Math.floor(offsetDate / 7) + 1;
}

export class ParticipationValidator {
  static validateUserParticipation(
    rules: ParticipationRule[],
    selectedDate: Date,
    userHistory: UserParticipation[]
  ): ValidationResult {
    const result: ValidationResult = {
      canParticipate: true,
      warnings: [],
      restrictions: []
    };

    if (!rules || rules.length === 0) {
      return result;
    }

    const selectedWeek = calculateWeekOfMonth(selectedDate);

    for (const rule of rules) {
      switch (rule.type) {
        case 'max_per_month':
          this.validateMaxPerMonth(rule, selectedDate, userHistory, result);
          break;
        case 'max_per_week':
          this.validateMaxPerWeek(rule, selectedDate, userHistory, result);
          break;
        case 'specific_weeks':
          this.validateSpecificWeeks(rule, selectedWeek, result);
          break;
        case 'alternating_weeks':
          this.validateAlternatingWeeks(rule, selectedDate, userHistory, result);
          break;
        case 'weekly_availability':
          // Esta regla es solo informativa
          result.warnings.push('Este usuario envía su disponibilidad semanalmente');
          break;
      }
    }

    return result;
  }

  private static validateMaxPerMonth(
    rule: ParticipationRule,
    selectedDate: Date,
    userHistory: UserParticipation[],
    result: ValidationResult
  ) {
    const maxParticipations = rule.value as number;
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const monthName = MONTH_NAMES[selectedMonth];

    // Filtrar solo participaciones pasadas y actuales del mismo mes
    const currentDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    const monthParticipations = userHistory.filter(p => {
      const pDate = new Date(p.date);
      const pDateOnly = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
      const isSameMonth = pDate.getMonth() === selectedMonth && pDate.getFullYear() === selectedYear;
      const isPastOrCurrent = pDateOnly <= currentDateOnly;
      return isSameMonth && isPastOrCurrent;
    });

    if (monthParticipations.length >= maxParticipations) {
      result.canParticipate = false;
      result.restrictions.push(
        `No puede participar: Ya alcanzó el límite de ${maxParticipations} ` +
        `${maxParticipations === 1 ? 'participación' : 'participaciones'} en ${monthName} ` +
        `(tiene ${monthParticipations.length})`
      );
    } else if (monthParticipations.length === maxParticipations - 1) {
      result.warnings.push(
        `Advertencia: Esta será su última participación permitida en ${monthName} ` +
        `(${monthParticipations.length + 1} de ${maxParticipations})`
      );
    }
  }

  private static validateMaxPerWeek(
    rule: ParticipationRule,
    selectedDate: Date,
    userHistory: UserParticipation[],
    result: ValidationResult
  ) {
    const maxParticipations = rule.value as number;
    const weekStart = this.getWeekStart(new Date(selectedDate));
    const weekEnd = this.getWeekEnd(new Date(selectedDate));
    const currentDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    const weekParticipations = userHistory.filter(p => {
      const pDate = new Date(p.date);
      const pDateOnly = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
      const isInWeek = pDate >= weekStart && pDate <= weekEnd;
      const isPastOrCurrent = pDateOnly <= currentDateOnly;
      return isInWeek && isPastOrCurrent;
    });

    if (weekParticipations.length >= maxParticipations) {
      result.canParticipate = false;
      result.restrictions.push(
        `No puede participar: Ya alcanzó el límite de ${maxParticipations} ` +
        `${maxParticipations === 1 ? 'participación' : 'participaciones'} esta semana ` +
        `(tiene ${weekParticipations.length})`
      );
    } else if (weekParticipations.length === maxParticipations - 1) {
      result.warnings.push(
        `Advertencia: Esta será su última participación permitida esta semana ` +
        `(${weekParticipations.length + 1} de ${maxParticipations})`
      );
    }
  }

  private static validateSpecificWeeks(
    rule: ParticipationRule,
    selectedWeek: number,
    result: ValidationResult
  ) {
    const allowedWeeks = Array.isArray(rule.value) ? rule.value : [rule.value];

    if (!allowedWeeks.includes(selectedWeek)) {
      result.canParticipate = false;
      result.restrictions.push(
        `No puede participar: Solo puede participar en las semanas ${allowedWeeks.join(', ')} ` +
        `del mes (esta es la semana ${selectedWeek})`
      );
    } else {
      result.warnings.push(`Información: Puede participar esta semana (semana ${selectedWeek} está permitida)`);
    }
  }

  private static validateAlternatingWeeks(
    rule: ParticipationRule,
    selectedDate: Date,
    userHistory: UserParticipation[],
    result: ValidationResult
  ) {
    if (userHistory.length === 0) {
      return; // Primera participación, puede participar
    }

    // Ordenar historial por fecha (más reciente primero)
    const sortedHistory = [...userHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastParticipation = sortedHistory[0];
    const lastDate = new Date(lastParticipation.date);
    const selectedWeekStart = this.getWeekStart(new Date(selectedDate));
    const lastWeekStart = this.getWeekStart(new Date(lastDate));

    // Calcular la diferencia en semanas
    const diffInWeeks = Math.floor(
      (selectedWeekStart.getTime() - lastWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    if (diffInWeeks === 0) {
      result.canParticipate = false;
      result.restrictions.push(
        `No puede participar: Ya participó esta semana el ${lastParticipation.date} (regla: semanas alternadas)`
      );
    } else if (diffInWeeks === 1) {
      result.canParticipate = false;
      result.restrictions.push(
        `No puede participar: Debe esperar una semana más. Última participación: ${lastParticipation.date} (regla: semanas alternadas)`
      );
    } else if (diffInWeeks > 1) {
      result.warnings.push(
        `Información: Puede participar. Última participación fue el ${lastParticipation.date} (hace ${diffInWeeks} semanas)`
      );
    }
  }

  private static getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    const newDate = new Date(date);
    newDate.setDate(diff);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  private static getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(new Date(date));
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  static getUserStatusIcon(
    rules: ParticipationRule[],
    selectedDate: Date,
    userHistory: UserParticipation[]
  ): string {
    if (!rules || rules.length === 0) {
      return '✅'; // Sin restricciones
    }

    const validation = this.validateUserParticipation(rules, selectedDate, userHistory);

    if (!validation.canParticipate) {
      return '🚫'; // No puede participar
    } else if (validation.warnings.length > 0) {
      return '⚠️'; // Puede participar pero con advertencias
    } else {
      return '✅'; // Puede participar sin problemas
    }
  }

  // Obtener descripción legible de una regla
  static getRuleDescription(rule: ParticipationRule): string {
    switch (rule.type) {
      case 'max_per_month':
        return `Máximo ${rule.value} ${rule.value === 1 ? 'vez' : 'veces'} al mes`;
      case 'max_per_week':
        return `Máximo ${rule.value} ${rule.value === 1 ? 'vez' : 'veces'} por semana`;
      case 'specific_weeks':
        const weeks = Array.isArray(rule.value) ? rule.value : [rule.value];
        return `Solo semanas: ${weeks.join(', ')}`;
      case 'alternating_weeks':
        return 'Semanas alternadas (una sí, una no)';
      case 'weekly_availability':
        return 'Envía su disponibilidad semanalmente';
      default:
        return rule.description || '';
    }
  }

  // Obtener historial de participaciones desde la API (para uso en cliente)
  static async getUserParticipationHistory(userName: string, fromDate?: Date): Promise<UserParticipation[]> {
    try {
      const url = new URL('/api/getUserParticipationHistory.json', window.location.origin);
      url.searchParams.append('userName', userName);
      if (fromDate) {
        url.searchParams.append('fromDate', fromDate.toISOString().split('T')[0]);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.error(`Error fetching participation history: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user participation history:', error);
      return [];
    }
  }

  // Validación completa para uso en cliente con llamada a API
  static async validateUserForDate(
    userName: string,
    participationRules: ParticipationRule[] | string,
    selectedDate: Date,
    context?: ValidationContext
  ): Promise<ExtendedValidationResult> {
    const rules: ParticipationRule[] = typeof participationRules === 'string'
      ? JSON.parse(participationRules)
      : participationRules;

    const result: ExtendedValidationResult = {
      canParticipate: true,
      warnings: [],
      restrictions: [],
      icon: '✅',
      rulesDescription: []
    };

    // Validar reglas de participación si existen
    if (rules && rules.length > 0) {
      const userHistory = await this.getUserParticipationHistory(userName);
      const ruleValidation = this.validateUserParticipation(rules, selectedDate, userHistory);

      result.canParticipate = ruleValidation.canParticipate;
      result.warnings.push(...ruleValidation.warnings);
      result.restrictions.push(...ruleValidation.restrictions);
      result.rulesDescription = rules.map(rule => this.getRuleDescription(rule));
    }

    // Validar conflicto con reunión de congregación
    console.log('🔍 validateUserForDate - Checking meeting conflict:', {
      hasCongregacion: !!context?.congregacion,
      hasDay: !!context?.day,
      hasTurno: !!context?.turno,
      congregacion: context?.congregacion
    });

    if (context?.congregacion && context?.day && context?.turno) {
      const meetingConflict = this.validateMeetingConflict(
        context.congregacion,
        context.day,
        context.turno
      );

      console.log('🔍 validateUserForDate - Meeting conflict result:', meetingConflict);

      if (meetingConflict.hasConflict) {
        result.canParticipate = false;
        result.restrictions.push(meetingConflict.message);
      }
    }

    // Validar incidencias activas
    console.log('🔍 validateUserForDate - Checking incidencias:', {
      hasIncidencias: !!context?.incidencias,
      incidenciasCount: context?.incidencias?.length || 0
    });

    if (context?.incidencias && context.incidencias.length > 0) {
      const incidenciaConflict = this.validateIncidencias(
        context.incidencias,
        selectedDate
      );

      console.log('🔍 validateUserForDate - Incidencia conflict result:', incidenciaConflict);

      if (incidenciaConflict.hasConflict) {
        result.canParticipate = false;
        result.restrictions.push(...incidenciaConflict.messages);
      }
    }

    // Actualizar icono según resultado final
    if (!result.canParticipate) {
      result.icon = '🚫';
    } else if (result.warnings.length > 0) {
      result.icon = '⚠️';
    } else {
      result.icon = '✅';
    }

    return result;
  }

  /**
   * Valida si hay conflicto con la reunión de la congregación del usuario
   * @param congregacion - Datos de la congregación del usuario
   * @param day - Día seleccionado (lunes, martes, etc.)
   * @param turno - Turno seleccionado (T1, T2, T3, T4)
   * @returns Objeto con información del conflicto
   */
  static validateMeetingConflict(
    congregacion: CongregacionPartial | Congregacion,
    day: string,
    turno: string
  ): { hasConflict: boolean; message: string } {
    if (!congregacion?.diaReunion || !congregacion?.turnoReunion) {
      return { hasConflict: false, message: '' };
    }

    // Normalizar los valores para comparación (minúsculas, sin acentos)
    const normalizeString = (str: string) =>
      str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const selectedDay = normalizeString(day);
    const meetingDay = normalizeString(congregacion.diaReunion);
    const selectedTurno = turno.toUpperCase();
    const meetingTurno = congregacion.turnoReunion.toUpperCase();

    if (selectedDay === meetingDay && selectedTurno === meetingTurno) {
      return {
        hasConflict: true,
        message: `⛪ Conflicto de reunión: La congregación "${congregacion.nombre}" tiene reunión el ${congregacion.diaReunion} en el turno ${congregacion.turnoReunion}`
      };
    }

    return { hasConflict: false, message: '' };
  }

  /**
   * Valida si el usuario tiene incidencias activas para la fecha seleccionada
   * @param incidencias - Lista de incidencias del usuario
   * @param selectedDate - Fecha seleccionada
   * @returns Objeto con información de conflictos de incidencias
   */
  static validateIncidencias(
    incidencias: Incidencia[],
    selectedDate: Date
  ): { hasConflict: boolean; messages: string[] } {
    const messages: string[] = [];
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    for (const incidencia of incidencias) {
      if (!incidencia.activo) continue;

      const fechaInicio = new Date(incidencia.fechaInicio);
      const fechaFin = new Date(incidencia.fechaFin);

      // Normalizar fechas (solo día, sin hora)
      const inicioOnly = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
      const finOnly = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());

      if (selectedDateOnly >= inicioOnly && selectedDateOnly <= finOnly) {
        const formatDate = (d: Date) => d.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        });

        messages.push(
          `📋 Incidencia activa: "${incidencia.motivo}" ` +
          `(${formatDate(inicioOnly)} - ${formatDate(finOnly)})`
        );
      }
    }

    return {
      hasConflict: messages.length > 0,
      messages
    };
  }

  /**
   * Obtener incidencias activas de un usuario desde la API
   * @param userName - Nombre de usuario
   * @param fromDate - Fecha desde la cual buscar incidencias (opcional)
   * @returns Lista de incidencias activas
   */
  static async getUserIncidencias(userName: string, fromDate?: Date): Promise<Incidencia[]> {
    try {
      const url = new URL('/api/incidencias/getByUser.json', window.location.origin);
      url.searchParams.append('userName', userName);
      if (fromDate) {
        url.searchParams.append('fromDate', fromDate.toISOString().split('T')[0]);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.error(`Error fetching incidencias: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user incidencias:', error);
      return [];
    }
  }

  /**
   * Validación completa con contexto (incluyendo reunión e incidencias)
   * @param userName - Nombre de usuario
   * @param participationRules - Reglas de participación
   * @param selectedDate - Fecha seleccionada
   * @param congregacion - Datos de la congregación
   * @param day - Día de la semana
   * @param turno - Turno
   * @returns Resultado de validación extendido
   */
  static async validateUserComplete(
    userName: string,
    participationRules: ParticipationRule[] | string,
    selectedDate: Date,
    congregacion?: CongregacionPartial | Congregacion,
    day?: string,
    turno?: string
  ): Promise<ExtendedValidationResult> {
    // Obtener incidencias del usuario
    const incidencias = await this.getUserIncidencias(userName, selectedDate);

    // Debug: Log de datos recibidos para validación
    console.log('🔍 validateUserComplete - userName:', userName);
    console.log('🔍 validateUserComplete - selectedDate:', selectedDate);
    console.log('🔍 validateUserComplete - congregacion:', congregacion);
    console.log('🔍 validateUserComplete - day:', day, 'turno:', turno);
    console.log('🔍 validateUserComplete - incidencias encontradas:', incidencias.length, incidencias);

    return this.validateUserForDate(
      userName,
      participationRules,
      selectedDate,
      {
        congregacion,
        incidencias,
        day,
        turno
      }
    );
  }
}

// Exportar también como ParticipationValidatorJS para compatibilidad
export const ParticipationValidatorJS = ParticipationValidator;
