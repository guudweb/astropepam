// Tipos estrictos para el sistema de programas

export type WeekDay = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type Turno = 'T1' | 'T2' | 'T3' | 'T4';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface UserAssignment {
  day: WeekDay;
  turno: Turno;
  index: number;
  userName: string;
  fullName?: string;
  date: string; // ISO date string
}

export interface ValidationState {
  userName: string;
  hasRestrictions: boolean;
  hasWarnings: boolean;
  canParticipate: boolean;
}

export interface ValidationResult {
  canParticipate: boolean;
  warnings: string[];
  restrictions: string[];
  icon: string;
  rulesDescription?: string[];
}

export interface ParticipationRule {
  type: 'max_per_month' | 'max_per_week' | 'specific_weeks' | 'alternating_weeks' | 'weekly_availability';
  value: number | number[];
  description: string;
}

export interface UserData {
  id: number;
  userName: string;
  nombre: string;
  telefono?: string;
  disponibilidad?: Record<WeekDay, Turno[]>;
  participation_rules?: ParticipationRule[];
  privilegios?: string[];
  congregacion?: {
    id: number;
    nombre: string;
  };
  canParticipate?: boolean;
  validationMessage?: string;
}

export interface WeekData {
  [key: string]: string; // Format: "${day}-${turno}-${index}" = userName
}

export interface NotificationData {
  id: number;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ProgramState {
  currentDate: Date;
  weekDates: Date[];
  users: Map<string, UserData>;
  weekData: WeekData;
  validationStates: Map<string, ValidationState>;
  notifications: NotificationData[];
  isLoading: boolean;
  hasChanges: boolean;
}

// Eventos del sistema
export interface ProgramEvents {
  'week-changed': { date: Date };
  'user-assigned': UserAssignment;
  'user-removed': { day: WeekDay; turno: Turno; index: number };
  'validation-completed': { assignment: UserAssignment; result: ValidationResult };
  'data-saved': { success: boolean; error?: string };
  'notification-added': NotificationData;
}

// Configuración
export interface ProgramConfig {
  daysPerWeek: number;
  turnosPerDay: number;
  slotsPerTurno: number;
  validationDebounceMs: number;
  notificationDurationMs: number;
  maxNotifications: number;
  cacheExpirationMs: number;
}