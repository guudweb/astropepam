// Store para gestionar funcionalidad de Undo/Redo en el programa
import type { WeekDay, Turno } from '../types/program';

export interface UndoRedoAction {
  type: 'assign' | 'remove' | 'bulk';
  timestamp: number;
  changes: ChangeRecord[];
}

export interface ChangeRecord {
  day: WeekDay;
  turno: Turno;
  index: number;
  previousValue: string;
  newValue: string;
}

export interface UndoRedoState {
  undoStack: UndoRedoAction[];
  redoStack: UndoRedoAction[];
  maxStackSize: number;
}

export class UndoRedoManager {
  private state: UndoRedoState;
  private listeners: Map<string, Function[]> = new Map();
  private isUndoRedoOperation: boolean = false;

  constructor(maxStackSize: number = 50) {
    this.state = {
      undoStack: [],
      redoStack: [],
      maxStackSize
    };
  }

  /**
   * Registra un cambio para poder deshacerlo
   */
  recordChange(change: ChangeRecord | ChangeRecord[], type: 'assign' | 'remove' | 'bulk' = 'assign') {
    // No registrar si estamos en medio de una operación de undo/redo
    if (this.isUndoRedoOperation) return;

    const changes = Array.isArray(change) ? change : [change];

    // No registrar si no hay cambios reales
    if (changes.every(c => c.previousValue === c.newValue)) return;

    const action: UndoRedoAction = {
      type,
      timestamp: Date.now(),
      changes
    };

    this.state.undoStack.push(action);

    // Limitar el tamaño del stack
    if (this.state.undoStack.length > this.state.maxStackSize) {
      this.state.undoStack.shift();
    }

    // Limpiar redo stack cuando se registra una nueva acción
    this.state.redoStack = [];

    this.emit('stack-changed', this.getStackInfo());
  }

  /**
   * Deshace la última acción
   * @returns Los cambios a aplicar (valores anteriores) o null si no hay nada que deshacer
   */
  undo(): ChangeRecord[] | null {
    if (!this.canUndo()) return null;

    this.isUndoRedoOperation = true;

    const action = this.state.undoStack.pop()!;
    this.state.redoStack.push(action);

    // Limitar el tamaño del redo stack
    if (this.state.redoStack.length > this.state.maxStackSize) {
      this.state.redoStack.shift();
    }

    this.emit('stack-changed', this.getStackInfo());
    this.isUndoRedoOperation = false;

    // Devolver los cambios con los valores anteriores para restaurar
    return action.changes.map(change => ({
      ...change,
      // Invertir: el "nuevo" valor es el anterior
      newValue: change.previousValue,
      previousValue: change.newValue
    }));
  }

  /**
   * Rehace la última acción deshecha
   * @returns Los cambios a aplicar (valores nuevos) o null si no hay nada que rehacer
   */
  redo(): ChangeRecord[] | null {
    if (!this.canRedo()) return null;

    this.isUndoRedoOperation = true;

    const action = this.state.redoStack.pop()!;
    this.state.undoStack.push(action);

    this.emit('stack-changed', this.getStackInfo());
    this.isUndoRedoOperation = false;

    // Devolver los cambios originales para reaplicar
    return action.changes;
  }

  /**
   * Verifica si se puede deshacer
   */
  canUndo(): boolean {
    return this.state.undoStack.length > 0;
  }

  /**
   * Verifica si se puede rehacer
   */
  canRedo(): boolean {
    return this.state.redoStack.length > 0;
  }

  /**
   * Obtiene información del estado actual de los stacks
   */
  getStackInfo(): { undoCount: number; redoCount: number; canUndo: boolean; canRedo: boolean } {
    return {
      undoCount: this.state.undoStack.length,
      redoCount: this.state.redoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  /**
   * Limpia ambos stacks (útil al cambiar de semana)
   */
  clear() {
    this.state.undoStack = [];
    this.state.redoStack = [];
    this.emit('stack-changed', this.getStackInfo());
  }

  /**
   * Obtiene la descripción de la última acción que se puede deshacer
   */
  getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    const action = this.state.undoStack[this.state.undoStack.length - 1];
    return this.getActionDescription(action, 'undo');
  }

  /**
   * Obtiene la descripción de la última acción que se puede rehacer
   */
  getRedoDescription(): string | null {
    if (!this.canRedo()) return null;
    const action = this.state.redoStack[this.state.redoStack.length - 1];
    return this.getActionDescription(action, 'redo');
  }

  private getActionDescription(action: UndoRedoAction, operation: 'undo' | 'redo'): string {
    const prefix = operation === 'undo' ? 'Deshacer' : 'Rehacer';

    if (action.changes.length === 1) {
      const change = action.changes[0];
      if (action.type === 'assign' || change.newValue) {
        return `${prefix}: asignar ${change.newValue || 'vacío'} en ${change.day} ${change.turno}`;
      } else {
        return `${prefix}: eliminar ${change.previousValue} de ${change.day} ${change.turno}`;
      }
    } else {
      return `${prefix}: ${action.changes.length} cambios`;
    }
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  /**
   * Limpieza
   */
  destroy() {
    this.listeners.clear();
    this.clear();
  }
}

// Singleton instance
export const undoRedoManager = new UndoRedoManager();
