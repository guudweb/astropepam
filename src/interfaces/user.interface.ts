export interface User {
    user_id:        number;
    nombre:         string;
    contraseña:     string;
    telefono:       string;
    correo:         string;
    congregacion:   Congregacion;
    sexo:           string;
    role:           string;
    estado_civil:   string;
    nombre_conyuge: null;
    privilegios:    null;
    disponibilidad: string;
    isActive:       boolean;
    userName:       string;
}

export interface Congregacion {
    id:           number;
    nombre:       string;
    diaReunion:   string;
    turnoReunion: string;
}
