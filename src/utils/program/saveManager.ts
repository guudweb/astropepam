// Gestor de guardado optimizado con debouncing y retry
import type { WeekData } from '../../types/program';

export interface SaveResult {
  success: boolean;
  message: string;
  participationsRecorded?: number;
  error?: string;
}

export interface SaveOptions {
  immediate?: boolean;
  silent?: boolean;
  retryCount?: number;
}

export class SaveManager {
  private static instance: SaveManager;
  private pendingSave: WeekData | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private isSaving: boolean = false;
  private lastSaveTime: number = 0;
  private saveQueue: Array<{ data: WeekData; date: string; resolve: Function; reject: Function }> = [];

  // Configuración
  private readonly DEBOUNCE_DELAY = 1500; // 1.5 segundos
  private readonly MIN_SAVE_INTERVAL = 2000; // Mínimo 2 segundos entre guardados
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private listeners: Map<string, Function[]> = new Map();

  private constructor() {}

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  // Programar guardado con debounce
  scheduleSave(weekData: WeekData, date: string, options: SaveOptions = {}): Promise<SaveResult> {
    return new Promise((resolve, reject) => {
      // Si es inmediato, no usar debounce
      if (options.immediate) {
        this.executeSave(weekData, date, options.retryCount || 0)
          .then(resolve)
          .catch(reject);
        return;
      }

      // Cancelar guardado pendiente
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      // Actualizar datos pendientes
      this.pendingSave = weekData;

      // Agregar a la cola
      this.saveQueue.push({ data: weekData, date, resolve, reject });

      // Programar guardado
      this.saveTimeout = setTimeout(() => {
        this.processSaveQueue();
      }, this.DEBOUNCE_DELAY);

      this.emit('save-scheduled', { date });
    });
  }

  // Procesar cola de guardado
  private async processSaveQueue(): Promise<void> {
    if (this.saveQueue.length === 0) return;

    // Tomar el último elemento (más actualizado)
    const lastSave = this.saveQueue[this.saveQueue.length - 1];
    const allResolvers = this.saveQueue.map(s => s.resolve);
    const allRejecters = this.saveQueue.map(s => s.reject);

    // Limpiar cola
    this.saveQueue = [];
    this.pendingSave = null;

    try {
      const result = await this.executeSave(lastSave.data, lastSave.date, 0);

      // Resolver todos los promises pendientes
      allResolvers.forEach(resolve => resolve(result));
    } catch (error) {
      // Rechazar todos los promises
      allRejecters.forEach(reject => reject(error));
    }
  }

  // Ejecutar guardado real
  private async executeSave(weekData: WeekData, date: string, retryCount: number): Promise<SaveResult> {
    // Verificar intervalo mínimo
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveTime;

    if (timeSinceLastSave < this.MIN_SAVE_INTERVAL && !this.isSaving) {
      // Esperar el tiempo restante
      await new Promise(resolve =>
        setTimeout(resolve, this.MIN_SAVE_INTERVAL - timeSinceLastSave)
      );
    }

    // Evitar guardados simultáneos
    if (this.isSaving) {
      return new Promise((resolve, reject) => {
        this.saveQueue.push({ data: weekData, date, resolve, reject });
      });
    }

    this.isSaving = true;
    this.emit('save-started', { date });

    try {
      const response = await fetch('/api/saveWeekData.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, weekData })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar');
      }

      this.lastSaveTime = Date.now();
      this.emit('save-completed', { date, result });

      return {
        success: true,
        message: 'Guardado exitosamente',
        participationsRecorded: result.participationsRecorded
      };

    } catch (error) {
      console.error('Error saving:', error);

      // Reintentar si no hemos alcanzado el límite
      if (retryCount < this.MAX_RETRIES) {
        console.log(`Reintentando guardado (${retryCount + 1}/${this.MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.executeSave(weekData, date, retryCount + 1);
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.emit('save-failed', { date, error: errorMessage });

      return {
        success: false,
        message: 'Error al guardar',
        error: errorMessage
      };

    } finally {
      this.isSaving = false;
    }
  }

  // Forzar guardado inmediato
  async forceFlush(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    if (this.saveQueue.length > 0) {
      await this.processSaveQueue();
    }
  }

  // Verificar si hay cambios pendientes
  hasPendingChanges(): boolean {
    return this.pendingSave !== null || this.saveQueue.length > 0;
  }

  // Verificar si está guardando
  isSavingNow(): boolean {
    return this.isSaving;
  }

  // Cancelar guardado pendiente
  cancelPending(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.pendingSave = null;

    // Rechazar todos los pendientes
    this.saveQueue.forEach(({ reject }) => {
      reject(new Error('Guardado cancelado'));
    });
    this.saveQueue = [];

    this.emit('save-cancelled', {});
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Limpieza
  destroy(): void {
    this.cancelPending();
    this.listeners.clear();
  }
}

// Singleton instance
export const saveManager = SaveManager.getInstance();
