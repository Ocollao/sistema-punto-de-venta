export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  categoria_id?: number;
  categoria_nombre?: string;
  activo: boolean;
  creado_en: string;
}

export interface ProductoForm {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  categoria_id?: number | null;
}
