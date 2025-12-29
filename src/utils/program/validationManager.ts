// Utilidades para gestión de validaciones
import type { ValidationResult, ValidationState, UserData, WeekDay, Turno } from '../../types/program';
import { ParticipationValidatorJS } from '../participationValidator';

// Cache de validaciones para evitar recálculos costosos
interface ValidationCacheEntry {
  result: ValidationResult;
  timestamp: number;
  weekKey: string; // Para invalidar al cambiar de semana
}

export class ValidationManager {
  private static debounceTimeouts = new Map<string, NodeJS.Timeout>();
  private static readonly DEBOUNCE_DELAY = 300;

  // Cache de validaciones
  private static validationCache = new Map<string, ValidationCacheEntry>();
  private static readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutos
  private static currentWeekKey: string = '';

  // Batch de validaciones pendientes para procesamiento eficiente
  private static pendingValidations = new Map<string, {
    userName: string;
    day: WeekDay;
    turno: Turno;
    index: number;
    selectedDate: Date;
    user?: UserData;
    callback?: (result: ValidationResult) => void;
  }>();
  private static batchProcessTimeout: NodeJS.Timeout | null = null;
  private static readonly BATCH_DELAY = 50; // 50ms para agrupar validaciones

  // Generar clave única para cache basada en usuario, semana, día y turno
  // IMPORTANTE: Incluir día y turno porque la validación de reunión depende de estos valores
  private static getCacheKey(userName: string, selectedDate: Date, day?: string, turno?: string): string {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const baseKey = `${userName}-${weekStart.toISOString().split('T')[0]}`;
    // Si hay día y turno, incluirlos en la clave para diferenciar validaciones de reunión
    if (day && turno) {
      return `${baseKey}-${day}-${turno}`;
    }
    return baseKey;
  }

  // Obtener clave de semana para invalidación
  private static getWeekKey(date: Date): string {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    return weekStart.toISOString().split('T')[0];
  }

  // Establecer semana actual (llamar al cambiar de semana)
  static setCurrentWeek(date: Date): void {
    const newWeekKey = this.getWeekKey(date);
    if (newWeekKey !== this.currentWeekKey) {
      this.currentWeekKey = newWeekKey;
      // Limpiar cache de semanas anteriores
      this.clearOldCache();
    }
  }

  // Limpiar cache antiguo
  private static clearOldCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.validationCache.forEach((entry, key) => {
      if (entry.weekKey !== this.currentWeekKey || now - entry.timestamp > this.CACHE_DURATION) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.validationCache.delete(key));
  }

  // Invalidar cache de un usuario específico (cuando cambian sus asignaciones)
  static invalidateUserCache(userName: string): void {
    const keysToDelete: string[] = [];
    this.validationCache.forEach((_, key) => {
      if (key.startsWith(userName + '-')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.validationCache.delete(key));
  }

  // Limpiar todo el cache
  static clearCache(): void {
    this.validationCache.clear();
  }

  static async validateUserAssignment(
    userName: string,
    day: WeekDay,
    turno: Turno,
    index: number,
    selectedDate: Date,
    user?: UserData,
    skipCache: boolean = false
  ): Promise<ValidationResult> {
    try {
      // Verificar cache (si no se salta)
      const cacheKey = this.getCacheKey(userName, selectedDate, day, turno);
      if (!skipCache && this.validationCache.has(cacheKey)) {
        const cached = this.validationCache.get(cacheKey)!;
        const now = Date.now();

        if (cached.weekKey === this.currentWeekKey &&
            now - cached.timestamp < this.CACHE_DURATION) {
          return cached.result;
        }
      }

      // Validar con el sistema existente (incluyendo reunión e incidencias)
      const validation = await ParticipationValidatorJS.validateUserComplete(
        userName,
        user?.participation_rules || [],
        selectedDate,
        user?.congregacion,
        day,
        turno
      );

      // Guardar en cache
      this.validationCache.set(cacheKey, {
        result: validation,
        timestamp: Date.now(),
        weekKey: this.currentWeekKey || this.getWeekKey(selectedDate)
      });

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

  // Validar múltiples usuarios en batch (más eficiente)
  static async validateBatch(
    validations: Array<{
      userName: string;
      day: WeekDay;
      turno: Turno;
      index: number;
      selectedDate: Date;
      user?: UserData;
    }>
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    // Procesar en paralelo para mejor rendimiento
    const promises = validations.map(async (v) => {
      const key = `${v.day}-${v.turno}-${v.index}`;
      const result = await this.validateUserAssignment(
        v.userName, v.day, v.turno, v.index, v.selectedDate, v.user
      );
      return { key, result };
    });

    const resolvedResults = await Promise.all(promises);
    resolvedResults.forEach(({ key, result }) => {
      results.set(key, result);
    });

    return results;
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
    this.validationCache.clear();
    this.pendingValidations.clear();
    if (this.batchProcessTimeout) {
      clearTimeout(this.batchProcessTimeout);
      this.batchProcessTimeout = null;
    }
  }

  // Obtener estadísticas del cache (para debugging)
  static getCacheStats(): { size: number; currentWeek: string } {
    return {
      size: this.validationCache.size,
      currentWeek: this.currentWeekKey
    };
  }
}