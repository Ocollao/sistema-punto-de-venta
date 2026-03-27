export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  creado_en: string;
}

export interface UsuarioCreate {
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

export interface UsuarioUpdate {
  nombre?: string;
  rol?: string;
  activo?: boolean;
  password?: string;
}
