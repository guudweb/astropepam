// Sistema de manejo de errores para el frontend

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  source?: string;
}

export interface NotificationOptions {
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

/**
 * Clase para manejar errores de manera centralizada
 */
export class ErrorHandler {
  private static notificationSystem: any = null;

  /**
   * Inicializa el sistema de notificaciones (Notyf)
   */
  static initializeNotifications() {
    if (typeof window !== 'undefined' && (window as any).Notyf) {
      this.notificationSystem = new (window as any).Notyf({
        duration: 4000,
        position: {
          x: 'right',
          y: 'top',
        },
        types: [
          {
            type: 'warning',
            background: 'orange',
            icon: '⚠️'
          },
          {
            type: 'info',
            background: 'blue',
            icon: 'ℹ️'
          }
        ]
      });
    }
  }

  /**
   * Maneja errores de API
   */
  static async handleApiError(response: Response, context?: string): Promise<ErrorInfo> {
    let errorData: any = {};
    
    try {
      const text = await response.text();
      if (text) {
        errorData = JSON.parse(text);
      }
    } catch (e) {
      errorData = { error: 'Error de formato en la respuesta del servidor' };
    }

    const errorInfo: ErrorInfo = {
      message: errorData.error || `Error ${response.status}: ${response.statusText}`,
      code: response.status.toString(),
      details: errorData.details || errorData,
      timestamp: new Date(),
      source: context || 'API'
    };

    // Log del error para debugging
    console.error(`[${errorInfo.source}] Error:`, errorInfo);

    // Mostrar notificación al usuario
    this.showNotification({
      type: 'error',
      title: context ? `Error en ${context}` : 'Error',
      message: errorInfo.message,
      persistent: response.status >= 500 // Errores del servidor son persistentes
    });

    return errorInfo;
  }

  /**
   * Maneja errores de JavaScript
   */
  static handleJavaScriptError(error: Error, context?: string): ErrorInfo {
    const errorInfo: ErrorInfo = {
      message: error.message,
      details: {
        stack: error.stack,
        name: error.name
      },
      timestamp: new Date(),
      source: context || 'JavaScript'
    };

    console.error(`[${errorInfo.source}] JavaScript Error:`, errorInfo);

    this.showNotification({
      type: 'error',
      title: 'Error de aplicación',
      message: 'Ha ocurrido un error inesperado. Por favor, recarga la página.',
      persistent: true
    });

    return errorInfo;
  }

  /**
   * Maneja errores de validación
   */
  static handleValidationError(errors: string[], context?: string): ErrorInfo {
    const errorInfo: ErrorInfo = {
      message: errors.length === 1 ? errors[0] : `${errors.length} errores de validación`,
      details: errors,
      timestamp: new Date(),
      source: context || 'Validation'
    };

    console.warn(`[${errorInfo.source}] Validation Error:`, errorInfo);

    // Mostrar todos los errores o un resumen
    const message = errors.length <= 3 
      ? errors.join('\n') 
      : `${errors.slice(0, 2).join('\n')}\n... y ${errors.length - 2} más`;

    this.showNotification({
      type: 'warning',
      title: 'Errores de validación',
      message,
      duration: 6000
    });

    return errorInfo;
  }

  /**
   * Muestra notificación de éxito
   */
  static showSuccess(message: string, title?: string, duration?: number) {
    this.showNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  /**
   * Muestra notificación de advertencia
   */
  static showWarning(message: string, title?: string, duration?: number) {
    this.showNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  /**
   * Muestra notificación informativa
   */
  static showInfo(message: string, title?: string, duration?: number) {
    this.showNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  /**
   * Función privada para mostrar notificaciones
   */
  private static showNotification(options: NotificationOptions) {
    if (this.notificationSystem) {
      const config: any = {
        message: options.message,
        type: options.type
      };

      if (options.duration) config.duration = options.duration;
      if (options.persistent) config.duration = 0;

      this.notificationSystem.open(config);
    } else {
      // Fallback a alert nativo si Notyf no está disponible
      const prefix = options.title ? `${options.title}: ` : '';
      alert(prefix + options.message);
    }
  }

  /**
   * Wrapper para operaciones async con manejo de errores
   */
  static async wrapAsync<T>(
    operation: () => Promise<T>,
    context: string,
    onSuccess?: (result: T) => void,
    onError?: (error: ErrorInfo) => void
  ): Promise<T | null> {
    try {
      const result = await operation();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorInfo = error instanceof Error 
        ? this.handleJavaScriptError(error, context)
        : this.handleJavaScriptError(new Error(String(error)), context);
      
      if (onError) {
        onError(errorInfo);
      }
      
      return null;
    }
  }

  /**
   * Crea un manejador de errores para fetch con retry
   */
  static createFetchWithRetry(maxRetries: number = 3, delay: number = 1000) {
    return async (url: string, options?: RequestInit): Promise<Response> => {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, options);
          
          if (!response.ok && response.status >= 500 && attempt < maxRetries) {
            // Retry en errores del servidor
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
            continue;
          }
          
          return response;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
            continue;
          }
        }
      }
      
      throw lastError!;
    };
  }
}

/**
 * Hook de React para manejo de errores (si se usa React)
 */
export const useErrorHandler = () => {
  return {
    handleApiError: ErrorHandler.handleApiError.bind(ErrorHandler),
    handleJavaScriptError: ErrorHandler.handleJavaScriptError.bind(ErrorHandler),
    handleValidationError: ErrorHandler.handleValidationError.bind(ErrorHandler),
    showSuccess: ErrorHandler.showSuccess.bind(ErrorHandler),
    showWarning: ErrorHandler.showWarning.bind(ErrorHandler),
    showInfo: ErrorHandler.showInfo.bind(ErrorHandler),
    wrapAsync: ErrorHandler.wrapAsync.bind(ErrorHandler)
  };
};