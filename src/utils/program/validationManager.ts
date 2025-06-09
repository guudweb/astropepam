// Utilidades para gestión de validaciones
import type { ValidationResult, ValidationState, UserData, WeekDay, Turno } from '../../types/program';
import { ParticipationValidatorJS } from '../participationValidator.js';

export class ValidationManager {
  private static debounceTimeouts = new Map<string, NodeJS.Timeout>();
  private static readonly DEBOUNCE_DELAY = 300;

  static async validateUserAssignment(
    userName: string,
    day: WeekDay,
    turno: Turno,
    index: number,
    selectedDate: Date,
    user?: UserData
  ): Promise<ValidationResult> {
    try {
      // Si no tenemos los datos del usuario, intentar obtenerlos del store o API
      if (!user) {
        // Aquí podríamos obtener del store o hacer una consulta API
        console.warn('User data not provided for validation');
        return {
          canParticipate: true,
          warnings: [],
          restrictions: [],
          icon: '✅'
        };
      }

      // Si el usuario no tiene reglas de participación, permitir
      if (!user.participation_rules || user.participation_rules.length === 0) {
        return {
          canParticipate: true,
          warnings: [],
          restrictions: [],
          icon: '✅'
        };
      }

      // Verificar si tiene la condición de disponibilidad semanal
      const hasWeeklyAvailabilityRule = user.participation_rules.some(
        rule => rule.type === 'weekly_availability'
      );

      if (hasWeeklyAvailabilityRule) {
        // Mostrar notificación directamente usando notify (si está disponible)
        if (typeof window !== 'undefined' && (window as any).notify) {
          (window as any).notify.info(`${userName}: Envía su disponibilidad semanalmente`);
        }
      }

      // Validar con el sistema existente
      const validation = await ParticipationValidatorJS.validateUserForDate(
        userName,
        user.participation_rules,
        selectedDate
      );

      return validation;
    } catch (error) {
      console.error('Error validating user assignment:', error);
      return {
        canParticipate: true,
        warnings: [],
        restrictions: ['Error en validación'],
        icon: '❌'
      };
    }
  }

  static async validateUserAssignmentDebounced(
    userName: string,
    day: WeekDay,
    turno: Turno,
    index: number,
    selectedDate: Date,
    user?: UserData,
    callback?: (result: ValidationResult) => void
  ): Promise<void> {
    const key = `${userName}-${day}-${turno}-${index}`;
    
    // Cancelar timeout anterior si existe
    if (this.debounceTimeouts.has(key)) {
      clearTimeout(this.debounceTimeouts.get(key)!);
    }

    // Crear nuevo timeout
    const timeoutId = setTimeout(async () => {
      const result = await this.validateUserAssignment(userName, day, turno, index, selectedDate, user);
      if (callback) {
        callback(result);
      }
      this.debounceTimeouts.delete(key);
    }, this.DEBOUNCE_DELAY);

    this.debounceTimeouts.set(key, timeoutId);
  }

  static findAssignmentConflicts(userName: string, weekData: Record<string, string>, excludeKey?: string): string[] {
    const conflicts: string[] = [];
    
    Object.entries(weekData).forEach(([key, assignedUser]) => {
      if (key !== excludeKey && assignedUser === userName) {
        const [day, turno] = key.split('-');
        conflicts.push(`${day} en el turno ${turno}`);
      }
    });

    return conflicts;
  }

  static createValidationState(
    userName: string,
    validationResult: ValidationResult
  ): ValidationState {
    return {
      userName,
      hasRestrictions: !validationResult.canParticipate,
      hasWarnings: validationResult.warnings.length > 0,
      canParticipate: validationResult.canParticipate
    };
  }

  static getValidationIcon(validationResult: ValidationResult): string {
    if (!validationResult.canParticipate) {
      return '🚫';
    } else if (validationResult.warnings.length > 0) {
      return '⚠️';
    } else {
      return '✅';
    }
  }

  static formatValidationMessages(validationResult: ValidationResult, fullName: string): {
    restrictions: string[];
    warnings: string[];
    success: string[];
  } {
    return {
      restrictions: validationResult.restrictions.map(r => `${fullName}: ${r}`),
      warnings: validationResult.warnings.map(w => `${fullName}: ${w}`),
      success: validationResult.canParticipate && validationResult.warnings.length === 0 
        ? [`${fullName}: ✓ Cumple todas las condiciones`]
        : []
    };
  }

  static shouldShowValidationMessage(
    currentState: ValidationState | undefined,
    newState: ValidationState,
    wasUserChanged: boolean
  ): {
    showRestrictions: boolean;
    showWarnings: boolean;
    showSuccess: boolean;
    showImprovement: boolean;
  } {
    // Si no hay estado previo o cambió de usuario, mostrar todo
    if (!currentState || wasUserChanged) {
      return {
        showRestrictions: !newState.canParticipate,
        showWarnings: newState.canParticipate && newState.hasWarnings,
        showSuccess: newState.canParticipate && !newState.hasWarnings,
        showImprovement: false
      };
    }

    // Si es el mismo usuario, solo mostrar cambios de estado
    const hadRestrictions = currentState.hasRestrictions;
    const hadWarnings = currentState.hasWarnings;
    const hasRestrictions = newState.hasRestrictions;
    const hasWarnings = newState.hasWarnings;

    return {
      showRestrictions: hasRestrictions && !hadRestrictions,
      showWarnings: hasWarnings && !hadWarnings && !hadRestrictions,
      showSuccess: !hasRestrictions && !hasWarnings && (hadRestrictions || hadWarnings),
      showImprovement: hadRestrictions && !hasRestrictions && hasWarnings
    };
  }

  static cleanup() {
    this.debounceTimeouts.forEach(timeout => clearTimeout(timeout));
    this.debounceTimeouts.clear();
  }
}