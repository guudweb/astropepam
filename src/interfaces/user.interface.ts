export interface User {
    user_id:        number;
    nombre:         string;
    contraseña:     string;
    telefono:       string;
    correo:         string;
    congregacion:   string;
    sexo:           Sexo;
    role:           Role;
    estado_civil:   EstadoCivil;
    nombre_conyuge: null;
    privilegios:    null;
    disponibilidad: string;
    isActive:       boolean;
    userName:       string;
}

export enum EstadoCivil {
    Soltero = "soltero",
}

export enum Role {
    User = "user",
    Admin = "admin",
}

export enum Sexo {
    F = "F",
    M = "M",
}
