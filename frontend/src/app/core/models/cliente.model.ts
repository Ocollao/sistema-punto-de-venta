export interface Cliente {
  id: number;
  rut?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  activo: boolean;
  creado_en: string;
}

export interface ClienteForm {
  rut?: string;
  nombre: string;
  email?: string;
  telefono?: string;
}
