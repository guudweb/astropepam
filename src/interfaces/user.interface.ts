export interface User {
  user_id: number;
  nombre: string;
  contraseña: string;
  telefono: string;
  correo: string;
  congregacion: Congregacion;
  sexo: string;
  role: string;
  estado_civil: string;
  nombre_conyuge: null;
  privilegios: null;
  disponibilidad: string;
  isActive: boolean;
  userName: string;
  service_link: boolean;
  descripcion?: string;
  participation_rules?: ParticipationRule[];
}

export interface ParticipationRule {
  type: 'max_per_month' | 'max_per_week' | 'specific_weeks' | 'alternating_weeks';
  value: number | number[];
  description: string;
}

export interface Congregacion {
  id: number;
  nombre: string;
  diaReunion: string;
  turnoReunion: string;
}
