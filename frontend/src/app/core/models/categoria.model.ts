export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  creado_en: string;
}

export interface CategoriaForm {
  nombre: string;
  descripcion?: string;
}
