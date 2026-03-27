export interface ConfigNegocio {
  id: number;
  nombre: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  mensaje_pie?: string;
}

export interface ConfigNegocioUpdate {
  nombre?: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  mensaje_pie?: string;
}
