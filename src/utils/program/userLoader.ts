// Utilidades para carga de usuarios
import type { UserData, WeekDay, Turno } from '../../types/program';

export class UserLoader {
  private static cache: UserData[] | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static async loadAllUsers(activeOnly: boolean = true): Promise<UserData[]> {
    try {
      // Verificar cache
      if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
        return this.cache;
      }

      const response = await fetch(`/api/getUsersForProgram.json?activeOnly=${activeOnly}`);
      if (!response.ok) {
        throw new Error('Error loading users');
      }

      const { data: users } = await response.json();
      
      // Actualizar cache
      this.cache = users;
      this.cacheTimestamp = Date.now();
      
      return users;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  static filterUsersForDayTurno(users: UserData[], day: WeekDay, turno: Turno): UserData[] {
    return users.filter(user => {
      if (!user.disponibilidad) return false;
      
      try {
        const disponibilidad = typeof user.disponibilidad === "string"
          ? JSON.parse(user.disponibilidad)
          : user.disponibilidad;
          
        return disponibilidad[day] && disponibilidad[day].includes(turno);
      } catch {
        return false;
      }
    });
  }

  static async loadUsersForSelect(day: WeekDay, turno: Turno): Promise<UserData[]> {
    const allUsers = await this.loadAllUsers();
    return this.filterUsersForDayTurno(allUsers, day, turno);
  }

  static formatUserForDisplay(user: UserData): string {
    let displayName = user.nombre;
    
    // Agregar badges de privilegios
    if (user.privilegios && Array.isArray(user.privilegios)) {
      const isCapitan = user.privilegios.some(p => p && p.toLowerCase() === 'capitan');
      const otherPrivileges = user.privilegios
        .filter(p => p && p.toLowerCase() !== 'capitan')
        .map(p => p.charAt(0).toUpperCase())
        .join("");
      
      if (isCapitan) {
        displayName = `[C] ${user.nombre}`;
      }
      if (otherPrivileges) {
        displayName += ` [${otherPrivileges}]`;
      }
    }
    
    return displayName;
  }

  static getStatusIcon(user: UserData): string {
    if (user.canParticipate === false) {
      return '🚫';
    } else if (user.validationMessage) {
      return '⚠️';
    } else if (user.participation_rules && Array.isArray(user.participation_rules) && user.participation_rules.length > 0) {
      return '⚠️';
    } else {
      return '✅';
    }
  }

  static clearCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  static async searchUsers(query: string, users?: UserData[]): Promise<UserData[]> {
    if (!users) {
      users = await this.loadAllUsers();
    }
    
    const searchTerm = query.toLowerCase();
    return users.filter(user => 
      user.nombre.toLowerCase().includes(searchTerm) ||
      user.userName.toLowerCase().includes(searchTerm)
    );
  }
}