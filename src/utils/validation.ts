// Utilidades de validación y sanitización
import { getSession } from "auth-astro/server";
import type { APIContext } from "astro";

/**
 * Sanitiza una cadena de texto eliminando caracteres peligrosos
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Eliminar scripts
    .replace(/<[^>]*>/g, '') // Eliminar todas las etiquetas HTML
    .replace(/[<>&"']/g, (char) => { // Escapar caracteres especiales
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[char] || char;
    });
};

/**
 * Valida que una fecha sea válida
 */
export const validateDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  
  // Verificar que la fecha no sea muy antigua o muy futura
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  if (date < oneYearAgo || date > oneYearFromNow) {
    return null;
  }
  
  return date;
};

/**
 * Valida que un userName sea válido
 */
export const validateUserName = (userName: string): boolean => {
  if (!userName || typeof userName !== 'string') return false;
  
  const trimmedName = userName.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100) return false;
  
  // UserName debe contener solo letras, números, espacios y algunos caracteres especiales
  // Permitir múltiples espacios para nombres compuestos
  const userNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-_.()]+$/;
  return userNameRegex.test(trimmedName);
};

/**
 * Valida parámetros de URL comunes
 */
export const validateUrlParams = (params: URLSearchParams, requiredParams: string[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const param of requiredParams) {
    const value = params.get(param);
    if (!value || value.trim() === '') {
      errors.push(`El parámetro '${param}' es requerido`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Valida estructura de datos de semana
 */
export const validateWeekData = (weekData: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!weekData || typeof weekData !== 'object') {
    errors.push('weekData debe ser un objeto válido');
    return { valid: false, errors };
  }
  
  const validDays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const validTurnos = ['T1', 'T2', 'T3', 'T4']; // Incluir T4
  
  // Validar estructura plana con claves como "dia-turno-indice"
  Object.keys(weekData).forEach(key => {
    const userName = weekData[key];
    
    // Parsear clave en formato "dia-turno-indice"
    const parts = key.split('-');
    if (parts.length !== 3) {
      errors.push(`Formato de clave inválido: ${key}. Debe ser "dia-turno-indice"`);
      return;
    }
    
    const [day, turno, index] = parts;
    
    // Validar día
    if (!validDays.includes(day.toLowerCase())) {
      errors.push(`Día inválido: ${day} en clave ${key}`);
    }
    
    // Validar turno
    if (!validTurnos.includes(turno)) {
      errors.push(`Turno inválido: ${turno} en clave ${key}`);
    }
    
    // Validar índice
    const indexNum = parseInt(index);
    if (isNaN(indexNum) || indexNum < 0 || indexNum > 3) {
      errors.push(`Índice inválido: ${index} en clave ${key}. Debe ser 0-3`);
    }
    
    // Validar userName si existe
    if (userName && typeof userName === 'string') {
      if (!validateUserName(userName)) {
        errors.push(`UserName inválido: ${userName} en ${key}`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Valida reglas de participación
 */
export const validateParticipationRules = (rules: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(rules)) {
    errors.push('Las reglas de participación deben ser un array');
    return { valid: false, errors };
  }
  
  const validTypes = ['max_per_month', 'max_per_week', 'specific_weeks', 'alternating_weeks'];
  
  rules.forEach((rule, index) => {
    if (!rule || typeof rule !== 'object') {
      errors.push(`Regla ${index} debe ser un objeto válido`);
      return;
    }
    
    if (!validTypes.includes(rule.type)) {
      errors.push(`Tipo de regla inválido en regla ${index}: ${rule.type}`);
    }
    
    if (rule.type === 'max_per_month' || rule.type === 'max_per_week') {
      if (!Number.isInteger(rule.value) || rule.value < 1 || rule.value > 31) {
        errors.push(`Valor inválido en regla ${index}: debe ser un número entero entre 1 y 31`);
      }
    }
    
    if (rule.type === 'specific_weeks') {
      const weeks = Array.isArray(rule.value) ? rule.value : [rule.value];
      if (!weeks.every((w: any) => Number.isInteger(w) && w >= 1 && w <= 5)) {
        errors.push(`Semanas específicas inválidas en regla ${index}: deben ser números entre 1 y 5`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Función helper para crear respuestas de error estandarizadas
 */
export const createErrorResponse = (message: string, status: number = 400, details?: any) => {
  return new Response(
    JSON.stringify({
      error: message,
      ...(details && { details })
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
};

/**
 * Función helper para crear respuestas de éxito estandarizadas
 */
export const createSuccessResponse = (data: any, status: number = 200) => {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
};

/**
 * Verifica si el usuario está autenticado
 * Retorna la sesión si está autenticado, null si no
 */
export const requireAuth = async (context: APIContext): Promise<{ session: any; error?: Response }> => {
  try {
    const session = await getSession(context.request);

    if (!session || !session.user) {
      return {
        session: null,
        error: createErrorResponse("No autorizado. Debe iniciar sesión.", 401)
      };
    }

    return { session };
  } catch (error) {
    console.error("Error verificando autenticación:", error);
    return {
      session: null,
      error: createErrorResponse("Error de autenticación", 500)
    };
  }
};

/**
 * Verifica si el usuario es administrador
 * Retorna la sesión si es admin, error si no
 */
export const requireAdmin = async (context: APIContext): Promise<{ session: any; error?: Response }> => {
  const { session, error } = await requireAuth(context);

  if (error) return { session: null, error };

  if (session?.user?.role !== "admin") {
    return {
      session: null,
      error: createErrorResponse("Acceso denegado. Se requieren permisos de administrador.", 403)
    };
  }

  return { session };
};

/**
 * Wrapper para proteger endpoints de API que requieren autenticación
 */
export const withAuth = (handler: (context: APIContext, session: any) => Promise<Response>) => {
  return async (context: APIContext): Promise<Response> => {
    const { session, error } = await requireAuth(context);
    if (error) return error;
    return handler(context, session);
  };
};

/**
 * Wrapper para proteger endpoints de API que requieren rol admin
 */
export const withAdmin = (handler: (context: APIContext, session: any) => Promise<Response>) => {
  return async (context: APIContext): Promise<Response> => {
    const { session, error } = await requireAdmin(context);
    if (error) return error;
    return handler(context, session);
  };
};