// Store centralizado para el estado del programa
import type { 
  ProgramState, 
  UserAssignment, 
  UserData, 
  WeekData, 
  ValidationState,
  NotificationData,
  WeekDay,
  Turno,
  NotificationType
} from '../types/program';

export class ProgramStore {
  private state: ProgramState;
  private listeners: Map<string, Function[]> = new Map();
  private userNameMappingCache: Record<string, string> | null = null;

  constructor() {
    this.state = {
      currentDate: new Date(),
      weekDates: [],
      users: new Map(),
      weekData: {},
      validationStates: new Map(),
      notifications: [],
      isLoading: false,
      hasChanges: false
    };
  }

  // Gestión de estado
  getState(): Readonly<ProgramState> {
    return { ...this.state };
  }

  updateState(updates: Partial<ProgramState>) {
    this.state = { ...this.state, ...updates };
    this.emit('state-changed', this.state);
  }

  // Gestión de fecha y semana
  setCurrentDate(date: Date) {
    this.state.currentDate = date;
    this.state.weekDates = this.calculateWeekDates(date);
    this.emit('week-changed', { date });
  }

  private calculateWeekDates(currentDate: Date): Date[] {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  // Gestión de usuarios
  setUsers(users: UserData[]) {
    this.state.users.clear();
    users.forEach(user => {
      this.state.users.set(user.userName, user);
    });
    this.emit('users-loaded', users);
  }

  getUser(userName: string): UserData | undefined {
    return this.state.users.get(userName);
  }

  async getUserFullName(userName: string): Promise<string> {
    try {
      // Usar cache si está disponible
      if (!this.userNameMappingCache) {
        const response = await fetch('/api/getUsersNameMapping.json');
        const data = await response.json();
        this.userNameMappingCache = data.mapping || {};
      }
      return this.userNameMappingCache[userName] || userName;
    } catch (error) {
      console.error('Error fetching user name mapping:', error);
      return userName;
    }
  }

  // Gestión de asignaciones
  setWeekData(weekData: WeekData) {
    this.state.weekData = { ...weekData };
    this.state.hasChanges = false;
    this.emit('week-data-loaded', weekData);
  }

  assignUser(assignment: UserAssignment) {
    const key = this.getAssignmentKey(assignment.day, assignment.turno, assignment.index);
    this.state.weekData[key] = assignment.userName;
    this.state.hasChanges = true;
    this.emit('user-assigned', assignment);
  }

  removeUser(day: WeekDay, turno: Turno, index: number) {
    const key = this.getAssignmentKey(day, turno, index);
    delete this.state.weekData[key];
    this.state.hasChanges = true;
    this.emit('user-removed', { day, turno, index });
  }

  getAssignment(day: WeekDay, turno: Turno, index: number): string | undefined {
    const key = this.getAssignmentKey(day, turno, index);
    return this.state.weekData[key];
  }

  private getAssignmentKey(day: WeekDay, turno: Turno, index: number): string {
    return `${day}-${turno}-${index}`;
  }

  // Gestión de validaciones
  setValidationState(day: WeekDay, turno: Turno, index: number, validationState: ValidationState) {
    const key = this.getAssignmentKey(day, turno, index);
    this.state.validationStates.set(key, validationState);
    this.emit('validation-updated', { key, validationState });
  }

  getValidationState(day: WeekDay, turno: Turno, index: number): ValidationState | undefined {
    const key = this.getAssignmentKey(day, turno, index);
    return this.state.validationStates.get(key);
  }

  clearValidationStates() {
    this.state.validationStates.clear();
    this.emit('validations-cleared');
  }

  // Gestión de notificaciones
  addNotification(type: NotificationType, message: string): NotificationData {
    const notification: NotificationData = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date(),
      read: false
    };

    this.state.notifications.unshift(notification);

    // Mantener solo las últimas 50 notificaciones
    if (this.state.notifications.length > 50) {
      this.state.notifications = this.state.notifications.slice(0, 50);
    }

    this.emit('notification-added', notification);
    return notification;
  }

  markNotificationAsRead(id: number) {
    const notification = this.state.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.emit('notification-updated', notification);
    }
  }

  clearNotifications() {
    this.state.notifications = [];
    this.emit('notifications-cleared');
  }

  getUnreadNotificationsCount(): number {
    return this.state.notifications.filter(n => !n.read).length;
  }

  // Utilidades
  hasChanges(): boolean {
    return this.state.hasChanges;
  }

  setLoading(isLoading: boolean) {
    this.state.isLoading = isLoading;
    this.emit('loading-changed', isLoading);
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

  // Cleanup
  destroy() {
    this.listeners.clear();
    this.state.users.clear();
    this.state.validationStates.clear();
    this.userNameMappingCache = null;
  }
}

// Singleton instance
export const programStore = new ProgramStore();