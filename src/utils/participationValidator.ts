import type { ParticipationRule } from '@/interfaces/user.interface';

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
    selectedDate: Date
  ): Promise<ExtendedValidationResult> {
    const rules: ParticipationRule[] = typeof participationRules === 'string'
      ? JSON.parse(participationRules)
      : participationRules;

    if (!rules || rules.length === 0) {
      return {
        canParticipate: true,
        warnings: [],
        restrictions: [],
        icon: '✅',
        rulesDescription: []
      };
    }

    const userHistory = await this.getUserParticipationHistory(userName);
    const validation = this.validateUserParticipation(rules, selectedDate, userHistory);

    return {
      ...validation,
      icon: this.getUserStatusIcon(rules, selectedDate, userHistory),
      rulesDescription: rules.map(rule => this.getRuleDescription(rule))
    };
  }
}

// Exportar también como ParticipationValidatorJS para compatibilidad
export const ParticipationValidatorJS = ParticipationValidator;
