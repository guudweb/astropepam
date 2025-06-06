import type { ParticipationRule } from '@/interfaces/user.interface';

export interface ValidationResult {
  canParticipate: boolean;
  warnings: string[];
  restrictions: string[];
}

export interface UserParticipation {
  date: string;
  day: string;
  turno: string;
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

    const selectedWeek = this.getWeekOfMonth(selectedDate);
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

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

    const monthParticipations = userHistory.filter(p => {
      const pDate = new Date(p.date);
      return pDate.getMonth() === selectedMonth && pDate.getFullYear() === selectedYear;
    });

    if (monthParticipations.length >= maxParticipations) {
      result.canParticipate = false;
      result.restrictions.push(`Ya alcanzó el límite de ${maxParticipations} participaciones este mes`);
    } else if (monthParticipations.length === maxParticipations - 1) {
      result.warnings.push(`Esta será su última participación permitida este mes`);
    }
  }

  private static validateMaxPerWeek(
    rule: ParticipationRule,
    selectedDate: Date,
    userHistory: UserParticipation[],
    result: ValidationResult
  ) {
    const maxParticipations = rule.value as number;
    const weekStart = this.getWeekStart(selectedDate);
    const weekEnd = this.getWeekEnd(selectedDate);

    const weekParticipations = userHistory.filter(p => {
      const pDate = new Date(p.date);
      return pDate >= weekStart && pDate <= weekEnd;
    });

    if (weekParticipations.length >= maxParticipations) {
      result.canParticipate = false;
      result.restrictions.push(`Ya alcanzó el límite de ${maxParticipations} participaciones esta semana`);
    } else if (weekParticipations.length === maxParticipations - 1) {
      result.warnings.push(`Esta será su última participación permitida esta semana`);
    }
  }

  private static validateSpecificWeeks(
    rule: ParticipationRule,
    selectedWeek: number,
    result: ValidationResult
  ) {
    const allowedWeeks = rule.value as number[];
    
    if (!allowedWeeks.includes(selectedWeek)) {
      result.canParticipate = false;
      result.restrictions.push(`Solo puede participar en las semanas: ${allowedWeeks.join(', ')}`);
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
    const sortedHistory = userHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastParticipation = sortedHistory[0];
    const lastDate = new Date(lastParticipation.date);
    const selectedWeekStart = this.getWeekStart(selectedDate);
    const lastWeekStart = this.getWeekStart(lastDate);

    // Calcular la diferencia en semanas
    const diffInWeeks = Math.floor((selectedWeekStart.getTime() - lastWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

    if (diffInWeeks === 0) {
      result.canParticipate = false;
      result.restrictions.push('No puede participar dos veces en la misma semana (semanas alternadas)');
    } else if (diffInWeeks === 1) {
      result.canParticipate = false;
      result.restrictions.push('Debe esperar una semana antes de su próxima participación (semanas alternadas)');
    }
  }

  private static getWeekOfMonth(date: Date): number {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekDay = firstDay.getDay();
    const offsetDate = date.getDate() + firstWeekDay - 1;
    return Math.floor(offsetDate / 7) + 1;
  }

  private static getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    const newDate = new Date(date);
    newDate.setDate(diff);
    return newDate;
  }

  private static getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(new Date(date));
    return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
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
}